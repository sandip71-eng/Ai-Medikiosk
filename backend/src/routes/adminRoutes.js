import express from 'express';
import {
  listConsultations,
  getAdminConsultation,
  getStatistics,
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require JWT authentication and clinician/admin authorization
router.use(authenticate);
router.use(authorize('admin', 'doctor'));

// Analytics and summary
router.get('/statistics', getStatistics);

// Consultations list (paginated)
router.get('/consultations', listConsultations);

// Single consultation complete clinical record
router.get('/consultations/:id', getAdminConsultation);

export default router;
