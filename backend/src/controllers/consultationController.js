import crypto from 'crypto';
import fs from 'fs';
import Consultation from '../models/Consultation.js';
import Patient from '../models/Patient.js';
import { processTurn } from '../services/conversationService.js';
import { speechToText, textToSpeech } from '../services/sarvamService.js';
import { generateMedicalResponse } from '../services/qwenService.js';
import { detectEmergency } from '../services/emergencyService.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { isDBConnected } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * In-memory ephemeral consultation store for when MongoDB is unavailable.
 * Keyed by consultationId. Cleared on process restart.
 */
const ephemeralStore = new Map();

/**
 * Build an ephemeral consultation object (no Mongoose, works without DB)
 */
const buildEphemeralConsultation = ({ consultationId, patientId, language, consent, dashavidhaMode, initialGreeting }) => {
  const obj = {
    consultationId,
    patientId,
    language,
    status: 'active',
    urgency: 'routine',
    conversationStage: 'CHIEF_COMPLAINT',
    dashavidhaMode: Boolean(dashavidhaMode),
    consent: { dataConsent: false, audioConsent: consent?.audioConsent ?? true },
    messages: [
      {
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date(),
        language,
        inputType: 'text',
      },
    ],
    clinicalState: {
      chiefComplaint: '',
      isPainComplaint: false,
      completedFields: [],
      missingFields: ['chiefComplaint', 'onset', 'duration', 'severity', 'associatedSymptoms', 'medicalHistory', 'currentMedications', 'allergies'],
      redFlags: [],
      painSocrates: {},
      dashavidhaAssessment: null,
    },
    report: null,
    clinicalSummary: '',
    // Stub save() so services don't throw when calling consultation.save()
    save: async () => {},
  };
  return obj;
};

/**
 * Start a new consultation session
 * POST /api/consultations
 */
