import OpenAI from 'openai';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import { getMedicalSystemPrompt } from '../prompts/medicalSystemPrompt.js';
import { getReportPrompt } from '../prompts/reportPrompt.js';

/**
 * Factory to create OpenAI-compatible client configured from environment variables.
 * Works seamlessly with Alibaba Dashscope, OpenRouter, vLLM, Ollama, Together AI, or official OpenAI endpoints.
 */
export const createLLMClient = () => {
  if (!env.QWEN_API_KEY) {
    logger.warn('QWEN_API_KEY is not set. Real LLM completions will fail.');
  }

  return new OpenAI({
    apiKey: env.QWEN_API_KEY || 'dummy-key-for-init',
    baseURL: env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  });
};

const openai = createLLMClient();

const fallbackResponses = {
  'en-IN': {
    CHIEF_COMPLAINT: 'Thank you. When did this problem start, and how has it changed since then?',
    HPI_SOCRATES: 'Where do you feel the problem, and how severe is it on a scale from mild to severe?',
    PAST_MEDICAL_HISTORY: 'Have you had any important medical conditions or similar problems before?',
    MEDICATIONS_ALLERGIES: 'Are you taking any medicines, and do you have any known allergies?',
    REVIEW_OF_SYSTEMS: 'Are there any other symptoms you would like to tell me about?',
  },
  'hi-IN': {
    CHIEF_COMPLAINT: 'धन्यवाद। यह समस्या कब शुरू हुई और तब से इसमें क्या बदलाव आया है?',
    HPI_SOCRATES: 'यह समस्या कहाँ महसूस होती है और इसकी गंभीरता कैसी है?',
    PAST_MEDICAL_HISTORY: 'क्या पहले कोई महत्वपूर्ण बीमारी या ऐसी समस्या हुई है?',
    MEDICATIONS_ALLERGIES: 'क्या आप कोई दवा ले रहे हैं या आपको किसी दवा से एलर्जी है?',
    REVIEW_OF_SYSTEMS: 'क्या आप कोई अन्य लक्षण बताना चाहते हैं?',
  },
  'od-IN': {
    CHIEF_COMPLAINT: 'ଧନ୍ୟବାଦ। ଏହି ସମସ୍ୟା କେବେ ଆରମ୍ଭ ହେଲା ଏବଂ ସେବେଠାରୁ କିପରି ବଦଳିଛି?',
    HPI_SOCRATES: 'ଏହି ସମସ୍ୟା କେଉଁଠାରେ ଅନୁଭବ ହେଉଛି ଏବଂ ଏହା କେତେ ଗୁରୁତର?',
    PAST_MEDICAL_HISTORY: 'ଆପଣଙ୍କର ପୂର୍ବରୁ କୌଣସି ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ରୋଗ କିମ୍ବା ଏପରି ସମସ୍ୟା ହୋଇଥିଲା କି?',
    MEDICATIONS_ALLERGIES: 'ଆପଣ କୌଣସି ଔଷଧ ନେଉଛନ୍ତି କିମ୍ବା କୌଣସି ଔଷଧରେ ଆଲର୍ଜି ଅଛି କି?',
    REVIEW_OF_SYSTEMS: 'ଆପଣ ଅନ୍ୟ କୌଣସି ଲକ୍ଷଣ ବିଷୟରେ କହିବାକୁ ଚାହାଁନ୍ତି କି?',
  },
};

const getFallbackResponse = (language, conversationStage) => {
  const responses = fallbackResponses[language] || fallbackResponses['en-IN'];
  return {
    response: responses[conversationStage] || responses.REVIEW_OF_SYSTEMS,
    urgency: 'routine',
    followUpRequired: true,
    isPainComplaint: false,
    stage: conversationStage,
    completedFields: [],
    missingFields: [],
    extractedData: {},
  };
};

/**
 * Helper to safely extract JSON from LLM text that might have markdown code fences
 */
const parseJSONFromLLM = (text) => {
  if (!text) return null;
  try {
    // Direct JSON parse attempt
    return JSON.parse(text);
  } catch (e) {
    // Try finding JSON inside ```json ... ``` blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {
        // Fallback
      }
    }

    // Try finding first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (err) {
        // Fallback
      }
    }
  }
  return null;
};

/**
 * Generate structured clinical dialogue response
 */
export const generateMedicalResponse = async ({
  messages = [],
  language = 'en-IN',
  patientContext = {},
  conversationStage = 'CHIEF_COMPLAINT',
  completedFields = [],
  missingFields = [],
  redFlags = [],
  isPainComplaint = false,
  dashavidhaMode = false,
}) => {
  if (!env.QWEN_API_KEY) {
    return getFallbackResponse(language, conversationStage);
  }

  const systemPrompt = getMedicalSystemPrompt({
    language,
    conversationStage,
    completedFields,
    missingFields,
    redFlags,
    isPainComplaint,
    dashavidhaMode,
  });

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'patient' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system',
      content: m.content,
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: env.QWEN_MODEL || 'qwen-plus',
      messages: formattedMessages,
      temperature: 0.3, // Lower temperature for medical accuracy and adherence
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const parsed = parseJSONFromLLM(rawContent);

    if (parsed && parsed.response) {
      return {
        response: parsed.response,
        urgency: parsed.urgency || 'routine',
        followUpRequired: parsed.followUpRequired ?? true,
        isPainComplaint: parsed.isPainComplaint ?? isPainComplaint,
        stage: parsed.stage || conversationStage,
        completedFields: parsed.completedFields || completedFields,
        missingFields: parsed.missingFields || missingFields,
        extractedData: parsed.extractedData || {},
      };
    }

    // Fallback if model responded in plain text
    return {
      response: rawContent.trim(),
      urgency: 'routine',
      followUpRequired: true,
      isPainComplaint,
      stage: conversationStage,
      completedFields,
      missingFields,
      extractedData: {},
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Error in Qwen generateMedicalResponse');
    return getFallbackResponse(language, conversationStage);
  }
};

/**
 * Generate final structured clinical consultation report
 */
export const generateReportFromLLM = async ({
  messages = [],
  patientContext = {},
  clinicalState = {},
  language = 'en-IN',
  dashavidhaMode = false,
}) => {
  const prompt = getReportPrompt({
    messages,
    patientContext,
    clinicalState,
    language,
    dashavidhaMode,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: env.QWEN_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: 'You are a professional medical documentation AI. Respond ONLY with valid JSON conforming to the schema provided.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const parsed = parseJSONFromLLM(rawContent);

    if (parsed) {
      return parsed;
    }

    throw new Error('Failed to parse structured report JSON from LLM response');
  } catch (error) {
    logger.error({ error: error.message }, 'Error in Qwen generateReportFromLLM');
    throw error;
  }
};

export default {
  generateMedicalResponse,
  generateReportFromLLM,
  createLLMClient,
};
