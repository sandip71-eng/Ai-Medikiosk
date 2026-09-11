/**
 * Independent Medical Red-Flag & Emergency Detection Service
 * Operates deterministically and independently from LLM output.
 */

// Category-specific red flag patterns (English + Hindi/Hinglish)
const EMERGENCY_CATEGORIES = [
  {
    category: 'CARDIAC',
    label: 'Chest Pain / Acute Coronary Syndrome',
    patterns: [
      /\b(chest\s+pain|crushing\s+chest|pressure\s+in\s+chest|heart\s+attack|pain\s+radiating\s+to\s+(left\s+arm|jaw|neck|back))\b/i,
      /\b(seene\s+me(in)?\s+dard|chaati\s+me(in)?\s+dard|dil\s+ka\s+daura)\b/i,
    ],
  },
  {
    category: 'RESPIRATORY',
    label: 'Severe Respiratory Distress',
    patterns: [
      /\b(cannot\s+breathe|severe\s+shortness\s+of\s+breath|gasping\s+for\s+air|suffocating|turning\s+blue|stridor|severe\s+breathlessness)\b/i,
      /\b(saans\s+nahi\s+aa\s+rahi|saans\s+lene\s+me(in)?\s+(bahut\s+)?dikkat|dum\s+ghut\s+raha)\b/i,
    ],
  },
  {
    category: 'NEUROLOGICAL',
    label: 'Suspected Stroke / Loss of Consciousness / Seizure',
    patterns: [
      /\b(sudden\s+weakness|facial\s+droop|slurred\s+speech|cannot\s+speak|loss\s+of\s+consciousness|passed\s+out|blacked\s+out|fainted|seizure|convulsions|worst\s+headache\s+of\s+(my\s+)?life|thunderclap\s+headache)\b/i,
      /\b(behosh|chakkar\s+aake\s+gir\s+gaya|bol\s+nahi\s+pa\s+raha|ek\s+taraf\s+kamzori|daura)\b/i,
    ],
  },
  {
    category: 'HEMORRHAGIC',
    label: 'Severe Uncontrolled Bleeding / Massive Hemoptysis / Hematemesis',
    patterns: [
      /\b(uncontrolled\s+bleeding|gushing\s+blood|coughing\s+up\s+large\s+blood|vomiting\s+blood|spurting\s+blood)\b/i,
      /\b(bahut\s+zyada\s+khoon|khoon\s+ki\s+ulti|khoon\s+ruk\s+nahi\s+raha)\b/i,
    ],
  },
  {
    category: 'ANAPHYLAXIS',
    label: 'Severe Allergic Reaction / Anaphylaxis',
    patterns: [
      /\b(throat\s+closing|swelling\s+of\s+(tongue|lips|throat)|anaphylaxis|cannot\s+swallow|allergic\s+reaction\s+with\s+difficulty\s+breathing)\b/i,
      /\b(gala\s+band\s+ho\s+raha|jeebh\s+sooj\s+gayi)\b/i,
    ],
  },
  {
    category: 'PSYCHIATRIC_CRISIS',
    label: 'Active Suicidal Ideation / Intent',
    patterns: [
      /\b(want\s+to\s+die|kill\s+myself|suicide|suicidal|end\s+my\s+life|self[\s-]harm)\b/i,
      /\b(marne\s+ka\s+mann|aatmhatya|jaan\s+dena)\b/i,
    ],
  },
  {
    category: 'SEVERE_ALTERED_MENTAL',
    label: 'Severe Acute Confusion / Unresponsiveness',
    patterns: [
      /\b(unresponsive|completely\s+confused|does\s+not\s+recognize\s+anyone|hallucinating\s+violently)\b/i,
      /\b(kuch\s+samajh\s+nahi\s+aa\s+raha\s+aur\s+behosh)\b/i,
    ],
  },
];

/**
 * Detect red flags and emergency symptoms in text
 * @param {string} text - The patient message or transcript
 * @returns {object} { isEmergency: boolean, redFlags: string[], message: string|null, category: string|null }
 */
export const detectEmergency = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      isEmergency: false,
      redFlags: [],
      message: null,
      category: null,
    };
  }

  const detectedFlags = [];
  let detectedCategory = null;

  for (const item of EMERGENCY_CATEGORIES) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        detectedFlags.push(item.label);
        if (!detectedCategory) {
          detectedCategory = item.category;
        }
        break;
      }
    }
  }

  if (detectedFlags.length > 0) {
    return {
      isEmergency: true,
      redFlags: detectedFlags,
      category: detectedCategory,
      urgency: 'emergency',
      message: getEmergencyGuidance(detectedCategory, detectedFlags),
    };
  }

  return {
    isEmergency: false,
    redFlags: [],
    category: null,
    urgency: null,
    message: null,
  };
};

/**
 * Returns unambiguous, medically responsible emergency guidance.
 * Does NOT reassure or provide home treatment for red-flag symptoms.
 */
export const getEmergencyGuidance = (category, flags = []) => {
  const flagsList = flags.join(', ');

  if (category === 'PSYCHIATRIC_CRISIS') {
    return `EMERGENCY ALERT: Immediate help is available. Please reach out right now:
- National Mental Health Helpline (Kiran - India): 1800-599-0019
- Tele-MANAS: 14416 or 1800-891-4416
- Emergency Services: 112
Please notify the kiosk assistant, a family member, or go to the nearest emergency room immediately. You are not alone, and help is available right now.`;
  }

  return `CRITICAL MEDICAL ALERT: Based on the reported symptoms (${flagsList}), this may indicate a life-threatening medical emergency.

IMMEDIATE ACTION REQUIRED:
1. Please alert the kiosk coordinator or medical personnel in this facility immediately.
2. Dial Emergency Medical Services immediately:
   - India: Dial 108 or 112 (Ambulance / Emergency)
   - US: Dial 911
3. Proceed directly to the nearest hospital Emergency Department.

Do not wait for this digital intake to finish. Seek professional emergency care immediately.`;
};

export default {
  detectEmergency,
  getEmergencyGuidance,
};
