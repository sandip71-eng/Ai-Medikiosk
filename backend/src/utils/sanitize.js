/**
 * Sanitization and Prompt Injection Defense Utilities
 */

// Known prompt injection and jailbreak signatures
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+|the\s+)?(previous|prior|above|system)\s+(instructions|prompts|rules)/i,
  /forget\s+(all\s+|the\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /system\s*prompt\s*(reveal|leak|show|display|print)/i,
  /you\s+are\s+now\s+(unfiltered|dan|developer\s+mode|jailbroken)/i,
  /bypass\s+(medical\s+)?(safety|rules|filters|guidelines)/i,
  /reveal\s+(your\s+)?(instructions|api\s*key|secrets|internal)/i,
  /repeat\s+(everything|the\s+words)\s+above/i,
  /output\s+initial\s+prompt/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\].*\[\/INST\]/i,
  /```system/i,
];

/**
 * Check if a text message contains prompt injection or jailbreak indicators
 */
export const detectPromptInjection = (text) => {
  if (!text || typeof text !== 'string') {
    return { isInjection: false, matchedPattern: null };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isInjection: true,
        matchedPattern: pattern.toString(),
      };
    }
  }

  return { isInjection: false, matchedPattern: null };
};

/**
 * Sanitize untrusted user string input against control characters, script tags, and delimiter injections
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';

  return str
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Escape HTML brackets
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Remove special prompt delimiter tags
    .replace(/<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\]/gi, '')
    .trim();
};

/**
 * Sanitize object recursively to prevent NoSQL injection ($gt, $ne, $where, etc.)
 */
export const sanitizeMongoQuery = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoQuery);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys starting with $ or containing dots
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeMongoQuery(value);
    } else if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
