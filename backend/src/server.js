import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import logger from './utils/logger.js';

let server;

const startServer = async () => {
  // 1. Connect to MongoDB (with retry/graceful handling in development)
  try {
    await connectDB();
  } catch (error) {
    logger.warn(
      '⚠️  Could not connect to MongoDB Atlas immediately. Most common cause: Current IP address is not whitelisted on MongoDB Atlas.'
    );
    logger.warn('👉 To whitelist your IP: Go to https://cloud.mongodb.com -> Network Access -> + Add IP Address -> Select "Allow Access From Anywhere (0.0.0.0/0)" or "Add Current IP Address".');

    if (env.NODE_ENV === 'production') {
      logger.error('Exiting process because database connection is required in production.');
      process.exit(1);
    } else {
      logger.info('Running in development mode: Starting HTTP server. Database will retry connecting in background...');
      // Retry connecting every 10 seconds in development
      const retryInterval = setInterval(async () => {
        try {
          await connectDB();
          clearInterval(retryInterval);
        } catch (retryErr) {
          // Keep retrying quietly
        }
      }, 10000);
    }
  }

  // 2. Start HTTP Listener
  server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        qwenModel: env.QWEN_MODEL,
      },
      `🚀 MediKiosk AI Backend running on http://localhost:${env.PORT}`
    );
  });
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, 'Graceful shutdown initiated');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectDB();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (err) {
        logger.error({ err: err.message }, 'Error closing database connection');
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  // Force close if graceful shutdown takes longer than 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason: reason instanceof Error ? reason.message : reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught Exception');
  process.exit(1);
});

startServer();
