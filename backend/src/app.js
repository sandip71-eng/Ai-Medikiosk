import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import env from './config/env.js';
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  mongoSanitizeMiddleware,
} from './middleware/securityMiddleware.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, AppError } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import speechRoutes from './routes/speechRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies/kiosk gateways
app.set('trust proxy', 1);

// 1. Security Headers
app.use(helmet());

// 2. CORS configuration
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, kiosk hardware)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Origin not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  })
);

// 3. Request parsing with strict size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 4. Request tracing and sanitization
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(mongoSanitizeMiddleware);

// 5. Global rate limiter
app.use(globalRateLimiter);

// 6. Root status and discovery endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediKiosk AI Medical Backend is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      consultations: '/api/consultations',
      speech: '/api/speech',
      reports: '/api/reports',
      auth: '/api/auth',
      admin: '/api/admin',
    },
    documentation: 'Refer to README.md for complete API documentation and cURL examples',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// 7. Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 8. 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
});

// 9. Centralized Error Handler
app.use(errorHandler);

export default app;
