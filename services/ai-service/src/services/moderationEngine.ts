import crypto from 'crypto';
import { prisma } from '@mhc/database';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface ModerationResult {
  approved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
}

interface ContentAnalysis {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * AI-Powered Content Moderation Engine
 * Real-time analysis for text, images, videos, and audio
 */
class ModerationEngine {
  private blockedHashes: Set<string> = new Set();
  private blockedKeywords: Set<string> = new Set();
  private readonly CACHE_TTL = 86400; // 24 hours

  constructor() {
    this.loadBlocklists();
  }

  /**
   * Load blocklists from database
   */
  private async loadBlocklists(): Promise<void> {
    try {
      const hashes = await prisma.blockedContent.findMany({
        where: { type: 'hash' },
        select: { value: true },
      });
      
      this.blockedHashes = new Set(hashes.map(h => h.value));

      const keywords = await prisma.blockedContent.findMany({
        where: { type: 'keyword' },
        select: { value: true },
      });
      
      this.blockedKeywords = new Set(keywords.map(k => k.value.toLowerCase()));

      console.log(`📋 Loaded ${this.blockedHashes.size} blocked hashes, ${this.blockedKeywords.size} keywords`);
    } catch (error) {
      console.error('Error loading blocklists:', error);
    }
  }

  /**
   * Moderate content with AI analysis
   */
  async moderateContent(content: ContentAnalysis): Promise<ModerationResult> {
    const results: ModerationResult[] = [];

    // Text moderation
    if (content.text) {
      results.push(await this.moderateText(content.text));
    }

    // Image moderation
    if (content.imageUrl) {
      results.push(await this.moderateImage(content.imageUrl));
    }

    // Video moderation
    if (content.videoUrl) {
      results.push(await this.moderateVideo(content.videoUrl, content.metadata));
    }

    // Audio moderation
    if (content.audioUrl) {
      results.push(await this.moderateAudio(content.audioUrl, content.metadata));
    }

    // Combine results (fail-fast on any critical flag)
    return this.combineResults(results);
  }

  /**
   * Text moderation - context-aware analysis
   */
  private async moderateText(text: string): Promise<ModerationResult> {
    const flags: string[] = [];
    const categories: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check hash blacklist
    const textHash = this.calculateHash(text);
    if (this.blockedHashes.has(textHash)) {
      return {
        approved: false,
        confidence: 1.0,
        flags: ['hash_blacklist'],
        reason: 'Content matches known prohibited material',
        severity: 'critical',
        categories: ['prohibited'],
      };
    }

    const lowerText = text.toLowerCase();

    // Keyword filtering
    for (const keyword of this.blockedKeywords) {
      if (lowerText.includes(keyword)) {
        flags.push(`blocked_keyword:${keyword}`);
        severity = 'high';
        categories.push('inappropriate_language');
      }
    }

    // Spam detection
    const urlMatches = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urlMatches.length > 5) {
      flags.push('excessive_urls');
      severity = Math.max(severity as any, 'medium' as any) as any;
      categories.push('spam');
    }

    // Suspicious patterns
    if (/\b(buy|sell|trade)\s+(drugs|weapons|stolen|illegal)\b/i.test(text)) {
      flags.push('illegal_transaction');
      severity = 'critical';
      categories.push('illegal_activity');
    }

    // Hate speech patterns (simple heuristics - would use ML in production)
    const hateSpeechPatterns = [
      /\b(kill|murder|eliminate)\s+(all|every|the)\s+\w+/i,
      /\bfuck\s+(all|every|the)\s+\w+/i,
    ];

    for (const pattern of hateSpeechPatterns) {
      if (pattern.test(text)) {
        flags.push('hate_speech');
        severity = 'critical';
        categories.push('hate_speech');
        break;
      }
    }

    // Personal information detection (PII)
    const piiPatterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    };

    for (const [type, pattern] of Object.entries(piiPatterns)) {
      if (pattern.test(text)) {
        flags.push(`pii:${type}`);
        severity = Math.max(severity as any, 'medium' as any) as any;
        categories.push('pii_exposure');
      }
    }

