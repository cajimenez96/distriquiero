import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './server/lib/mongodb.ts';

import authRoutes from './server/routes/auth.ts';
import catalogRoutes from './server/routes/catalog.ts';
import ordersRoutes from './server/routes/orders.ts';
import adminProductsRoutes from './server/routes/adminProducts.ts';
import adminUploadRoutes from './server/routes/adminUpload.ts';
import adminAuditRoutes from './server/routes/adminAudit.ts';
import adminUsersRoutes from './server/routes/adminUsers.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Request Logger for terminal visibility
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Attempt database connection
  connectToDatabase().catch((err) => {
    console.warn('Initial MongoDB connection attempt deferred:', err.message);
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'DistriQuiero Direct Wholesale & Retail Commerce',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/catalog', catalogRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/admin/products', adminProductsRoutes);
  app.use('/api/admin/upload', adminUploadRoutes);
  app.use('/api/admin/audit-logs', adminAuditRoutes);
  app.use('/api/admin/users', adminUsersRoutes);

  // Catch unmatched API routes to return clean JSON 404 instead of falling through to Vite SPA
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DistriQuiero Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
