import { prisma } from '@mhc/database';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface UserBehavior {
  userId: string;
  contentId: string;
  contentType: 'video' | 'audio' | 'stream';
  action: 'view' | 'like' | 'skip' | 'complete' | 'share';
  watchTime?: number;
  totalDuration?: number;
  timestamp: Date;
}

interface ContentEmbedding {
  contentId: string;
  vector: number[];
  metadata: {
    title: string;
    creator: string;
    category?: string;
    tags: string[];
    danteRealm?: string;
  };
}

interface RecommendationScore {
  contentId: string;
  score: number;
  reason: string[];
}

/**
 * AI-Powered Recommendation Engine
 * Uses collaborative filtering, content-based filtering, and behavioral analysis
 */
class RecommendationEngine {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly TRENDING_WINDOW = 7 * 24 * 60 * 60; // 7 days
  private readonly MIN_INTERACTIONS = 3;

  /**
   * Track user behavior for learning
   */
  async trackBehavior(behavior: UserBehavior): Promise<void> {
    try {
      // Store in database for long-term learning
      await prisma.userInteraction.create({
        data: {
          userId: behavior.userId,
          contentId: behavior.contentId,
          contentType: behavior.contentType,
          action: behavior.action,
          watchTime: behavior.watchTime,
          totalDuration: behavior.totalDuration,
          completionRate: behavior.watchTime && behavior.totalDuration 
            ? behavior.watchTime / behavior.totalDuration 
            : null,
        },
      });

      // Update real-time cache for fast recommendations
      const key = `user:${behavior.userId}:behavior`;
      await redis.zadd(
        key,
        Date.now(),
        JSON.stringify(behavior)
      );
      await redis.expire(key, this.TRENDING_WINDOW);

      // Update content engagement scores
      await this.updateContentScore(behavior);
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }

  /**
   * Get personalized recommendations for user
   */
  async getRecommendations(
    userId: string | null,
    limit: number = 20,
    excludeIds: string[] = []
  ): Promise<RecommendationScore[]> {
    try {
      if (userId) {
        // Personalized recommendations
        const userProfile = await this.buildUserProfile(userId);
        const collaborative = await this.getCollaborativeRecommendations(userId, userProfile);
        const contentBased = await this.getContentBasedRecommendations(userProfile);
        const trending = await this.getTrendingContent();

        // Blend recommendations (70% personalized, 20% trending, 10% exploration)
        const blended = this.blendRecommendations([
          { items: collaborative, weight: 0.5 },
          { items: contentBased, weight: 0.2 },
          { items: trending, weight: 0.2 },
          { items: await this.getExplorationContent(userId), weight: 0.1 },
        ]);

        return blended
          .filter(item => !excludeIds.includes(item.contentId))
          .slice(0, limit);
      } else {
        // Cold start - show trending and popular
        const trending = await this.getTrendingContent();
        const popular = await this.getPopularContent();

        return [...trending, ...popular]
          .filter(item => !excludeIds.includes(item.contentId))
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Build user preference profile from interaction history
   */
  private async buildUserProfile(userId: string): Promise<{
    likedCategories: Map<string, number>;
    likedCreators: Map<string, number>;
    likedTags: Map<string, number>;
    avgWatchTime: number;
    preferredRealms: Map<string, number>;
  }> {
    const interactions = await prisma.userInteraction.findMany({
      where: { 
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        content: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const profile = {
      likedCategories: new Map<string, number>(),
      likedCreators: new Map<string, number>(),
      likedTags: new Map<string, number>(),
      avgWatchTime: 0,
      preferredRealms: new Map<string, number>(),
    };

    let totalWatchTime = 0;
    let watchTimeCount = 0;

    for (const interaction of interactions) {
      const weight = this.getActionWeight(interaction.action);
      
      if (interaction.content.category) {
        profile.likedCategories.set(
          interaction.content.category,
          (profile.likedCategories.get(interaction.content.category) || 0) + weight
        );
      }

      profile.likedCreators.set(
        interaction.content.userId,
        (profile.likedCreators.get(interaction.content.userId) || 0) + weight
      );

      if (interaction.content.tags) {
        for (const tag of interaction.content.tags) {
          profile.likedTags.set(
            tag,
            (profile.likedTags.get(tag) || 0) + weight
          );
        }
      }

      if (interaction.content.danteRealm) {
        profile.preferredRealms.set(
          interaction.content.danteRealm,
          (profile.preferredRealms.get(interaction.content.danteRealm) || 0) + weight
        );
      }

      if (interaction.watchTime) {
        totalWatchTime += interaction.watchTime;
        watchTimeCount++;
      }
    }

    profile.avgWatchTime = watchTimeCount > 0 ? totalWatchTime / watchTimeCount : 0;

    return profile;
  }

  /**
   * Collaborative filtering - find similar users and their preferences
   */
  private async getCollaborativeRecommendations(
    userId: string,
    userProfile: any
  ): Promise<RecommendationScore[]> {
    // Find users with similar interaction patterns
    const similarUsers = await this.findSimilarUsers(userId, 10);
    
    const recommendations = new Map<string, RecommendationScore>();

    for (const similarUser of similarUsers) {
      const theirInteractions = await prisma.userInteraction.findMany({
        where: {
          userId: similarUser.userId,
          action: { in: ['like', 'complete', 'share'] },
          createdAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
        take: 20,
      });

      for (const interaction of theirInteractions) {
        if (!recommendations.has(interaction.contentId)) {
          recommendations.set(interaction.contentId, {
            contentId: interaction.contentId,
            score: 0,
            reason: [],
          });
        }

        const rec = recommendations.get(interaction.contentId)!;
        rec.score += similarUser.similarity * this.getActionWeight(interaction.action);
        rec.reason.push('similar_users');
      }
    }

    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  /**
   * Content-based filtering - recommend similar content to what user liked
   */
  private async getContentBasedRecommendations(
    userProfile: any
  ): Promise<RecommendationScore[]> {
    const recommendations: RecommendationScore[] = [];

    // Get content matching user's preferred categories
    const topCategories = Array.from(userProfile.likedCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    if (topCategories.length > 0) {
      const categoryContent = await prisma.content.findMany({
        where: {
          category: { in: topCategories },
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      for (const content of categoryContent) {
        recommendations.push({
          contentId: content.id,
          score: userProfile.likedCategories.get(content.category) || 0,
          reason: ['category_match'],
        });
      }
    }

    // Get content from creators user likes
    const topCreators = Array.from(userProfile.likedCreators.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([creatorId]) => creatorId);

    if (topCreators.length > 0) {
      const creatorContent = await prisma.content.findMany({
        where: {
          userId: { in: topCreators },
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      for (const content of creatorContent) {
        const existing = recommendations.find(r => r.contentId === content.id);
        if (existing) {
          existing.score += userProfile.likedCreators.get(content.userId) || 0;
          existing.reason.push('favorite_creator');
        } else {
          recommendations.push({
            contentId: content.id,
            score: userProfile.likedCreators.get(content.userId) || 0,
            reason: ['favorite_creator'],
          });
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  /**
   * Get trending content based on recent engagement
   */
  private async getTrendingContent(): Promise<RecommendationScore[]> {
    const cacheKey = 'trending:content';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const trending = await prisma.content.findMany({
      where: {
        isPublic: true,
        createdAt: {
          gte: new Date(Date.now() - this.TRENDING_WINDOW * 1000),
        },
      },
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: 50,
    });

    const recommendations: RecommendationScore[] = trending.map((content, index) => ({
      contentId: content.id,
      score: 100 - index, // Higher score for higher rank
      reason: ['trending'],
    }));

    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(recommendations));

    return recommendations;
  }

  /**
   * Get popular evergreen content
   */
  private async getPopularContent(): Promise<RecommendationScore[]> {
    const popular = await prisma.content.findMany({
      where: { isPublic: true },
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: 30,
    });

    return popular.map((content, index) => ({
      contentId: content.id,
      score: 80 - index,
      reason: ['popular'],
    }));
  }

  /**
   * Get exploration content (serendipity)
   */
  private async getExplorationContent(userId: string): Promise<RecommendationScore[]> {
    const unseenContent = await prisma.content.findMany({
      where: {
        isPublic: true,
        NOT: {
          interactions: {
            some: { userId },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return unseenContent.map(content => ({
      contentId: content.id,
      score: Math.random() * 50, // Random score for exploration
      reason: ['exploration'],
    }));
  }

  /**
   * Find similar users based on interaction patterns
   */
  private async findSimilarUsers(
    userId: string,
    limit: number
  ): Promise<Array<{ userId: string; similarity: number }>> {
    // Simplified similarity calculation
    // In production, use cosine similarity on user-item matrices
    const userInteractions = await prisma.userInteraction.findMany({
      where: { userId },
      select: { contentId: true, action: true },
    });

    const userContentSet = new Set(
      userInteractions
        .filter(i => ['like', 'complete'].includes(i.action))
        .map(i => i.contentId)
    );

    if (userContentSet.size < this.MIN_INTERACTIONS) {
      return [];
    }

    // Find users who interacted with same content
    const otherUsers = await prisma.userInteraction.groupBy({
      by: ['userId'],
      where: {
        contentId: { in: Array.from(userContentSet) },
        userId: { not: userId },
      },
      _count: { contentId: true },
      orderBy: { _count: { contentId: 'desc' } },
      take: limit,
    });

    return otherUsers.map(u => ({
      userId: u.userId,
      similarity: u._count.contentId / userContentSet.size,
    }));
  }

  /**
   * Blend multiple recommendation sources
   */
  private blendRecommendations(
    sources: Array<{ items: RecommendationScore[]; weight: number }>
  ): RecommendationScore[] {
    const blended = new Map<string, RecommendationScore>();

    for (const { items, weight } of sources) {
      for (const item of items) {
        if (!blended.has(item.contentId)) {
          blended.set(item.contentId, {
            contentId: item.contentId,
            score: 0,
            reason: [],
          });
        }

        const rec = blended.get(item.contentId)!;
        rec.score += item.score * weight;
        rec.reason.push(...item.reason);
      }
    }

    return Array.from(blended.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Update content engagement scores
   */
  private async updateContentScore(behavior: UserBehavior): Promise<void> {
    const key = `content:${behavior.contentId}:score`;
    const weight = this.getActionWeight(behavior.action);
    
    await redis.zincrby('global:content:scores', weight, behavior.contentId);
    await redis.expire(key, this.TRENDING_WINDOW);
  }

  /**
   * Get weight for different user actions
   */
  private getActionWeight(action: string): number {
    const weights: Record<string, number> = {
      view: 1,
      like: 3,
      share: 5,
      complete: 4,
      skip: -1,
    };
    return weights[action] || 0;
  }
}

let engineInstance: RecommendationEngine | null = null;

export async function initRecommendationEngine(): Promise<void> {
  if (!engineInstance) {
    engineInstance = new RecommendationEngine();
    console.log('✅ Recommendation engine initialized');
  }
}

export function getRecommendationEngine(): RecommendationEngine {
  if (!engineInstance) {
    throw new Error('Recommendation engine not initialized');
  }
  return engineInstance;
}
