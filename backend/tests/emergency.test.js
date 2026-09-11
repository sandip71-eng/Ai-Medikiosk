import { describe, it, expect } from 'vitest';
import { detectEmergency, getEmergencyGuidance } from '../src/services/emergencyService.js';

describe('Emergency Detection Service', () => {
  it('should detect cardiac emergencies (chest pain)', () => {
    const result = detectEmergency('I have crushing chest pain and it radiates to my left arm.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('CARDIAC');
    expect(result.message).toContain('CRITICAL MEDICAL ALERT');
  });

  it('should detect cardiac emergencies in Hindi/Hinglish', () => {
    const result = detectEmergency('Mujhe seene mein dard ho raha hai bahut tez.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('CARDIAC');
  });

  it('should detect severe respiratory distress', () => {
    const result = detectEmergency('I cannot breathe properly, I am gasping for air.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('RESPIRATORY');
  });

  it('should detect neurological stroke symptoms', () => {
    const result = detectEmergency('My mother had sudden weakness on her left side and slurred speech.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('NEUROLOGICAL');
  });

  it('should detect psychiatric crisis and return specialized helpline', () => {
    const result = detectEmergency('I feel so hopeless that I want to kill myself.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('PSYCHIATRIC_CRISIS');
    expect(result.message).toContain('Kiran');
    expect(result.message).toContain('14416');
  });

  it('should detect severe uncontrolled bleeding', () => {
    const result = detectEmergency('There is uncontrolled bleeding from a deep wound.');
    expect(result.isEmergency).toBe(true);
    expect(result.urgency).toBe('emergency');
    expect(result.category).toBe('HEMORRHAGIC');
  });

  it('should NOT flag routine/non-emergency symptoms', () => {
    const mildCases = [
      'I have had a mild runny nose and cough for 2 days.',
      'My knee feels a bit stiff after running yesterday.',
      'I need a routine health checkup for my diabetes.',
      'Slight sore throat and mild headache since morning.',
    ];

    for (const text of mildCases) {
      const result = detectEmergency(text);
      expect(result.isEmergency).toBe(false);
      expect(result.urgency).toBeNull();
      expect(result.redFlags).toHaveLength(0);
    }
  });

  it('should handle empty or null input gracefully', () => {
    expect(detectEmergency(null).isEmergency).toBe(false);
    expect(detectEmergency('').isEmergency).toBe(false);
    expect(detectEmergency(undefined).isEmergency).toBe(false);
  });
});
