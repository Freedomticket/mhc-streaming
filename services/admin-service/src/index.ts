import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { requireAdmin } from './middleware/adminAuth';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import contentRoutes from './routes/content';
import reportsRoutes from './routes/reports';
import revenueRoutes from './routes/revenue';
import payoutRoutes from './routes/payouts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3012;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-service' });
});

// Protected admin routes - all require ADMIN role
app.use('/api/admin/dashboard', requireAdmin, dashboardRoutes);
app.use('/api/admin/users', requireAdmin, userRoutes);
app.use('/api/admin/videos', requireAdmin, contentRoutes);
app.use('/api/admin/reports', requireAdmin, reportsRoutes);
app.use('/api/admin/revenue', requireAdmin, revenueRoutes);
app.use('/api/admin/payouts', requireAdmin, payoutRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});
