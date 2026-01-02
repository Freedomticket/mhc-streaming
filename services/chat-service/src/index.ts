import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3008;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'chat-service',
    timestamp: new Date().toISOString() 
  });
});

// Get chat messages for a stream
app.get('/api/chat/:streamId/messages', async (req, res) => {
  try {
    const { streamId } = req.params;
    const { limit = '50' } = req.query;
    
    // In production, would query Message model
    res.json(successResponse({
      streamId,
      messages: [],
      limit: parseInt(limit as string),
    }));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch messages' })
    );
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join stream room
  socket.on('join-stream', (streamId: string) => {
    socket.join(streamId);
    console.log(`Socket ${socket.id} joined stream ${streamId}`);
    socket.to(streamId).emit('user-joined', { socketId: socket.id });
  });
  
  // Leave stream room
  socket.on('leave-stream', (streamId: string) => {
    socket.leave(streamId);
    console.log(`Socket ${socket.id} left stream ${streamId}`);
    socket.to(streamId).emit('user-left', { socketId: socket.id });
  });
  
  // Send chat message
  socket.on('chat-message', async (data: { streamId: string; userId: string; message: string; username?: string }) => {
    const { streamId, userId, message, username } = data;
    
    // Broadcast message to all users in the stream
    const messageData = {
      id: `msg_${Date.now()}`,
      streamId,
      userId,
      username: username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
    };
    
    io.to(streamId).emit('chat-message', messageData);
    
    // In production, would save to database
    console.log(`Chat message in ${streamId} from ${username}: ${message}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`💬 Chat service running on port ${PORT}`);
});
