/**
 * Stripe Subscription Billing Routes - Production Grade
 * Handles checkout, customer portal, webhooks, lifecycle management
 *
 * Features:
 * - Stripe Checkout sessions
 * - Customer portal for self-service (upgrade/downgrade/cancel)
 * - Webhook event processing (create/update/delete subscriptions)
 * - Subscription sync to database
 * - PCI-DSS compliant (no card storage)
 * - Role-based feature unlocking
 *
 * Integrates with: Stripe, Forensics, Royalties
 */

import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../prisma';
import { logForensicEvent } from '../services/forensics.service';
import { requireAuth } from '../middleware/auth.middleware';
import express from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-02-15' as any,
});

const router = Router();

// Stripe price IDs from environment
const STRIPE_PRICES = {
  fan: process.env.STRIPE_PRICE_FAN || 'price_fan_xxx',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_xxx',
  studio: process.env.STRIPE_PRICE_STUDIO || 'price_studio_xxx',
};

/**
 * POST /api/v1/billing/checkout
 * Create Stripe Checkout session
 * Requires: Authentication
 *
 * Body: { priceId: "price_xxx" }
 * Returns: { url: "https://checkout.stripe.com/..." }
 */
router.post(
  '/checkout',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { priceId } = req.body;

      // Validate price ID
      const validPrices = Object.values(STRIPE_PRICES);
      if (!validPrices.includes(priceId)) {
        return res.status(400).json({ error: 'Invalid price ID' });
      }

      // Get or create Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { stripeCustomer: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let customerId = user.stripeCustomer?.stripeId;

      if (!customerId) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName,
          metadata: {
            mhcUserId: user.id,
          },
        });

        // Save to database
        await prisma.stripeCustomer.create({
          data: {
            userId: user.id,
            stripeId: customer.id,
          },
        });

        customerId = customer.id;
      }

      // Check for existing active subscription
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: req.userId },
      });

      if (existingSub && existingSub.status === 'active') {
        return res.status(400).json({
          error: 'You already have an active subscription',
          message: 'Use the customer portal to upgrade, downgrade, or cancel',
        });
      }

      // Create Checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing?cancelled=true`,
        metadata: {
          userId: req.userId,
        },
      });

      // Log to forensics
      await logForensicEvent('CHECKOUT_SESSION_CREATED', 'subscription', session.id, req.userId, {
        priceId,
        customerId,
      });

      res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/billing/portal
 * Create Stripe Customer Portal session
 * Allows users to manage subscriptions (upgrade/downgrade/cancel)
 * Requires: Authentication
 */
