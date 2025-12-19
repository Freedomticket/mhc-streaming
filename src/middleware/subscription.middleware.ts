/**
 * Subscription Middleware - Role-Based Feature Access Control
 *
 * Guards features behind subscription tiers:
 * - FREE: Basic viewing, limited uploads
 * - FAN: Support artists with tips
 * - PRO: Upload long-form, monetize, livestream
 * - STUDIO: Multi-channel, analytics, merch
 *
 * Integrates with: Billing Service, Forensics
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { logForensicEvent } from '../services/forensics.service';

export interface AuthRequest extends Request {
  userId?: string;
  tier?: string;
}

/**
 * Require any active subscription (not free)
 */
export function requireSubscription() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { subscription: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if subscription is active
      const hasActiveSubscription = user.subscription?.status === 'active';

      if (!hasActiveSubscription) {
        return res.status(403).json({
          error: 'Active subscription required',
          tier: user.tier,
          message: 'Please subscribe to access this feature',
          upgradeUrl: '/pricing',
        });
      }

      req.tier = user.tier;
      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

/**
 * Require Pro Artist subscription or higher
 */
export function requireProArtist() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { subscription: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Pro Artist: pro, studio
      const isProArtist = ['pro', 'studio'].includes(user.tier);
      const hasActiveSubscription = user.subscription?.status === 'active';

      if (!isProArtist || !hasActiveSubscription) {
        await logForensicEvent(
          'FEATURE_ACCESS_DENIED',
          'feature_gate',
          req.path,
          req.userId,
          { requiredTier: 'pro', userTier: user.tier }
        );

        return res.status(403).json({
          error: 'Pro Artist subscription required',
          tier: user.tier,
          message: 'Upgrade to Pro Artist to upload long-form videos',
          upgradeUrl: '/pricing#pro',
        });
      }

      req.tier = user.tier;
      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

/**
 * Require Studio subscription
 */
export function requireStudio() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { subscription: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Studio tier only
      const isStudio = user.tier === 'studio';
      const hasActiveSubscription = user.subscription?.status === 'active';

      if (!isStudio || !hasActiveSubscription) {
        await logForensicEvent(
          'FEATURE_ACCESS_DENIED',
          'feature_gate',
          req.path,
          req.userId,
          { requiredTier: 'studio', userTier: user.tier }
        );

        return res.status(403).json({
          error: 'Studio subscription required',
          tier: user.tier,
          message: 'Upgrade to Studio for multi-channel management and advanced analytics',
          upgradeUrl: '/pricing#studio',
        });
      }

      req.tier = user.tier;
      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

/**
 * Optional: Log feature access (for analytics)
 */
export function logFeatureAccess(feature: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.userId) {
        const user = await prisma.user.findUnique({
          where: { id: req.userId },
        });

        await logForensicEvent(
          'FEATURE_ACCESSED',
          'feature_access',
          feature,
          req.userId,
          { tier: user?.tier }
        );
      }

      next();
    } catch (error) {
      // Non-blocking, continue even if logging fails
      next();
    }
  };
}

/**
 * Check subscription status (non-blocking)
 * Adds tier to request but doesn't block
 */
export function checkSubscription() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      req.tier = user?.tier || 'free';
      next();
    } catch (error) {
      // Non-blocking, continue anyway
      next();
    }
  };
}

/**
 * Feature gates by tier
 * Returns middleware that checks if user's tier includes the feature
 */
export const FEATURE_TIERS = {
  // Free features
  'view_short_videos': ['free', 'fan', 'pro', 'studio'],
  'watch_streams': ['free', 'fan', 'pro', 'studio'],
  'send_tips': ['fan', 'pro', 'studio'],

  // Fan features
  'patron_subscriptions': ['fan', 'pro', 'studio'],
  'exclusive_content': ['fan', 'pro', 'studio'],

  // Pro features
  'upload_long_videos': ['pro', 'studio'],
  'monetize_videos': ['pro', 'studio'],
  'livestream': ['pro', 'studio'],
  'auto_editor': ['pro', 'studio'],
  'analytics': ['pro', 'studio'],

  // Studio features
  'multi_channel': ['studio'],
  'advanced_analytics': ['studio'],
  'merch_store': ['studio'],
  'team_collaboration': ['studio'],
};

export function requireFeature(featureName: keyof typeof FEATURE_TIERS) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { subscription: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const allowedTiers = FEATURE_TIERS[featureName];
      const hasFeature = allowedTiers.includes(user.tier);
      const hasActiveSubscription = 
        user.tier === 'free' || user.subscription?.status === 'active';

      if (!hasFeature || !hasActiveSubscription) {
        const minRequiredTier = allowedTiers.find((t) => t !== 'free') || 'fan';

        await logForensicEvent(
          'FEATURE_LOCKED',
          'feature_gate',
          featureName,
          req.userId,
          {
            requiredTier: minRequiredTier,
            userTier: user.tier,
          }
        );

        return res.status(403).json({
          error: 'Feature locked behind subscription',
          feature: featureName,
          minimumTier: minRequiredTier,
          userTier: user.tier,
          message: `This feature requires ${minRequiredTier} subscription`,
          upgradeUrl: `/pricing#${minRequiredTier}`,
        });
      }

      req.tier = user.tier;
      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}

/**
 * Example usage in routes:
 *
 * // Upload requires Pro
 * router.post('/upload', requireProArtist(), uploadVideo);
 *
 * // Livestream requires Pro
 * router.post('/livestream/start', requireProArtist(), startStream);
 *
 * // Multi-channel requires Studio
 * router.get('/channels', requireStudio(), getChannels);
 *
 * // Feature-gated access
 * router.post('/merch/create', requireFeature('merch_store'), createMerch);
 */
