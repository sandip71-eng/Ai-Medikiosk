import fs from 'fs';
import { speechToText, textToSpeech, detectLanguage } from '../services/sarvamService.js';
import { AppError } from '../middleware/errorMiddleware.js';
import logger from '../utils/logger.js';

/**
 * Transcribe audio upload using Sarvam Saaras STT
 * POST /api/speech/transcribe
 */
export const transcribeAudio = async (req, res, next) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return next(new AppError('No audio file provided in request (multipart/form-data with "audio" field)', 400, 'FILE_MISSING'));
    }

    tempFilePath = req.file.path;
    const languageCode = req.body.languageCode;

    const result = await speechToText(tempFilePath, req.file.originalname, languageCode);

    res.status(200).json({
      success: true,
      data: {
        transcript: result.transcript,
        languageCode: result.languageCode,
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

/**
 * Synthesize speech audio from text using Sarvam Bulbul TTS
 * POST /api/speech/synthesize
 */
export const synthesizeSpeech = async (req, res, next) => {
  try {
    const { text, languageCode = 'en-IN' } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return next(new AppError('Text is required for speech synthesis', 400, 'VALIDATION_ERROR'));
    }

    const detectedLang = languageCode || detectLanguage(text);
    const result = await textToSpeech(text.trim(), detectedLang);

    res.status(200).json({
      success: true,
      data: {
        audio: result.audio,
        audioUrl: result.audioUrl,
        format: result.format,
        languageCode: result.languageCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  transcribeAudio,
  synthesizeSpeech,
};
