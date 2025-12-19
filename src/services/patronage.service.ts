/**
 * Patronage & Fan Funding Service
 * Enables artists to earn via subscriptions, tips, goals, and exclusive content
 *
 * Features:
 * - Monthly patron subscriptions (4 tiers)
 * - One-time tips during streams
 * - Goal-based funding campaigns
 * - Exclusive patron-only streams and content
 * - Automatic royalty credit
 *
 * Integrates with: Stripe, Royalties, Forensics, WebSocket
 */

import { prisma } from '../prisma';
import { logForensicEvent } from './forensics.service';
import { creditRoyalty } from './royalty.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface PatronTier {
  name: string;
  monthlyUSD: number;
  perks: string[];
  color: 'inferno' | 'purgatorio' | 'paradiso';
}

export const PATRON_TIERS: Record<string, PatronTier> = {
  fan: {
    name: 'Fan',
    monthlyUSD: 5,
    perks: ['Behind-the-scenes', 'Monthly thank-you'],
    color: 'purgatorio',
  },
  supporter: {
    name: 'Supporter',
    monthlyUSD: 15,
    perks: [
      'All Fan perks',
      'Exclusive monthly livestream',
      'Discord access',
      'Name in credits',
    ],
    color: 'purgatorio',
  },
  vip: {
    name: 'VIP',
    monthlyUSD: 50,
    perks: [
      'All Supporter perks',
      'Private chat',
      'Early access to new content',
      'Monthly 1-on-1 call',
      'Custom video shoutout',
    ],
    color: 'paradiso',
  },
  elite: {
    name: 'Elite',
    monthlyUSD: 250,
    perks: [
      'All VIP perks',
      'Collaborative content ideas',
      'Producer credits',
      'Quarterly meet-ups',
      'Priority support',
      'Revenue share (2%)',
    ],
    color: 'inferno',
  },
};

