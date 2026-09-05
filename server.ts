import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.ts';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Catch unmatched API routes to return clean JSON 404 instead of falling through to Vite SPA
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
  });

  // Vite integration in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DistriQuiero Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
