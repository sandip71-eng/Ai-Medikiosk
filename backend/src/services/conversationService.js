import { detectEmergency } from './emergencyService.js';
import { generateMedicalResponse } from './qwenService.js';
import logger from '../utils/logger.js';

const ALL_CLINICAL_FIELDS = [
  'chiefComplaint',
  'onset',
  'duration',
  'location',
  'character',
  'severity',
  'associatedSymptoms',
  'aggravatingRelieving',
  'medicalHistory',
  'currentMedications',
  'allergies',
];

const PAIN_KEYWORDS = [
  'pain',
  'ache',
  'aching',
  'hurt',
  'hurts',
  'sore',
  'cramp',
  'throbbing',
  'burning',
  'stabbing',
  'dard',
  'dukha',
  'peeda',
];

/**
 * Checks if the chief complaint or symptoms indicate pain
 */
export const checkIsPainComplaint = (text = '') => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PAIN_KEYWORDS.some((kw) => lower.includes(kw));
};

/**
 * Calculate missing fields based on completed fields
 */
export const calculateMissingFields = (completedFields = [], isPain = false) => {
  const baseFields = isPain
    ? [
        'chiefComplaint',
        'painSite',
        'painOnset',
        'painCharacter',
        'painRadiation',
        'painSeverity',
        'medicalHistory',
        'currentMedications',
        'allergies',
      ]
    : ALL_CLINICAL_FIELDS;

  return baseFields.filter((f) => !completedFields.includes(f));
};

/**
 * Determine the next conversation stage based on captured information
 */
export const determineNextStage = (currentStage, clinicalState = {}) => {
  const { completedFields = [], isPainComplaint = false } = clinicalState;

  if (!completedFields.includes('chiefComplaint')) {
    return 'CHIEF_COMPLAINT';
  }

  // Check HPI / SOCRATES completion
  const hpiFields = isPainComplaint
    ? ['painSite', 'painOnset', 'painSeverity']
    : ['onset', 'duration', 'severity'];

  const hasHpi = hpiFields.some((f) => completedFields.includes(f));

  if (!hasHpi && currentStage === 'CHIEF_COMPLAINT') {
    return 'HPI_SOCRATES';
  }

  if (currentStage === 'HPI_SOCRATES') {
    if (!completedFields.includes('medicalHistory')) {
      return 'PAST_MEDICAL_HISTORY';
    }
  }

  if (currentStage === 'PAST_MEDICAL_HISTORY') {
    if (!completedFields.includes('currentMedications') || !completedFields.includes('allergies')) {
      return 'MEDICATIONS_ALLERGIES';
    }
  }

  if (currentStage === 'MEDICATIONS_ALLERGIES') {
    return 'REVIEW_OF_SYSTEMS';
  }

  if (currentStage === 'REVIEW_OF_SYSTEMS') {
    return 'COMPLETED';
  }

  return currentStage || 'CHIEF_COMPLAINT';
};

/**
 * Process a message turn in the medical conversation
 */
