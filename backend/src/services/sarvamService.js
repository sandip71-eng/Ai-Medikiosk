import fs from 'fs';
import path from 'path';
import env from '../config/env.js';
import logger from '../utils/logger.js';

// Supported Indian languages and scripts
export const SUPPORTED_LANGUAGES = [
  'en-IN',
  'hi-IN',
  'bn-IN',
  'te-IN',
  'ta-IN',
  'kn-IN',
  'ml-IN',
  'mr-IN',
  'gu-IN',
  'od-IN',
  'pa-IN',
];

/**
 * Detect Indian language code from text using script ranges and keyword markers
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en-IN';

  // Devanagari (Hindi, Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    // Basic Marathi distinguishing markers
    if (/[\u0933\u0934]|(आहे|नाही|झाले|कसे)/.test(text)) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }
  // Bengali / Assamese
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  // Odia
  if (/[\u0B00-\u0B7F]/.test(text)) return 'od-IN';

  // Default to Indian English
  return 'en-IN';
};

/**
 * Transcribe speech to text using Sarvam Saaras API
 * @param {string|Buffer} audioSource - Filepath or buffer
 * @param {string} originalFilename - e.g. "recording.wav"
 * @param {string} [languageCode] - Optional language code (e.g. "hi-IN", "en-IN")
 */
export const speechToText = async (audioSource, originalFilename = 'audio.wav', languageCode) => {
  if (!env.SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY is not configured');
  }

  const formData = new FormData();

  let fileBuffer;
  if (typeof audioSource === 'string') {
    fileBuffer = await fs.promises.readFile(audioSource);
  } else {
    fileBuffer = audioSource;
  }

  // Create standard Blob for native fetch FormData
  const audioBlob = new Blob([fileBuffer], { type: 'audio/wav' });
  formData.append('file', audioBlob, originalFilename);
  formData.append('model', env.SARVAM_STT_MODEL || 'saaras:v3');

  if (languageCode && languageCode !== 'auto' && languageCode !== 'unknown') {
    formData.append('language_code', languageCode);
  }

  const url = `${env.SARVAM_BASE_URL.replace(/\/$/, '')}/speech-to-text`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-subscription-key': env.SARVAM_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, errorText }, 'Sarvam STT request failed');
    throw new Error(`Sarvam STT failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  return {
    transcript: data.transcript || '',
    languageCode: data.language_code || languageCode || 'en-IN',
  };
};

/**
 * Synthesize speech from text using Sarvam Bulbul API
 * @param {string} text - The text to synthesize
 * @param {string} [languageCode='en-IN'] - Language code
 */
export const textToSpeech = async (text, languageCode = 'en-IN') => {
  if (!env.SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY is not configured');
  }

  const url = `${env.SARVAM_BASE_URL.replace(/\/$/, '')}/text-to-speech`;

  const payload = {
    inputs: [text],
    target_language_code: languageCode,
    speaker: env.SARVAM_TTS_SPEAKER || 'aditya',
    pitch: 0,
    pace: 1.0,
    loudness: 1.5,
    speech_sample_rate: 8000,
    enable_preprocessing: true,
    model: env.SARVAM_TTS_MODEL || 'bulbul:v3',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-subscription-key': env.SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, errorText }, 'Sarvam TTS request failed');
    throw new Error(`Sarvam TTS failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const base64Audio = (data.audios && data.audios[0]) || '';

  return {
    audio: base64Audio,
    audioUrl: base64Audio ? `data:audio/wav;base64,${base64Audio}` : null,
    format: 'audio/wav',
    languageCode,
  };
};

export default {
  SUPPORTED_LANGUAGES,
  detectLanguage,
  speechToText,
  textToSpeech,
};
