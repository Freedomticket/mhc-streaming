/**
 * AI Auto-Editor Service
 * Generates short-form clips from long-form videos with beat detection,
 * silence trimming, highlight scoring, and Dante-realm visual filters
 *
 * Integrates with: Forensics, Patronage, Royalties, Recommendation Engine
 */

import { prisma } from '../prisma';
import { logForensicEvent } from './forensics.service';
import Bull from 'bull';
import axios from 'axios';

export interface VideoSegment {
  start: number;
  end: number;
  score: number;
  type: 'highlight' | 'dialogue' | 'silence' | 'music';
}

export interface AutoEditOutput {
  tiktokShort: string;
  instagramReel: string;
  youtubeShorts: string;
  trailer: string;
  highlights: VideoSegment[];
  metadata: {
    dominantColor: string;
    bpm: number;
    danteRealm: 'inferno' | 'purgatorio' | 'paradiso';
  };
}

export class AutoEditorService {
  private editQueue: Bull.Queue;

  constructor() {
    this.editQueue = new Bull('auto-edit', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.editQueue.process(async (job) => {
      return await this.processAutoEdit(job.data);
    });
  }

  /**
   * Start auto-edit job for a video
   * Only available to Pro/Premium artists
   */
  async startAutoEdit(videoId: string, artistId: string): Promise<any> {
    try {
      // Verify artist ownership
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: { creator: true },
      });

      if (!video || video.creator.id !== artistId) {
        throw new Error('Unauthorized: Video does not belong to artist');
      }

      // Check artist tier
      if (video.creator.tier !== 'pro' && video.creator.tier !== 'premium') {
        throw new Error('Feature requires Pro or Premium subscription');
      }

      // Create job record
      const job = await prisma.autoEditJob.create({
        data: {
          videoId,
          artistId,
          status: 'queued',
          createdAt: new Date(),
        },
      });

      // Queue the job
      await this.editQueue.add(job, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      });

      // Log to forensics
      await logForensicEvent('AUTO_EDIT_STARTED', 'video', videoId, artistId, {
        jobId: job.id,
      });

