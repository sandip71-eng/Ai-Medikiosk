import express from 'express';
import { z } from 'zod';
import { transcribeAudio, synthesizeSpeech } from '../controllers/speechController.js';
import { audioUpload } from '../middleware/securityMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const synthesizeSchema = z.object({
  text: z.string().min(1, 'Text is required for speech synthesis').max(3000, 'Text exceeds 3000 characters limit'),
  languageCode: z.string().optional(),
});

// STT endpoint with rate limiter and file filter
router.post('/transcribe', aiRateLimiter, audioUpload.single('audio'), transcribeAudio);

// TTS endpoint with rate limiter and schema validation
router.post('/synthesize', aiRateLimiter, validate({ body: synthesizeSchema }), synthesizeSpeech);

export default router;
