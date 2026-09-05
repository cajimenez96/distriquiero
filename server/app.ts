import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, isMongoConnected } from './lib/mongodb.ts';

import authRoutes from './routes/auth.ts';
import catalogRoutes from './routes/catalog.ts';
import ordersRoutes from './routes/orders.ts';
import adminProductsRoutes from './routes/adminProducts.ts';
import adminUploadRoutes from './routes/adminUpload.ts';
import adminAuditRoutes from './routes/adminAudit.ts';
import adminUsersRoutes from './routes/adminUsers.ts';

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Request Logger for terminal and cloud log visibility
app.use((req, _res, next) => {
  const url = req.originalUrl || req.url;
  if (url.startsWith('/api') || url.startsWith('/catalog') || url.startsWith('/auth') || url.startsWith('/orders') || url.startsWith('/admin')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url}`);
  }
  next();
});

// Lazy database connection middleware for serverless environments (Vercel)
app.use(async (_req, _res, next) => {
  try {
    if (!isMongoConnected() && process.env.MONGODB_URI) {
      await connectToDatabase();
    }
  } catch (err: any) {
    console.warn('Deferred MongoDB connection in serverless middleware:', err.message);
  }
  next();
});

// Health check
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'DistriQuiero Direct Wholesale & Retail Commerce',
    timestamp: new Date().toISOString(),
    database: isMongoConnected() ? 'connected' : 'fallback-memory'
  });
});

// API Routes - mounted on both /api/* and direct /* (for Vercel rewrites resilience)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/catalog', '/catalog'], catalogRoutes);
app.use(['/api/orders', '/orders'], ordersRoutes);
app.use(['/api/admin/products', '/admin/products'], adminProductsRoutes);
app.use(['/api/admin/upload', '/admin/upload'], adminUploadRoutes);
app.use(['/api/admin/audit-logs', '/admin/audit-logs'], adminAuditRoutes);
app.use(['/api/admin/users', '/admin/users'], adminUsersRoutes);

export default app;