router.get(
  '/portal',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      // Get Stripe customer
      const customer = await prisma.stripeCustomer.findUnique({
        where: { userId: req.userId },
      });

      if (!customer) {
        return res.status(404).json({
          error: 'No billing information found',
          message: 'Please create a subscription first',
        });
      }

      // Create Customer Portal session
      const portal = await stripe.billingPortal.sessions.create({
        customer: customer.stripeId,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
      });

      // Log to forensics
      await logForensicEvent('CUSTOMER_PORTAL_OPENED', 'subscription', customer.stripeId, req.userId, {
        customerId: customer.stripeId,
      });

      res.json({
        success: true,
        url: portal.url,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/billing/subscription
 * Get current subscription status
 * Requires: Authentication
 */
router.get(
  '/subscription',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.userId },
        include: {
          customer: {
            select: {
              stripeId: true,
              createdAt: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.json({
          success: true,
          subscription: null,
          status: 'inactive',
          message: 'No active subscription',
        });
      }

      // Determine tier from plan
      const tierMap: Record<string, string> = {};
      tierMap[STRIPE_PRICES.fan] = 'fan';
      tierMap[STRIPE_PRICES.pro] = 'pro';
      tierMap[STRIPE_PRICES.studio] = 'studio';

      const tier = tierMap[subscription.plan] || 'unknown';

      res.json({
        success: true,
        subscription: {
          id: subscription.id,
          tier,
          status: subscription.status,
          plan: subscription.plan,
          renewsAt: subscription.currentPeriodEnd,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/v1/billing/webhook
 * Stripe webhook endpoint (raw body required)
 * Handles: customer.subscription.created/updated/deleted
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'] as string;

      if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );
      } catch (err) {
        return res.status(400).json({
          error: `Webhook signature verification failed: ${(err as Error).message}`,
        });
      }

      const data = event.data.object as any;

      // Handle subscription events
      if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated'
      ) {
        // Find user by Stripe customer ID
        const customer = await prisma.stripeCustomer.findUnique({
          where: { stripeId: data.customer },
        });

        if (!customer) {
          console.warn(`Customer not found: ${data.customer}`);
          return res.json({ received: true });
        }

        // Upsert subscription
        const subscription = await prisma.subscription.upsert({
          where: { stripeSubId: data.id },
          update: {
            plan: data.items.data[0].price.id,
            status: data.status,
            currentPeriodEnd: new Date(data.current_period_end * 1000),
            updatedAt: new Date(),
          },
          create: {
            userId: customer.userId,
            stripeSubId: data.id,
            stripeCustomerId: data.customer,
            plan: data.items.data[0].price.id,
            status: data.status,
            currentPeriodEnd: new Date(data.current_period_end * 1000),
          },
        });

        // Update user tier
        const tierMap: Record<string, string> = {};
        tierMap[STRIPE_PRICES.fan] = 'fan';
        tierMap[STRIPE_PRICES.pro] = 'pro';
        tierMap[STRIPE_PRICES.studio] = 'studio';

        const tier = tierMap[subscription.plan] || 'free';

        await prisma.user.update({
          where: { id: customer.userId },
          data: { tier },
        });

        // Log to forensics
        await logForensicEvent(
          event.type === 'customer.subscription.created'
            ? 'SUBSCRIPTION_CREATED'
            : 'SUBSCRIPTION_UPDATED',
          'subscription',
          data.id,
          customer.userId,
          {
            plan: data.items.data[0].price.id,
            status: data.status,
            tier,
            renewsAt: new Date(data.current_period_end * 1000),
          }
        );
      }

      // Handle subscription cancellation
      if (event.type === 'customer.subscription.deleted') {
        // Find user by Stripe customer ID
        const customer = await prisma.stripeCustomer.findUnique({
          where: { stripeId: data.customer },
        });

        if (customer) {
          // Delete subscription
          await prisma.subscription.delete({
            where: { stripeSubId: data.id },
          });

          // Downgrade user to free
          await prisma.user.update({
            where: { id: customer.userId },
            data: { tier: 'free' },
          });

          // Log to forensics
          await logForensicEvent(
            'SUBSCRIPTION_CANCELLED',
            'subscription',
            data.id,
            customer.userId,
            {
              reason: 'User cancelled or payment failed',
              cancelledAt: new Date(),
            }
          );
        }
      }

      // Handle payment failures
      if (event.type === 'invoice.payment_failed') {
        const customer = await prisma.stripeCustomer.findUnique({
          where: { stripeId: data.customer },
        });

        if (customer) {
          await logForensicEvent(
            'PAYMENT_FAILED',
            'payment',
            data.id,
            customer.userId,
            {
              amount: data.amount_due,
              currency: data.currency,
              invoiceUrl: data.hosted_invoice_url,
            }
          );
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * GET /api/v1/billing/plans
 * Get available pricing plans
 * Public endpoint
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    // Fetch prices from Stripe (cached)
    const prices = await stripe.prices.list({
      limit: 10,
    });

    const plans = prices.data
      .filter((p) => p.type === 'recurring')
      .map((p) => ({
        id: p.id,
        name: (p.product as any).name,
        amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval,
        intervalCount: p.recurring?.interval_count,
      }));

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/v1/billing/status
 * Get billing account status
 * Requires: Authentication
 */
router.get(
  '/status',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          subscription: true,
          stripeCustomer: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        billing: {
          tier: user.tier,
          hasActiveSubscription: user.subscription?.status === 'active',
          subscription: user.subscription
            ? {
                status: user.subscription.status,
                plan: user.subscription.plan,
                renewsAt: user.subscription.currentPeriodEnd,
              }
            : null,
          customer: user.stripeCustomer
            ? {
                id: user.stripeCustomer.id,
                stripeId: user.stripeCustomer.stripeId,
              }
            : null,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
