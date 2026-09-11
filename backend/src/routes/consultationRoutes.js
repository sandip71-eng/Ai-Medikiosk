import express from 'express';
import { z } from 'zod';
import {
  createConsultation,
  getConsultation,
  sendMessage,
  handleAudioMessage,
} from '../controllers/consultationController.js';
import { generateReport, getReport } from '../controllers/reportController.js';
import { audioUpload, promptInjectionGuard } from '../middleware/securityMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const createConsultationSchema = z.object({
  language: z.string().optional().default('en-IN'),
  patientInfo: z
    .object({
      age: z.number().min(0).max(130).optional(),
      gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
      anonymous: z.boolean().optional(),
    })
    .optional(),
  consent: z
    .object({
      dataConsent: z.boolean().optional().default(true),
      audioConsent: z.boolean().optional().default(true),
    })
    .optional(),
  dashavidhaMode: z.boolean().optional().default(false),
});

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  languageCode: z.string().optional(),
});

// Start new consultation
router.post('/', validate({ body: createConsultationSchema }), createConsultation);

// Get consultation details / state
router.get('/:id', getConsultation);

// Patient text message turn
router.post(
  '/:id/message',
  aiRateLimiter,
  validate({ body: messageSchema }),
  promptInjectionGuard,
  sendMessage
);

// Patient audio message turn
router.post(
  '/:id/audio',
  aiRateLimiter,
  audioUpload.single('audio'),
  handleAudioMessage
);

// Consultation report generation and retrieval
router.post('/:id/report', aiRateLimiter, generateReport);
router.get('/:id/report', getReport);

export default router;