export const createConsultation = async (req, res, next) => {
  try {
    const {
      language = 'en-IN',
      patientInfo = {},
      consent = { dataConsent: true, audioConsent: true },
      dashavidhaMode = false,
    } = req.body;

    const consultationId = `cst_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const patientId = `pat_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

    const initialGreeting =
      language.startsWith('hi')
        ? 'नमस्ते। मैं आपका स्वास्थ्य सहायक हूँ। आज आपको क्या परेशानी महसूस हो रही है?'
        : language.startsWith('od')
        ? 'ନମସ୍କାର। ଆପଣଙ୍କୁ ଆଜି କ\'ଣ ଅସୁବିଧା ହେଉଛି?'
        : 'Hello. I am your AI health assistant. What brings you to the clinic today? Please describe what you are experiencing.';

    // If DB is connected and consent given, persist to MongoDB
    if (isDBConnected() && consent.dataConsent !== false) {
      try {
        await Patient.create({
          patientId,
          age: patientInfo.age,
          gender: patientInfo.gender,
          anonymous: patientInfo.anonymous ?? true,
        });

        const consultation = await Consultation.create({
          consultationId,
          patientId,
          language,
          status: 'active',
          urgency: 'routine',
          conversationStage: 'CHIEF_COMPLAINT',
          dashavidhaMode: Boolean(dashavidhaMode),
          consent: {
            dataConsent: consent.dataConsent ?? true,
            audioConsent: consent.audioConsent ?? true,
            timestamp: new Date(),
          },
          messages: [
            {
              role: 'assistant',
              content: initialGreeting,
              language,
              inputType: 'text',
            },
          ],
        });

        return res.status(201).json({
          success: true,
          data: {
            consultationId: consultation.consultationId,
            status: consultation.status,
            initialMessage: initialGreeting,
          },
        });
      } catch (dbErr) {
        logger.warn({ err: dbErr.message }, 'DB write failed, falling back to ephemeral session');
      }
    }

    // Ephemeral fallback (DB unavailable OR consent declined)
    const ephemeral = buildEphemeralConsultation({
      consultationId,
      patientId,
      language,
      consent,
      dashavidhaMode,
      initialGreeting,
    });
    ephemeralStore.set(consultationId, ephemeral);

    logger.info({ consultationId }, 'Created ephemeral consultation (DB offline or consent declined)');

    return res.status(201).json({
      success: true,
      data: {
        consultationId,
        status: 'active',
        initialMessage: initialGreeting,
        ephemeral: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: resolve consultation from DB or ephemeral store
 */
const resolveConsultation = async (id) => {
  // Try DB first if connected
  if (isDBConnected()) {
    try {
      const dbConsultation = await Consultation.findOne({ consultationId: id });
      if (dbConsultation) return dbConsultation;
    } catch (e) {
      // fall through to ephemeral
    }
  }
  // Try ephemeral store
  const ephemeral = ephemeralStore.get(id);
  return ephemeral || null;
};

/**
 * Get public consultation status
 * GET /api/consultations/:id
 */
export const getConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultation = await resolveConsultation(id);

    if (!consultation) {
      return next(new AppError('Consultation not found', 404, 'NOT_FOUND'));
    }

    const isMongoose = typeof consultation.toClientJSON === 'function';
    res.status(200).json({
      success: true,
      data: isMongoose ? consultation.toClientJSON() : {
        consultationId: consultation.consultationId,
        status: consultation.status,
        urgency: consultation.urgency,
        conversationStage: consultation.conversationStage,
        messagesCount: consultation.messages.length,
        ephemeral: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send text message in consultation
 * POST /api/consultations/:id/message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, languageCode } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return next(new AppError('Message is required', 400, 'VALIDATION_ERROR'));
    }

    const consultation = await resolveConsultation(id);
    if (!consultation) {
      return next(new AppError('Consultation not found. Please start a new session.', 404, 'NOT_FOUND'));
    }

    if (consultation.status === 'emergency_stopped') {
      return res.status(200).json({
        success: true,
        data: {
          message: 'This consultation has been halted due to a critical emergency red flag. Please seek immediate in-person emergency care.',
          stage: consultation.conversationStage,
          urgency: 'emergency',
          followUpRequired: false,
        },
      });
    }

    const targetLang = languageCode || consultation.language || 'en-IN';

    const turnResult = await processTurn({
      consultation,
      patientMessage: message.trim(),
      languageCode: targetLang,
      inputType: 'text',
    });

    // Update ephemeral store if not from DB
    if (ephemeralStore.has(id)) {
      ephemeralStore.set(id, consultation);
    }

    res.status(200).json({
      success: true,
      data: {
        message: turnResult.message,
        stage: turnResult.stage,
        urgency: turnResult.urgency,
        followUpRequired: turnResult.followUpRequired,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle audio input message in consultation
 * POST /api/consultations/:id/audio
 */
export const handleAudioMessage = async (req, res, next) => {
  let tempFilePath = null;
  try {
    const { id } = req.params;
    const languageCodeParam = req.body.languageCode;
    const synthesizeReply = req.body.synthesizeReply !== 'false';

    if (!req.file) {
      return next(new AppError('No audio file provided', 400, 'FILE_MISSING'));
    }

    tempFilePath = req.file.path;

    const consultation = await resolveConsultation(id);
    if (!consultation) {
      return next(new AppError('Consultation not found', 404, 'NOT_FOUND'));
    }

    if (consultation.status === 'emergency_stopped') {
      return res.status(200).json({
        success: true,
        data: {
          transcript: '',
          response: 'This consultation has been halted due to a critical emergency red flag. Please seek immediate in-person emergency care.',
          languageCode: consultation.language,
          urgency: 'emergency',
          audio: null,
        },
      });
    }

    const targetLang = languageCodeParam || consultation.language;
    const sttResult = await speechToText(tempFilePath, req.file.originalname, targetLang);

    if (!sttResult.transcript || sttResult.transcript.trim() === '') {
      return next(new AppError('Could not detect speech in audio. Please speak closer to the microphone.', 400, 'AUDIO_EMPTY'));
    }

    const turnResult = await processTurn({
      consultation,
      patientMessage: sttResult.transcript,
      languageCode: sttResult.languageCode || targetLang,
      inputType: 'audio',
    });

    if (ephemeralStore.has(id)) {
      ephemeralStore.set(id, consultation);
    }

    let audioData = null;
    if (synthesizeReply && turnResult.message) {
      try {
        const ttsResult = await textToSpeech(turnResult.message, sttResult.languageCode || targetLang);
        audioData = ttsResult.audio;
      } catch (ttsErr) {
        logger.warn({ err: ttsErr.message }, 'Failed to synthesize assistant response audio');
      }
    }

    res.status(200).json({
      success: true,
      data: {
        transcript: sttResult.transcript,
        response: turnResult.message,
        languageCode: sttResult.languageCode || targetLang,
        urgency: turnResult.urgency,
        audio: audioData,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (tempFilePath) {
      fs.promises.unlink(tempFilePath).catch((err) => {
        logger.warn({ path: tempFilePath, err: err.message }, 'Failed to delete temporary audio file');
      });
    }
  }
};

export default {
  createConsultation,
  getConsultation,
  sendMessage,
  handleAudioMessage,
};
