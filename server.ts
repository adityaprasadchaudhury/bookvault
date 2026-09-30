import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { ENV } from './server/src/config/env.ts';
import apiRouter from './server/src/routes/index.ts';
import { errorHandler } from './server/src/middlewares/errorHandler.middleware.ts';
import { StorageService } from './server/src/services/storage.service.ts';

async function startServer() {
  const app = express();
  const PORT = ENV.PORT || 3000;

  // Enable trust proxy for reverse-proxy environments (Google Cloud Run / Ingress)
  app.set('trust proxy', 1);

  // Initialize server storage directories
  StorageService.ensureStorageDirectory();

  // 1. Security Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite development mode and dynamic SVG covers
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body Parsing with strict size limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Helper key generator that safely extracts client IP from proxy headers
  const getClientIp = (req: express.Request): string => {
    return (
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    );
  };

  // 4. Rate Limiting Protection (with proxy validation safely configured)
  // General API rate limiter (1000 requests per 15 minutes)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  });
  app.use('/api', generalLimiter);

  // Strict rate limiter for Authentication (30 requests per 15 min to prevent brute force)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false,
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Payment rate limiter (60 orders/verifications per 15 min)
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false,
    message: { error: 'Payment request limit reached. Please wait before retrying.' },
  });
  app.use('/api/payments', paymentLimiter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'BookStore API',
      security: {
        helmet: 'enabled',
        rateLimiting: 'active',
        cryptography: 'HMAC-SHA256',
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get(['/standalone', '/html', '/html-version'], (_req, res) => {
    res.redirect('/html-css-js/index.html');
  });

  // Direct 1-click project ZIP download routes for GitHub and Netlify
  app.get(
    [
      '/bookstore-github-netlify.zip',
      '/download.zip',
      '/download-project.zip',
      '/project.zip',
      '/github.zip',
      '/netlify.zip',
      '/download-github.zip',
      '/bookstore-github-ready.zip',
    ],
    (_req, res) => {
      const zipPath = path.resolve(process.cwd(), 'bookstore-github-netlify.zip');
      if (fs.existsSync(zipPath)) {
        return res.download(zipPath, 'bookstore-github-netlify.zip');
      }
      res.redirect('/api/export/project.zip');
    }
  );

  app.use('/css', express.static(path.resolve(process.cwd(), 'css')));
  app.use('/js', express.static(path.resolve(process.cwd(), 'js')));

  // Mount API router
  app.use('/api', apiRouter);

  // Centralized Error Handling Middleware for all API routes
  app.use(errorHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BookStore Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