    // Caps lock spam
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (text.length > 20 && capsRatio > 0.7) {
      flags.push('excessive_caps');
      categories.push('spam');
    }

    // Sentiment analysis (simple)
    const sentiment = this.analyzeSentiment(text);
    if (sentiment < -0.8) {
      flags.push('very_negative');
      categories.push('negative_content');
    }

    const approved = flags.length === 0 || severity === 'low';

    return {
      approved,
      confidence: 0.85, // Would be from ML model in production
      flags,
      reason: !approved ? 'Text content violates community guidelines' : undefined,
      severity,
      categories,
    };
  }

  /**
   * Image moderation - NSFW, violence, inappropriate content
   */
  private async moderateImage(imageUrl: string): Promise<ModerationResult> {
    // Check cache
    const cacheKey = `moderation:image:${this.calculateHash(imageUrl)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const flags: string[] = [];
    const categories: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // In production: Use ML model (e.g., TensorFlow, OpenAI Moderation API)
    // For now: placeholder logic
    
    // Simulate AI analysis
    const simulatedAnalysis = {
      nsfw: Math.random() > 0.95,
      violence: Math.random() > 0.97,
      gore: Math.random() > 0.98,
      suggestive: Math.random() > 0.90,
    };

    if (simulatedAnalysis.nsfw) {
      flags.push('nsfw');
      severity = 'high';
      categories.push('adult_content');
    }

    if (simulatedAnalysis.violence) {
      flags.push('violence');
      severity = 'critical';
      categories.push('violence');
    }

    if (simulatedAnalysis.gore) {
      flags.push('gore');
      severity = 'critical';
      categories.push('gore');
    }

    if (simulatedAnalysis.suggestive) {
      flags.push('suggestive');
      severity = Math.max(severity as any, 'medium' as any) as any;
      categories.push('suggestive_content');
    }

    // Require human review for borderline cases
    if (flags.length > 0 && severity !== 'critical') {
      flags.push('requires_human_review');
    }

    const result: ModerationResult = {
      approved: severity === 'low',
      confidence: 0.70, // Lower confidence without real ML
      flags,
      reason: flags.length > 0 ? 'Image flagged for manual review' : undefined,
      severity,
      categories,
    };

    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

    return result;
  }

  /**
   * Video moderation - frame analysis, audio, metadata
   */
  private async moderateVideo(
    videoUrl: string,
    metadata?: Record<string, any>
  ): Promise<ModerationResult> {
    const flags: string[] = [];
    const categories: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Moderate metadata (title, description)
    if (metadata?.title || metadata?.description) {
      const textResult = await this.moderateText(
        `${metadata.title || ''} ${metadata.description || ''}`
      );
      
      if (!textResult.approved) {
        flags.push(...textResult.flags);
        severity = Math.max(severity as any, textResult.severity as any) as any;
        categories.push(...textResult.categories);
      }
    }

    // In production: Sample frames and run image analysis
    // For now: placeholder
    flags.push('video_requires_processing');
    categories.push('pending_review');

    return {
      approved: severity === 'low',
      confidence: 0.60,
      flags,
      reason: flags.length > 0 ? 'Video queued for frame analysis' : undefined,
      severity,
      categories,
    };
  }

  /**
   * Audio moderation - speech-to-text + analysis
   */
  private async moderateAudio(
    audioUrl: string,
    metadata?: Record<string, any>
  ): Promise<ModerationResult> {
    const flags: string[] = [];
    const categories: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Moderate metadata
    if (metadata?.title || metadata?.lyrics) {
      const textResult = await this.moderateText(
        `${metadata.title || ''} ${metadata.lyrics || ''}`
      );
      
      if (!textResult.approved) {
        flags.push(...textResult.flags);
        severity = Math.max(severity as any, textResult.severity as any) as any;
        categories.push(...textResult.categories);
      }
    }

    // Copyright detection (audio fingerprinting)
    // In production: Use Audible Magic, ACRCloud, or similar
    const copyrightMatch = await this.checkAudioFingerprint(audioUrl);
    if (copyrightMatch) {
      flags.push('copyright_match');
      severity = 'high';
      categories.push('copyright');
    }

    // In production: Speech-to-text + content analysis
    flags.push('audio_requires_processing');
    categories.push('pending_review');

    return {
      approved: severity === 'low',
      confidence: 0.65,
      flags,
      reason: flags.length > 0 ? 'Audio queued for analysis' : undefined,
      severity,
      categories,
    };
  }

  /**
   * Check audio fingerprint against copyright database
   */
  private async checkAudioFingerprint(audioUrl: string): Promise<boolean> {
    // In production: Use audio fingerprinting service
    // For now: simulate with low probability
    return Math.random() > 0.95;
  }

  /**
   * Detect deepfakes in video/audio
   */
  async detectDeepfake(mediaUrl: string, type: 'video' | 'audio'): Promise<{
    isDeepfake: boolean;
    confidence: number;
    indicators: string[];
  }> {
    // In production: Use deepfake detection ML model
    // Placeholder implementation
    const isDeepfake = Math.random() > 0.98;
    
    return {
      isDeepfake,
      confidence: isDeepfake ? 0.85 : 0.15,
      indicators: isDeepfake ? ['facial_artifacts', 'audio_inconsistency'] : [],
    };
  }

  /**
   * Combine multiple moderation results
   */
  private combineResults(results: ModerationResult[]): ModerationResult {
    if (results.length === 0) {
      return {
        approved: true,
        confidence: 1.0,
        flags: [],
        severity: 'low',
        categories: [],
      };
    }

    const allFlags = results.flatMap(r => r.flags);
    const allCategories = [...new Set(results.flatMap(r => r.categories))];
    const maxSeverity = results.reduce((max, r) => {
      const severityOrder: Record<string, number> = {
        low: 0,
        medium: 1,
        high: 2,
        critical: 3,
      };
      return severityOrder[r.severity] > severityOrder[max] ? r.severity : max;
    }, 'low' as 'low' | 'medium' | 'high' | 'critical');

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const approved = results.every(r => r.approved) && maxSeverity !== 'critical';

    return {
      approved,
      confidence: avgConfidence,
      flags: [...new Set(allFlags)],
      reason: !approved ? 'Content flagged by moderation system' : undefined,
      severity: maxSeverity,
      categories: allCategories,
    };
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'amazing', 'excellent', 'best'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'worst', 'horrible', 'disgusting'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    for (const word of words) {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    }

    return words.length > 0 ? score / words.length : 0;
  }

  /**
   * Calculate content hash
   */
  private calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Add content to blocklist
   */
  async addToBlocklist(value: string, type: 'hash' | 'keyword'): Promise<void> {
    await prisma.blockedContent.create({
      data: { value, type },
    });

    if (type === 'hash') {
      this.blockedHashes.add(value);
    } else {
      this.blockedKeywords.add(value.toLowerCase());
    }
  }

  /**
   * Report content for review
   */
  async reportContent(
    contentId: string,
    reporterId: string,
    reason: string
  ): Promise<void> {
    await prisma.contentReport.create({
      data: {
        contentId,
        reporterId,
        reason,
        status: 'pending',
      },
    });

    // Auto-escalate if multiple reports
    const reportCount = await prisma.contentReport.count({
      where: { contentId, status: 'pending' },
    });

    if (reportCount >= 3) {
      await this.escalateToHumanReview(contentId, 'multiple_reports');
    }
  }

  /**
   * Escalate to human moderation team
   */
  private async escalateToHumanReview(
    contentId: string,
    reason: string
  ): Promise<void> {
    await prisma.moderationQueue.create({
      data: {
        contentId,
        reason,
        priority: 'high',
        status: 'pending',
      },
    });

    console.log(`⚠️ Content ${contentId} escalated for human review: ${reason}`);
  }
}

let engineInstance: ModerationEngine | null = null;

export async function initModerationEngine(): Promise<void> {
  if (!engineInstance) {
    engineInstance = new ModerationEngine();
    console.log('✅ Moderation engine initialized');
  }
}

export function getModerationEngine(): ModerationEngine {
  if (!engineInstance) {
    throw new Error('Moderation engine not initialized');
  }
  return engineInstance;
}
