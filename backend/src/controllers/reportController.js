import Consultation from '../models/Consultation.js';
import Patient from '../models/Patient.js';
import { buildConsultationReport } from '../services/reportService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Generate consultation report
 * POST /api/consultations/:id/report
 */
export const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOne({ consultationId: id });
    if (!consultation) {
      return next(new AppError('Consultation not found', 404, 'NOT_FOUND'));
    }

    if (!consultation.messages || consultation.messages.length < 2) {
      return next(
        new AppError(
          'Insufficient conversation history to generate a clinical consultation report.',
          400,
          'INSUFFICIENT_DATA'
        )
      );
    }

    // Load patient details if present
    const patient = await Patient.findOne({ patientId: consultation.patientId });

    const report = await buildConsultationReport({
      consultation,
      patientContext: patient
        ? {
            age: patient.age,
            gender: patient.gender,
            anonymous: patient.anonymous,
          }
        : {},
    });

    res.status(200).json({
      success: true,
      data: {
        consultationId: consultation.consultationId,
        status: consultation.status,
        urgency: consultation.urgency,
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve already generated report
 * GET /api/consultations/:id/report
 */
export const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findOne({ consultationId: id });
    if (!consultation) {
      return next(new AppError('Consultation not found', 404, 'NOT_FOUND'));
    }

    if (!consultation.report) {
      return next(
        new AppError(
          'No report has been generated for this consultation yet. Please call POST /api/consultations/:id/report first.',
          404,
          'REPORT_NOT_GENERATED'
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        consultationId: consultation.consultationId,
        status: consultation.status,
        urgency: consultation.urgency,
        report: consultation.report,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateReport,
  getReport,
};
