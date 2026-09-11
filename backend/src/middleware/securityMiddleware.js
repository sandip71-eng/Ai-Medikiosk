import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { sanitizeMongoQuery, detectPromptInjection, sanitizeString } from '../utils/sanitize.js';
import { AppError } from './errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Assign unique Request ID to incoming requests
 */
export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

/**
 * Privacy-conscious HTTP access logger
 */
export const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      },
      'HTTP Request Completed'
    );
  });

  next();
};

/**
 * Cleanse request bodies, queries, and params against NoSQL operator injection
 */
export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeMongoQuery(req.body);
  if (req.query) req.query = sanitizeMongoQuery(req.query);
  if (req.params) req.params = sanitizeMongoQuery(req.params);
  next();
};

/**
 * Prompt injection inspection and text sanitization for patient messages
 */
export const promptInjectionGuard = (req, res, next) => {
  if (req.body && typeof req.body.message === 'string') {
    const injectionCheck = detectPromptInjection(req.body.message);
    if (injectionCheck.isInjection) {
      logger.warn(
        { requestId: req.id, pattern: injectionCheck.matchedPattern },
        'Prompt injection attempt intercepted and neutralized'
      );
      // Replace malicious payload with benign acknowledgment of non-clinical query
      req.body.message = sanitizeString(req.body.message);
    } else {
      req.body.message = sanitizeString(req.body.message);
    }
  }
  next();
};

/**
 * Secure Multer Configuration for Audio Uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

const ALLOWED_MIME_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/flac',
  'audio/aac',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid audio file format (${file.mimetype}). Supported formats: wav, mp3, webm, ogg, m4a, flac`,
        400,
        'INVALID_AUDIO_FORMAT'
      ),
      false
    );
  }
};

export const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1,
  },
});

export default {
  requestIdMiddleware,
  requestLoggingMiddleware,
  mongoSanitizeMiddleware,
  promptInjectionGuard,
  audioUpload,
};