export class PatronageService {
  /**
   * Create or update a patron subscription
   */
  async subscribeToArtist(
    fanId: string,
    artistId: string,
    tierName: string
  ): Promise<any> {
    try {
      // Verify tier exists
      if (!PATRON_TIERS[tierName]) {
        throw new Error(`Invalid tier: ${tierName}`);
      }

      const tier = PATRON_TIERS[tierName];

      // Create Stripe customer if needed
      let fan = await prisma.user.findUnique({ where: { id: fanId } });
      if (!fan) throw new Error('Fan not found');

      let stripeCustomerId = fan.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: fan.email,
          metadata: { mhcUserId: fanId },
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: fanId },
          data: { stripeCustomerId },
        });
      }

      // Cancel existing subscription
      const existing = await prisma.patronSubscription.findUnique({
        where: {
          fanId_artistId: { fanId, artistId },
        },
      });

      if (existing && existing.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(existing.stripeSubscriptionId);
      }

      // Create price if not exists
      const artist = await prisma.user.findUnique({
        where: { id: artistId },
      });
      if (!artist) throw new Error('Artist not found');

      let product = await stripe.products.search({
        query: `metadata['mhcArtistId']:'${artistId}'`,
      });

      if (product.data.length === 0) {
        const newProduct = await stripe.products.create({
          name: `${artist.displayName} Patrons`,
          metadata: { mhcArtistId: artistId },
        });
        product.data = [newProduct];
      }

      const prices = await stripe.prices.search({
        query: `product:'${product.data[0].id}' AND metadata['tier']:'${tierName}'`,
      });

      let priceId: string;
      if (prices.data.length === 0) {
        const newPrice = await stripe.prices.create({
          product: product.data[0].id,
          type: 'recurring',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          unit_amount: Math.round(tier.monthlyUSD * 100),
          currency: 'usd',
          metadata: { tier: tierName },
        });
        priceId = newPrice.id;
      } else {
        priceId = prices.data[0].id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Save to database
      const dbSubscription = await prisma.patronSubscription.upsert({
        where: {
          fanId_artistId: { fanId, artistId },
        },
        update: {
          tier: tierName,
          stripeSubscriptionId: subscription.id,
          status: 'active',
          renewsAt: new Date(subscription.current_period_end * 1000),
        },
        create: {
          fanId,
          artistId,
          tier: tierName,
          stripeSubscriptionId: subscription.id,
          status: 'active',
          monthlyAmount: tier.monthlyUSD,
          renewsAt: new Date(subscription.current_period_end * 1000),
        },
      });

      // Log to forensics
      await logForensicEvent(
        'PATRON_SUBSCRIBED',
        'patronSubscription',
        dbSubscription.id,
        fanId,
        {
          artistId,
          tier: tierName,
          monthlyAmount: tier.monthlyUSD,
        }
      );

      return {
        subscription: dbSubscription,
        paymentIntent: (subscription.latest_invoice as any)?.payment_intent,
      };
    } catch (error) {
      throw new Error(`Failed to subscribe: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel patron subscription
   */
  async cancelSubscription(
    fanId: string,
    artistId: string
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      const subscription = await prisma.patronSubscription.findUnique({
        where: {
          fanId_artistId: { fanId, artistId },
        },
      });

      if (!subscription) {
        return { success: false, reason: 'No active subscription found' };
      }

      // Cancel Stripe subscription
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      // Update database
      await prisma.patronSubscription.update({
        where: {
          fanId_artistId: { fanId, artistId },
        },
        data: { status: 'cancelled' },
      });

      // Log to forensics
      await logForensicEvent(
        'PATRON_CANCELLED',
        'patronSubscription',
        subscription.id,
        fanId,
        { artistId }
      );

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to cancel: ${(error as Error).message}`);
    }
  }

  /**
   * Send one-time tip to artist
   */
  async sendTip(fanId: string, artistId: string, amountUSD: number): Promise<any> {
    try {
      // Create payment intent
      const fan = await prisma.user.findUnique({ where: { id: fanId } });
      if (!fan) throw new Error('Fan not found');

      let stripeCustomerId = fan.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: fan.email,
          metadata: { mhcUserId: fanId },
        });
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: fanId },
          data: { stripeCustomerId },
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        customer: stripeCustomerId,
        amount: Math.round(amountUSD * 100),
        currency: 'usd',
        metadata: {
          mhcFanId: fanId,
          mhcArtistId: artistId,
          type: 'tip',
        },
      });

      // Create database record
      const tip = await prisma.tip.create({
        data: {
          fanId,
          artistId,
          amountUSD,
          stripePaymentId: paymentIntent.id,
          status: 'pending',
        },
      });

      // Log to forensics
      await logForensicEvent('TIP_INITIATED', 'tip', tip.id, fanId, {
        artistId,
        amountUSD,
        paymentId: paymentIntent.id,
      });

      return { tip, paymentIntent };
    } catch (error) {
      throw new Error(`Failed to send tip: ${(error as Error).message}`);
    }
  }

  /**
   * Confirm tip after payment succeeds
   */
  async confirmTip(paymentIntentId: string): Promise<void> {
    try {
      const tip = await prisma.tip.findUnique({
        where: { stripePaymentId: paymentIntentId },
      });

      if (!tip) throw new Error('Tip not found');

      // Update status
      await prisma.tip.update({
        where: { id: tip.id },
        data: { status: 'confirmed', confirmedAt: new Date() },
      });

      // Credit artist's royalty account
      await creditRoyalty(
        tip.artistId,
        Math.round(tip.amountUSD * 100 * 0.9), // 90% after platform fee
        'livestream_tip'
      );

      // Log to forensics
      await logForensicEvent('TIP_COMPLETED', 'tip', tip.id, tip.fanId, {
        artistId: tip.artistId,
        amountUSD: tip.amountUSD,
      });
    } catch (error) {
      throw new Error(`Failed to confirm tip: ${(error as Error).message}`);
    }
  }

  /**
   * Create funding goal for artist
   */
  async createGoal(
    artistId: string,
    title: string,
    targetUSD: number,
    description?: string,
    deadline?: Date
  ): Promise<any> {
    try {
      const goal = await prisma.artistGoal.create({
        data: {
          artistId,
          title,
          targetUSD,
          description,
          deadline,
          raised: 0,
        },
      });

      await logForensicEvent('GOAL_CREATED', 'artistGoal', goal.id, artistId, {
        title,
        targetUSD,
      });

      return goal;
    } catch (error) {
      throw new Error(`Failed to create goal: ${(error as Error).message}`);
    }
  }

  /**
   * Get artist's active goals
   */
  async getArtistGoals(artistId: string): Promise<any[]> {
    return await prisma.artistGoal.findMany({
      where: {
        artistId,
        deadline: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get patron-only stream access control
   */
  async canAccessPatronStream(fanId: string, streamId: string): Promise<boolean> {
    try {
      // Get stream details
      const stream = await prisma.livestream.findUnique({
        where: { id: streamId },
      });

      if (!stream) return false;
      if (!stream.patronOnly) return true; // Public stream

      // Check if fan is patron of the artist at required tier
      const subscription = await prisma.patronSubscription.findUnique({
        where: {
          fanId_artistId: { fanId, artistId: stream.creatorId },
        },
      });

      return subscription?.status === 'active';
    } catch {
      return false;
    }
  }

  /**
   * Get patron-only content for user
   */
  async getPatronContent(fanId: string): Promise<any[]> {
    try {
      // Get all subscriptions for this fan
      const subscriptions = await prisma.patronSubscription.findMany({
        where: { fanId, status: 'active' },
      });

      const artistIds = subscriptions.map((s) => s.artistId);

      // Get exclusive content from subscribed artists
      const content = await prisma.video.findMany({
        where: {
          creatorId: { in: artistIds },
          patronOnly: true,
        },
        include: { creator: true },
        orderBy: { createdAt: 'desc' },
      });

      return content;
    } catch (error) {
      throw new Error(`Failed to fetch patron content: ${(error as Error).message}`);
    }
  }

  /**
   * Get patron list for artist
   */
  async getArtistPatrons(artistId: string): Promise<any[]> {
    try {
      const patrons = await prisma.patronSubscription.findMany({
        where: { artistId, status: 'active' },
        include: { fan: { select: { id: true, displayName: true, avatar: true } } },
        orderBy: { tier: 'desc' },
      });

      return patrons;
    } catch (error) {
      throw new Error(`Failed to fetch patrons: ${(error as Error).message}`);
    }
  }

  /**
   * Get artist's patron earnings summary
   */
  async getPatronEarnings(
    artistId: string,
    monthsBack: number = 12
  ): Promise<{
    total: number;
    subscriptions: number;
    tips: number;
    byTier: Record<string, number>;
  }> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      // Get subscription revenue
      const subscriptions = await prisma.patronSubscription.aggregate({
        where: {
          artistId,
          status: 'active',
        },
        _sum: { monthlyAmount: true },
      });

      const monthlySubscriptions = (subscriptions._sum.monthlyAmount || 0) * monthsBack;

      // Get tips
      const tips = await prisma.tip.aggregate({
        where: {
          artistId,
          confirmedAt: { gte: startDate },
        },
        _sum: { amountUSD: true },
      });

      const tipAmount = tips._sum.amountUSD || 0;

      // Break down by tier
      const byTier: Record<string, number> = {};
      for (const tierName of Object.keys(PATRON_TIERS)) {
        const tierSubs = await prisma.patronSubscription.aggregate({
          where: {
            artistId,
            tier: tierName,
            status: 'active',
          },
          _sum: { monthlyAmount: true },
        });
        byTier[tierName] = (tierSubs._sum.monthlyAmount || 0) * monthsBack;
      }

      return {
        total: monthlySubscriptions + tipAmount,
        subscriptions: monthlySubscriptions,
        tips: tipAmount,
        byTier,
      };
    } catch (error) {
      throw new Error(`Failed to calculate earnings: ${(error as Error).message}`);
    }
  }

  /**
   * Handle Stripe webhook for subscription updates
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          // Update renew date
          const mhcSub = await prisma.patronSubscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (mhcSub) {
            await prisma.patronSubscription.update({
              where: { id: mhcSub.id },
              data: {
                renewsAt: new Date(subscription.current_period_end * 1000),
              },
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const mhcSub = await prisma.patronSubscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (mhcSub) {
            await prisma.patronSubscription.update({
              where: { id: mhcSub.id },
              data: { status: 'cancelled' },
            });
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const intent = event.data.object as Stripe.PaymentIntent;
          if (intent.metadata?.type === 'tip') {
            await this.confirmTip(intent.id);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
    }
  }
}

export const patronageService = new PatronageService();
