import { EventEmitter } from 'events';
import { prisma } from '@mhc/database';

interface Stream {
  id: string;
  streamKey: string;
  userId: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  startedAt?: Date;
}

interface StreamSession {
  streamKey: string;
  userId: string;
  startedAt: Date;
  viewerCount: number;
}

/**
 * Stream Manager - Handles live stream sessions
 * In production, this would integrate with a real RTMP server like node-media-server
 * For now, it's a mock implementation that can track stream states
 */
class StreamManager extends EventEmitter {
  private activeSessions: Map<string, StreamSession> = new Map();
  private port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  /**
   * Initialize the stream manager
   */
  async init(): Promise<void> {
    console.log(`🎥 Stream manager initialized on port ${this.port}`);
    console.log('ℹ️  RTMP URLs: rtmp://localhost:${this.port}/live/{stream_key}');
    
    // In production, initialize actual RTMP server here
    // Example: using node-media-server
    // const NodeMediaServer = require('node-media-server');
    // this.rtmpServer = new NodeMediaServer(config);
    // this.rtmpServer.run();
  }

  /**
   * Handle stream publish (broadcaster starts streaming)
   */
  async onStreamPublish(streamKey: string): Promise<boolean> {
    try {
      // Verify stream key exists in database
      const stream = await prisma.stream.findUnique({
        where: { streamKey },
      });

      if (!stream) {
        console.log(`❌ Invalid stream key: ${streamKey}`);
        return false;
      }

      // Create session
      const session: StreamSession = {
        streamKey,
        userId: stream.userId,
        startedAt: new Date(),
        viewerCount: 0,
      };

      this.activeSessions.set(streamKey, session);

      // Update stream status in database
      await prisma.stream.update({
        where: { id: stream.id },
        data: {
          isLive: true,
          startedAt: new Date(),
        },
      });

      console.log(`✅ Stream started: ${stream.title} (${streamKey})`);
      this.emit('stream:start', { streamKey, stream });

      return true;
    } catch (error) {
      console.error('Error handling stream publish:', error);
      return false;
    }
  }

  /**
   * Handle stream unpublish (broadcaster stops streaming)
   */
  async onStreamUnpublish(streamKey: string): Promise<void> {
    try {
      const session = this.activeSessions.get(streamKey);
      if (!session) return;

      // Calculate duration
      const duration = Math.floor(
        (Date.now() - session.startedAt.getTime()) / 1000
      );

      // Update stream status
      const stream = await prisma.stream.findUnique({
        where: { streamKey },
      });

      if (stream) {
        await prisma.stream.update({
          where: { id: stream.id },
          data: {
            isLive: false,
            endedAt: new Date(),
          },
        });

        // Record stream analytics
        await prisma.streamAnalytics.create({
          data: {
            streamId: stream.id,
            userId: stream.userId,
            duration,
            peakViewers: session.viewerCount,
            totalViews: session.viewerCount,
          },
        });

        console.log(`🛑 Stream ended: ${stream.title} (Duration: ${duration}s)`);
        this.emit('stream:end', { streamKey, stream, duration });
      }

      this.activeSessions.delete(streamKey);
    } catch (error) {
      console.error('Error handling stream unpublish:', error);
    }
  }

  /**
   * Handle viewer joining stream
   */
  async onViewerJoin(streamKey: string): Promise<void> {
    const session = this.activeSessions.get(streamKey);
    if (session) {
      session.viewerCount++;
      
      // Update database
      await prisma.stream.update({
        where: { streamKey },
        data: { viewerCount: session.viewerCount },
      });

      this.emit('viewer:join', { streamKey, viewerCount: session.viewerCount });
    }
  }

  /**
   * Handle viewer leaving stream
   */
  async onViewerLeave(streamKey: string): Promise<void> {
    const session = this.activeSessions.get(streamKey);
    if (session && session.viewerCount > 0) {
      session.viewerCount--;
      
      // Update database
      await prisma.stream.update({
        where: { streamKey },
        data: { viewerCount: session.viewerCount },
      });

      this.emit('viewer:leave', { streamKey, viewerCount: session.viewerCount });
    }
  }

  /**
   * Get active stream session
   */
  getSession(streamKey: string): StreamSession | undefined {
    return this.activeSessions.get(streamKey);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): StreamSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Check if stream is live
   */
  isStreamLive(streamKey: string): boolean {
    return this.activeSessions.has(streamKey);
  }

  /**
   * Close the stream manager
   */
  async close(): Promise<void> {
    // End all active sessions
    for (const streamKey of this.activeSessions.keys()) {
      await this.onStreamUnpublish(streamKey);
    }

    console.log('🛑 Stream manager closed');
  }
}

let streamManagerInstance: StreamManager | null = null;

/**
 * Initialize and return stream manager instance
 */
export function initStreamManager(port: number): StreamManager {
  if (!streamManagerInstance) {
    streamManagerInstance = new StreamManager(port);
    streamManagerInstance.init();
  }
  return streamManagerInstance;
}

/**
 * Get existing stream manager instance
 */
export function getStreamManager(): StreamManager {
  if (!streamManagerInstance) {
    throw new Error('Stream manager not initialized');
  }
  return streamManagerInstance;
}
