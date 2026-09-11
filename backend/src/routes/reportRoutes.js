import express from 'express';
import { generateReport, getReport } from '../controllers/reportController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/:id', aiRateLimiter, generateReport);
router.get('/:id', getReport);

export default router;
