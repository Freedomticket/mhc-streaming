/**
 * Socket.IO Real-Time Streaming Engine
 * Handles live video/audio, chat, reactions, viewer tracking
 *
 * Features:
 * - Live room management (join/leave streams)
 * - Real-time chat with message persistence
 * - Viewer count tracking
 * - Live reactions (emojis, hearts, etc.)
 * - Creator collaboration rooms
 * - Forensic logging on all events
 *
 * Integrates with: Forensics, Patronage, Royalties, Moderation
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from './prisma';
import { logForensicEvent } from './services/forensics.service';
import { creditRoyalty } from './services/royalty.service';

interface JoinStreamData {
  streamId: string;
  userId?: string;
  displayName: string;
}

interface ChatMessageData {
  streamId: string;
  userId: string;
  displayName: string;
  message: string;
  danteRealm: 'inferno' | 'purgatorio' | 'paradiso';
}

interface ReactionData {
  streamId: string;
  userId: string;
  reactionType: string; // 'heart', 'fire', 'clap', 'mind-blown'
}

interface TipData {
  streamId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  message?: string;
}

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Active streams map: streamId -> { hostId, viewers, startTime }
  const activeStreams = new Map<
    string,
    {
      hostId: string;
      viewers: number;
      startTime: Date;
      reactions: Map<string, number>;
    }
  >();

  /**
   * User joins a livestream room
   */
  io.on('connection', (socket: Socket) => {
    socket.on('join-stream', async (data: JoinStreamData) => {
      try {
        const { streamId, userId, displayName } = data;

        // Verify stream exists and is active
        const stream = await prisma.livestream.findUnique({
          where: { id: streamId },
          include: { creator: true },
        });

        if (!stream || !stream.isActive) {
          socket.emit('error', { message: 'Stream not found or offline' });
          return;
        }

        // Join socket room
        socket.join(`livestream-${streamId}`);

        // Track viewer
        const stream_data = activeStreams.get(streamId) || {
          hostId: stream.creatorId,
          viewers: 0,
          startTime: stream.startedAt,
          reactions: new Map(),
        };
        stream_data.viewers++;
        activeStreams.set(streamId, stream_data);

        // Update database viewer count
        await prisma.livestream.update({
          where: { id: streamId },
          data: { viewers: { increment: 1 } },
        });

        // Notify all viewers
        io.to(`livestream-${streamId}`).emit('viewer-joined', {
          totalViewers: stream_data.viewers,
          joinedUser: displayName,
          timestamp: new Date(),
        });

        // Log to forensics
        await logForensicEvent('LIVESTREAM_JOINED', 'livestream', streamId, userId || 'anonymous', {
          viewers: stream_data.viewers,
          displayName,
        });

        // Store viewer in session
        socket.data = { streamId, userId, displayName, joinedAt: Date.now() };
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    /**
     * User sends chat message to stream
     */
    socket.on('chat-message', async (data: ChatMessageData) => {
      try {
        const { streamId, userId, displayName, message, danteRealm } = data;

        // Validate message
        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (message.length > 500) {
          socket.emit('error', { message: 'Message too long (max 500 chars)' });
          return;
        }

        // Save to database
        const msg = await prisma.streamMessage.create({
          data: {
            streamId,
            userId: userId || 'anonymous',
            displayName,
            message: message.trim(),
            danteRealm,
          },
        });

        // Broadcast to room
        io.to(`livestream-${streamId}`).emit('chat-message', {
          id: msg.id,
          userId: msg.userId,
          displayName: msg.displayName,
          message: msg.message,
          danteRealm: msg.danteRealm,
          timestamp: msg.createdAt,
        });

        // Log to forensics
        await logForensicEvent(
          'LIVESTREAM_CHAT_MESSAGE',
          'streamMessage',
          msg.id,
          userId || 'anonymous',
          {
            streamId,
            messageLength: message.length,
          }
        );
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    /**
     * User sends live reaction (heart, fire, clap, etc.)
     */
    socket.on('reaction', async (data: ReactionData) => {
      try {
        const { streamId, userId, reactionType } = data;

        // Validate reaction type
        const validReactions = ['heart', 'fire', 'clap', 'mind-blown', 'laughing'];
        if (!validReactions.includes(reactionType)) {
          socket.emit('error', { message: 'Invalid reaction type' });
          return;
        }

        // Track reaction count
        const stream_data = activeStreams.get(streamId);
        if (stream_data) {
          const count = (stream_data.reactions.get(reactionType) || 0) + 1;
          stream_data.reactions.set(reactionType, count);
        }

        // Broadcast reaction to all viewers
        io.to(`livestream-${streamId}`).emit('reaction', {
          userId,
          reactionType,
          timestamp: new Date(),
        });

        // Log to forensics
        await logForensicEvent(
          'LIVESTREAM_REACTION',
          'livestream',
          streamId,
          userId,
          { reactionType }
        );
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    /**
     * User sends livestream tip
     */
    socket.on('send-tip', async (data: TipData) => {
      try {
        const { streamId, fromUserId, toUserId, amount, message } = data;

        if (amount <= 0 || amount > 10000) {
          socket.emit('error', { message: 'Tip amount must be 1-10000' });
          return;
        }

        // Create tip record
        const tip = await prisma.tip.create({
          data: {
            fanId: fromUserId,
            artistId: toUserId,
            amountUSD: amount,
            stripePaymentId: `livestream-tip-${streamId}`,
            status: 'pending',
          },
        });

        // Credit artist royalty
        await creditRoyalty(
          toUserId,
          Math.round(amount * 100 * 0.9), // 90% to artist
          'livestream_tip',
          { fromUserId, streamId }
        );

        // Notify stream viewers
        io.to(`livestream-${streamId}`).emit('tip-received', {
          fromUser: fromUserId,
          amount,
          message: message || '',
          timestamp: new Date(),
        });

        // Log to forensics
        await logForensicEvent('LIVESTREAM_TIP', 'tip', tip.id, fromUserId, {
          streamId,
          amount,
          toUserId,
        });
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    /**
     * User disconnects from stream
     */
    socket.on('disconnecting', async () => {
      try {
        const { streamId, userId, displayName } = socket.data;

        if (streamId) {
          // Remove from socket room
          socket.leave(`livestream-${streamId}`);

          // Update viewer count
          const stream_data = activeStreams.get(streamId);
          if (stream_data) {
            stream_data.viewers = Math.max(0, stream_data.viewers - 1);

            // Update database
            await prisma.livestream.update({
              where: { id: streamId },
              data: { viewers: stream_data.viewers },
            });

            // Notify remaining viewers
            io.to(`livestream-${streamId}`).emit('viewer-left', {
              totalViewers: stream_data.viewers,
              leftUser: displayName,
              timestamp: new Date(),
            });
          }

          // Log to forensics
          await logForensicEvent(
            'LIVESTREAM_LEFT',
            'livestream',
            streamId,
            userId || 'anonymous',
            { displayName }
          );
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    /**
     * Explicit disconnect (cleanup)
     */
    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected`);
    });
  });

  return io;
}

/**
 * Helper: Get current stream stats
 */
export function getStreamStats(
  streamId: string,
  activeStreams: Map<string, any>
) {
  const stream = activeStreams.get(streamId);
  if (!stream) return null;

  return {
    viewers: stream.viewers,
    uptime: Date.now() - stream.startTime.getTime(),
    reactions: Object.fromEntries(stream.reactions),
  };
}
