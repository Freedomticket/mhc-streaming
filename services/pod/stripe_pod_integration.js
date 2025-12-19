/**
 * Stripe payment intent creation and webhook handler (Express)
 * Replace process.env.STRIPE_SECRET with your key
 */
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(bodyParser.json());

// Create payment intent for a product (price in cents)
app.post('/create-payment-intent', async (req, res) => {
  const {amount, currency='usd', metadata} = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: {enabled: true},
    metadata
  });
  res.json({clientSecret: paymentIntent.client_secret, id: paymentIntent.id});
});

// Webhook endpoint for Stripe events
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (req,res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    // fulfill order: update DB, call POD provider API (Printful/Shippo), send download link or create POD order
    console.log('Payment succeeded:', pi.id);
  }
  res.json({received:true});
});

// POD (Print-on-demand) webhook handler
app.post('/pod/webhook', express.json(), (req,res) => {
  // Validate provider signature (if provided)
  const payload = req.body;
  console.log('POD webhook:', payload);
  // Update order status in DB, notify user
  res.json({ok:true});
});

app.listen(process.env.PORT || 8082, () => console.log('POD service running'));
