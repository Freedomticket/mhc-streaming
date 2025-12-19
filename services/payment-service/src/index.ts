import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS, TIER_CONFIG } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Initialize Stripe (optional - can work without it for development)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'payment-service', 
    stripe: stripe ? 'enabled' : 'disabled',
    timestamp: new Date().toISOString() 
  });
});

// Get subscription tiers
app.get('/api/payments/tiers', (req, res) => {
  res.json(successResponse(TIER_CONFIG));
});

// Get current user subscription
app.get('/api/payments/subscription', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'userId is required' })
      );
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId as string },
    });
    
    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Subscription not found' })
      );
    }
    
    res.json(successResponse(subscription));
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch subscription' })
    );
  }
});

// Create or upgrade subscription
app.post('/api/payments/subscribe', async (req, res) => {
  try {
    const { userId, tier } = req.body;
    
    if (!userId || !tier) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'userId and tier are required' })
      );
    }
    
    const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    if (!tierConfig) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'Invalid tier' })
      );
    }
    
    // For development: just update the database without Stripe
    if (!stripe) {
      const subscription = await prisma.subscription.upsert({
        where: { userId },
        update: {
          tier,
          status: 'ACTIVE',
          amount: tierConfig.price,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          userId,
          tier,
          status: 'ACTIVE',
          amount: tierConfig.price,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      
      return res.json(successResponse({ subscription, message: 'Subscription activated (dev mode)' }));
    }
    
    // Production: Create Stripe checkout session
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.USER_NOT_FOUND, message: 'User not found' })
      );
    }
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tier} Subscription`,
            description: tierConfig.features.join(', '),
          },
          unit_amount: tierConfig.price,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId,
        tier,
      },
    });
    
    res.json(successResponse({ sessionId: session.id, url: session.url }));
  } catch (error: any) {
    console.error('Subscribe error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.PAYMENT_FAILED, message: error.message })
    );
  }
});

// Cancel subscription
app.post('/api/payments/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'userId is required' })
      );
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    if (!subscription) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'Subscription not found' })
      );
    }
    
    // Cancel in Stripe if configured
    if (stripe && subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
    
    // Update database
    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        status: 'CANCELED',
      },
    });
    
    res.json(successResponse(updatedSubscription));
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to cancel subscription' })
    );
  }
});

// Stripe webhook handler
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, tier } = session.metadata!;
  
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      tier: tier as any,
      status: 'ACTIVE',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId,
      tier: tier as any,
      status: 'ACTIVE',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELED',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }
}

app.listen(PORT, () => {
  console.log(`💳 Payment service running on port ${PORT}`);
  console.log(`Stripe: ${stripe ? 'enabled' : 'disabled (dev mode)'}`);
});
