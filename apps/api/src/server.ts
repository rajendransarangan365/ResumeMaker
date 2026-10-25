import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  try {
    console.log('------------------------------------------------------------');
    console.log('   ATS RESUME INTELLIGENCE STUDIO - API SERVICE (v1.0.0)   ');
    console.log('------------------------------------------------------------');

    // Connect to MongoDB
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.API_PORT, () => {
      console.log(`[Express API] Listening at: http://localhost:${env.API_PORT}`);
      console.log(`[Express API] Environment: ${env.NODE_ENV}`);
      console.log(`[Express API] Allowed Origin: ${env.WEB_ORIGIN}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup failure:', error);
    process.exit(1);
  }
}

bootstrap();
