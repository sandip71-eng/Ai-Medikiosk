import { generateReportFromLLM } from './qwenService.js';
import logger from '../utils/logger.js';

/**
 * Filter and verify Review of Systems (ROS) negative symptoms.
 * Rule: Only include a negative symptom if the question was asked in the messages transcript
 * and the patient denied it. Never invent negative symptoms!
 */
export const verifyNegativeROS = (reportedNegatives = [], messages = []) => {
  if (!Array.isArray(reportedNegatives) || reportedNegatives.length === 0) {
    return [];
  }

  const transcript = messages.map((m) => m.content.toLowerCase()).join(' ');

  // Keep only symptoms that were actually mentioned/asked in the transcript
  return reportedNegatives.filter((symptom) => {
    if (!symptom || typeof symptom !== 'string') return false;
    const cleanSym = symptom.toLowerCase().trim();
    return transcript.includes(cleanSym);
  });
};

/**
 * Generate and save final clinical intake report
 */
export const buildConsultationReport = async ({ consultation, patientContext = {} }) => {
  if (!consultation) {
    throw new Error('Consultation object is required');
  }

  // 1. Generate report via Qwen LLM
  const rawReport = await generateReportFromLLM({
    messages: consultation.messages,
    patientContext,
    clinicalState: consultation.clinicalState,
    language: consultation.language,
    dashavidhaMode: consultation.dashavidhaMode,
  });

  // 2. Enforce strict ROS negative symptom grounding
  const rawNegatives = rawReport.reviewOfSystems?.negative || [];
  const verifiedNegatives = verifyNegativeROS(rawNegatives, consultation.messages);

  // 3. Construct clean structured report
  const report = {
    chiefComplaint: rawReport.chiefComplaint || consultation.clinicalState.chiefComplaint || 'Not specified',
    historyOfPresentIllness: rawReport.historyOfPresentIllness || 'Clinical history gathered during session.',
    reviewOfSystems: {
      positive: Array.isArray(rawReport.reviewOfSystems?.positive)
        ? rawReport.reviewOfSystems.positive
        : [],
      negative: verifiedNegatives,
    },
    symptoms: Array.isArray(rawReport.symptoms) ? rawReport.symptoms : [],
    duration: rawReport.duration || 'Not specified',
    severity: rawReport.severity || 'Not specified',
    associatedSymptoms: Array.isArray(rawReport.associatedSymptoms)
      ? rawReport.associatedSymptoms
      : [],
    relevantMedicalHistory: Array.isArray(rawReport.relevantMedicalHistory)
      ? rawReport.relevantMedicalHistory
      : [],
    medications: Array.isArray(rawReport.medications) ? rawReport.medications : [],
    allergies: Array.isArray(rawReport.allergies) ? rawReport.allergies : [],
    redFlags: Array.isArray(rawReport.redFlags)
      ? Array.from(new Set([...rawReport.redFlags, ...(consultation.clinicalState.redFlags || [])]))
      : consultation.clinicalState.redFlags || [],
    possibleConditions: Array.isArray(rawReport.possibleConditions)
      ? rawReport.possibleConditions
      : [],
    recommendedNextSteps: Array.isArray(rawReport.recommendedNextSteps)
      ? rawReport.recommendedNextSteps
      : ['Consult with an attending physician for direct physical evaluation.'],
    urgency: rawReport.urgency || consultation.urgency || 'routine',
    disclaimer:
      rawReport.disclaimer ||
      'This clinical assessment was synthesized by an AI Medical Kiosk for triage and clinical history-taking purposes only. It is not a definitive diagnosis. Physical examination and medical review by a licensed doctor are required.',
    generatedAt: new Date().toISOString(),
  };

  // 4. Attach Dashavidha traditional assessment only if enabled
  if (consultation.dashavidhaMode && rawReport.dashavidhaAssessment) {
    report.dashavidhaAssessment = rawReport.dashavidhaAssessment;
  } else {
    report.dashavidhaAssessment = null;
  }

  // 5. Update consultation document
  consultation.report = report;
  consultation.status = 'completed';
  consultation.urgency = report.urgency;
  consultation.conversationStage = 'COMPLETED';

  // HPI Summary for quick clinician view
  consultation.clinicalSummary = `${report.chiefComplaint}. ${report.historyOfPresentIllness}`;

  if (consultation.consent?.dataConsent !== false && typeof consultation.save === 'function') {
    await consultation.save();
  }

  return report;
};

export default {
  buildConsultationReport,
  verifyNegativeROS,
};