      return job;
    } catch (error) {
      throw new Error(`Failed to start auto-edit: ${(error as Error).message}`);
    }
  }

  /**
   * Main auto-edit processing pipeline
   */
  private async processAutoEdit(jobData: any): Promise<AutoEditOutput> {
    const { videoId, artistId } = jobData;

    try {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) throw new Error('Video not found');

      // 1. Scene detection
      const scenes = await this.detectScenes(video.url);

      // 2. Beat detection
      const beats = await this.detectBeats(video.url);

      // 3. Silence trimming
      const trimmedSegments = await this.trimSilence(video.url, scenes);

      // 4. Highlight scoring
      const highlights = await this.scoreHighlights(video.url, trimmedSegments);

      // 5. Determine Dante realm based on video characteristics
      const danteRealm = await this.determineDanteRealm(video.url);

      // 6. Generate short-form clips
      const shorts = await this.generateShorts(video.url, highlights, danteRealm);

      // 7. Apply Dante filters
      const filtered = await this.applyDanteFilters(shorts, danteRealm);

      // 8. Generate captions
      const captioned = await this.generateCaptions(filtered);

      // Update job status
      await prisma.autoEditJob.update({
        where: { id: jobData.id },
        data: {
          status: 'completed',
          output: {
            tiktokShort: captioned.tiktok,
            instagramReel: captioned.instagram,
            youtubeShorts: captioned.youtube,
            trailer: captioned.trailer,
            highlights,
            metadata: {
              dominantColor: video.dominantColor || '#000000',
              bpm: beats.bpm,
              danteRealm,
            },
          },
          completedAt: new Date(),
        },
      });

      // Log completion
      await logForensicEvent('AUTO_EDIT_COMPLETED', 'video', videoId, artistId, {
        jobId: jobData.id,
        highlightCount: highlights.length,
        danteRealm,
      });

      return filtered;
    } catch (error) {
      // Log error and update job
      await prisma.autoEditJob.update({
        where: { id: jobData.id },
        data: {
          status: 'failed',
          error: (error as Error).message,
          failedAt: new Date(),
        },
      });

      await logForensicEvent('AUTO_EDIT_FAILED', 'video', videoId, artistId, {
        jobId: jobData.id,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Detect scene changes using color histogram analysis
   */
  private async detectScenes(videoUrl: string): Promise<number[]> {
    try {
      // Call ML service or ffprobe for scene detection
      const response = await axios.post('http://localhost:5000/detect-scenes', {
        videoUrl,
      });
      return response.data.scenes || [];
    } catch {
      console.warn('Scene detection failed, returning empty array');
      return [];
    }
  }

  /**
   * Detect beats and BPM from audio track
   */
  private async detectBeats(videoUrl: string): Promise<{
    beats: number[];
    bpm: number;
  }> {
    try {
      const response = await axios.post('http://localhost:5000/detect-beats', {
        videoUrl,
      });
      return response.data || { beats: [], bpm: 120 };
    } catch {
      return { beats: [], bpm: 120 };
    }
  }

  /**
   * Trim silent segments from video
   */
  private async trimSilence(
    videoUrl: string,
    scenes: number[]
  ): Promise<VideoSegment[]> {
    try {
      const response = await axios.post('http://localhost:5000/trim-silence', {
        videoUrl,
        scenes,
      });
      return response.data.segments || [];
    } catch {
      return [];
    }
  }

  /**
   * Score segments by engagement potential
   * Uses: movement, face detection, text prominence, audio volume
   */
  private async scoreHighlights(
    videoUrl: string,
    segments: VideoSegment[]
  ): Promise<VideoSegment[]> {
    try {
      const response = await axios.post('http://localhost:5000/score-highlights', {
        videoUrl,
        segments,
      });

      // Top 5 highlights by score
      return (response.data.highlights || segments)
        .sort((a: VideoSegment, b: VideoSegment) => b.score - a.score)
        .slice(0, 5);
    } catch {
      return segments.slice(0, 5);
    }
  }

  /**
   * Determine Dante realm based on video characteristics
   * Inferno: High contrast, dark, intense
   * Purgatorio: Balanced, neutral, contemplative
   * Paradiso: Bright, golden, uplifting
   */
  private async determineDanteRealm(
    videoUrl: string
  ): Promise<'inferno' | 'purgatorio' | 'paradiso'> {
    try {
      const response = await axios.post('http://localhost:5000/analyze-aesthetics', {
        videoUrl,
      });

      const { brightness, saturation, contrast } = response.data;

      if (contrast > 0.7 && brightness < 0.4) return 'inferno';
      if (brightness > 0.65) return 'paradiso';
      return 'purgatorio';
    } catch {
      return 'purgatorio'; // Default safe choice
    }
  }

  /**
   * Generate short-form clips for each platform
   */
  private async generateShorts(
    videoUrl: string,
    highlights: VideoSegment[],
    danteRealm: string
  ): Promise<{
    tiktok: string;
    instagram: string;
    youtube: string;
    trailer: string;
  }> {
    try {
      const response = await axios.post('http://localhost:5000/generate-shorts', {
        videoUrl,
        highlights: highlights.map((h) => ({
          start: h.start,
          end: h.end,
        })),
        danteRealm,
      });

      return response.data || {
        tiktok: '',
        instagram: '',
        youtube: '',
        trailer: '',
      };
    } catch {
      throw new Error('Failed to generate short-form clips');
    }
  }

  /**
   * Apply Dante-realm visual filters
   */
  private async applyDanteFilters(
    shorts: any,
    danteRealm: string
  ): Promise<AutoEditOutput> {
    const filter = this.getDanteFilter(danteRealm);

    try {
      // Apply filter to each output
      const filtered = await axios.post('http://localhost:5000/apply-filter', {
        tiktok: shorts.tiktok,
        instagram: shorts.instagram,
        youtube: shorts.youtube,
        trailer: shorts.trailer,
        filter,
      });

      return filtered.data;
    } catch {
      // Return unfiltered if filter application fails
      return shorts;
    }
  }

  /**
   * Get Dante filter parameters
   */
  private getDanteFilter(danteRealm: string): {
    name: string;
    params: Record<string, number>;
  } {
    const filters: Record<
      string,
      { name: string; params: Record<string, number> }
    > = {
      inferno: {
        name: 'inferno',
        params: {
          saturation: 1.4,
          brightness: -0.2,
          redShift: 0.3,
          chromatic: 15,
          vignetteStrength: 0.4,
        },
      },
      purgatorio: {
        name: 'purgatorio',
        params: {
          saturation: 0.7,
          brightness: 0,
          desaturate: 0.3,
          fogDensity: 0.2,
          contrast: 0.9,
        },
      },
      paradiso: {
        name: 'paradiso',
        params: {
          saturation: 1.1,
          brightness: 0.2,
          goldenTint: 0.15,
          bloomStrength: 0.3,
          clarity: 1.2,
        },
      },
    };

    return filters[danteRealm] || filters.purgatorio;
  }

  /**
   * Generate captions and subtitles via speech-to-text
   */
  private async generateCaptions(shorts: AutoEditOutput): Promise<{
    tiktok: string;
    instagram: string;
    youtube: string;
    trailer: string;
  }> {
    try {
      const response = await axios.post('http://localhost:5000/generate-captions', {
        tiktok: shorts.tiktokShort,
        instagram: shorts.instagramReel,
        youtube: shorts.youtubeShorts,
        trailer: shorts.trailer,
      });

      return response.data || {
        tiktok: shorts.tiktokShort,
        instagram: shorts.instagramReel,
        youtube: shorts.youtubeShorts,
        trailer: shorts.trailer,
      };
    } catch {
      return {
        tiktok: shorts.tiktokShort,
        instagram: shorts.instagramReel,
        youtube: shorts.youtubeShorts,
        trailer: shorts.trailer,
      };
    }
  }

  /**
   * Get auto-edit job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    return await prisma.autoEditJob.findUnique({
      where: { id: jobId },
    });
  }

  /**
   * List all jobs for an artist
   */
  async listArtistJobs(artistId: string): Promise<any[]> {
    return await prisma.autoEditJob.findMany({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export const autoEditorService = new AutoEditorService();
