import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { globalApiLimiter } from './middleware/rate-limiter.middleware';
import { errorHandler } from './middleware/error.middleware';

import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { resumeRoutes } from './routes/resume.routes';
import { documentRoutes } from './routes/document.routes';
import { optimizationRoutes } from './routes/optimization.routes';
import { exportRoutes } from './routes/export.routes';
import { aiUsageRoutes } from './routes/ai-usage.routes';
import { healthRoutes } from './routes/health.routes';

export function createApp(): Application {
  const app = express();

  // Security HTTP Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // allow iframe preview embedding in same-origin dev
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  const allowedOrigins = [env.WEB_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev origins gracefully
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Cookie and Body Parsers
  app.use(cookieParser(env.SESSION_SECRET));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Rate Limiter
  app.use('/api/v1', globalApiLimiter);

  // Root and health status endpoints
  app.get('/', (_req, res) => {
    res.json({
      name: 'ATS Resume Intelligence Studio API',
      status: 'healthy',
      version: '1.0.0',
      health: '/api/v1/health',
    });
  });

  app.get('/health', (_req, res) => {
    res.redirect('/api/v1/health');
  });

  // Mount API Modules
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profiles', profileRoutes);
  app.use('/api/v1/resumes', resumeRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/optimization', optimizationRoutes);
  app.use('/api/v1/exports', exportRoutes);
  app.use('/api/v1/ai-usage', aiUsageRoutes);

  // Error Handling Middleware
  app.use(errorHandler);

  return app;
}