export const processTurn = async ({
  consultation,
  patientMessage,
  languageCode = 'en-IN',
  inputType = 'text',
}) => {
  // 1. Check Independent Emergency Red-Flags FIRST
  const emergencyCheck = detectEmergency(patientMessage);

  if (emergencyCheck.isEmergency) {
    logger.warn(
      { consultationId: consultation.consultationId, flags: emergencyCheck.redFlags },
      'Medical Emergency Detected in Patient Message'
    );

    // Update consultation status immediately
    consultation.urgency = 'emergency';
    consultation.status = 'emergency_stopped';
    consultation.clinicalState.redFlags = Array.from(
      new Set([...(consultation.clinicalState.redFlags || []), ...emergencyCheck.redFlags])
    );

    const assistantEmergencyMessage = emergencyCheck.message;

    // Record both messages in consultation transcript
    consultation.messages.push({
      role: 'patient',
      content: patientMessage,
      timestamp: new Date(),
      language: languageCode,
      inputType,
    });

    consultation.messages.push({
      role: 'assistant',
      content: assistantEmergencyMessage,
      timestamp: new Date(),
      language: languageCode,
      inputType: 'text',
    });

    if (consultation.consent?.dataConsent !== false && typeof consultation.save === 'function') {
      await consultation.save();
    }

    return {
      message: assistantEmergencyMessage,
      stage: consultation.conversationStage,
      urgency: 'emergency',
      followUpRequired: false,
      isEmergency: true,
      redFlags: emergencyCheck.redFlags,
    };
  }

  // 2. Normal clinical intake flow
  // Append patient message
  consultation.messages.push({
    role: 'patient',
    content: patientMessage,
    timestamp: new Date(),
    language: languageCode,
    inputType,
  });

  // Check if complaint involves pain
  if (!consultation.clinicalState.isPainComplaint) {
    if (checkIsPainComplaint(patientMessage) || checkIsPainComplaint(consultation.clinicalState.chiefComplaint)) {
      consultation.clinicalState.isPainComplaint = true;
    }
  }

  const currentStage = consultation.conversationStage || 'CHIEF_COMPLAINT';
  const completedFields = consultation.clinicalState.completedFields || [];
  const missingFields = calculateMissingFields(completedFields, consultation.clinicalState.isPainComplaint);

  // 3. Call Qwen LLM for clinical dialogue turn
  const llmResult = await generateMedicalResponse({
    messages: consultation.messages,
    language: languageCode,
    patientContext: {
      consultationId: consultation.consultationId,
      patientId: consultation.patientId,
    },
    conversationStage: currentStage,
    completedFields,
    missingFields,
    redFlags: consultation.clinicalState.redFlags || [],
    isPainComplaint: consultation.clinicalState.isPainComplaint,
    dashavidhaMode: consultation.dashavidhaMode,
  });

  // 4. Update clinical state from LLM extracted data
  const updatedCompleted = Array.from(
    new Set([...completedFields, ...(llmResult.completedFields || [])])
  );

  // If first stage and chief complaint captured, record it
  if (!consultation.clinicalState.chiefComplaint && llmResult.extractedData?.chiefComplaint) {
    consultation.clinicalState.chiefComplaint = llmResult.extractedData.chiefComplaint;
    updatedCompleted.push('chiefComplaint');
  } else if (!consultation.clinicalState.chiefComplaint && currentStage === 'CHIEF_COMPLAINT') {
    consultation.clinicalState.chiefComplaint = patientMessage.slice(0, 150);
    updatedCompleted.push('chiefComplaint');
  }

  // Update SOCRATES if pain complaint
  if (llmResult.extractedData?.painSocrates) {
    consultation.clinicalState.painSocrates = {
      ...consultation.clinicalState.painSocrates,
      ...llmResult.extractedData.painSocrates,
    };
  }

  consultation.clinicalState.completedFields = updatedCompleted;
  consultation.clinicalState.missingFields = calculateMissingFields(
    updatedCompleted,
    consultation.clinicalState.isPainComplaint
  );

  // Progress conversation stage
  const nextStage = determineNextStage(currentStage, consultation.clinicalState);
  consultation.conversationStage = nextStage;
  consultation.urgency = llmResult.urgency || consultation.urgency || 'routine';

  // 5. Append assistant response
  consultation.messages.push({
    role: 'assistant',
    content: llmResult.response,
    timestamp: new Date(),
    language: languageCode,
    inputType: 'text',
  });

  // Persist if consent allows
  if (consultation.consent?.dataConsent !== false && typeof consultation.save === 'function') {
    await consultation.save();
  }

  return {
    message: llmResult.response,
    stage: consultation.conversationStage,
    urgency: consultation.urgency,
    followUpRequired: llmResult.followUpRequired ?? true,
    isEmergency: false,
    redFlags: consultation.clinicalState.redFlags || [],
  };
};

export default {
  processTurn,
  determineNextStage,
  calculateMissingFields,
  checkIsPainComplaint,
};
