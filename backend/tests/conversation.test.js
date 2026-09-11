import { describe, it, expect } from 'vitest';
import {
  checkIsPainComplaint,
  calculateMissingFields,
  determineNextStage,
} from '../src/services/conversationService.js';
import { verifyNegativeROS } from '../src/services/reportService.js';

describe('Clinical Conversation Engine & State Machine', () => {
  it('should identify pain complaints accurately', () => {
    expect(checkIsPainComplaint('I have sharp stomach pain')).toBe(true);
    expect(checkIsPainComplaint('My back hurts when I stand up')).toBe(true);
    expect(checkIsPainComplaint('Pet me tez dard ho raha hai')).toBe(true);
    expect(checkIsPainComplaint('I have high fever and shivering')).toBe(false);
  });

  it('should compute remaining missing clinical fields', () => {
    const completed = ['chiefComplaint', 'onset', 'duration'];
    const missing = calculateMissingFields(completed, false);
    expect(missing).not.toContain('chiefComplaint');
    expect(missing).not.toContain('onset');
    expect(missing).toContain('medicalHistory');
    expect(missing).toContain('currentMedications');
  });

  it('should progress stages in logical clinical order', () => {
    // 1. Initial stage with no chief complaint
    expect(determineNextStage('CHIEF_COMPLAINT', { completedFields: [] })).toBe('CHIEF_COMPLAINT');

    // 2. Chief complaint captured -> transition to HPI_SOCRATES
    expect(
      determineNextStage('CHIEF_COMPLAINT', {
        completedFields: ['chiefComplaint'],
        isPainComplaint: true,
      })
    ).toBe('HPI_SOCRATES');

    // 3. HPI captured -> transition to PAST_MEDICAL_HISTORY
    expect(
      determineNextStage('HPI_SOCRATES', {
        completedFields: ['chiefComplaint', 'painSite', 'painOnset', 'painSeverity'],
        isPainComplaint: true,
      })
    ).toBe('PAST_MEDICAL_HISTORY');

    // 4. Past medical history captured -> transition to MEDICATIONS_ALLERGIES
    expect(
      determineNextStage('PAST_MEDICAL_HISTORY', {
        completedFields: ['chiefComplaint', 'painSite', 'medicalHistory'],
      })
    ).toBe('MEDICATIONS_ALLERGIES');
  });

  it('should strictly verify negative ROS symptoms against transcript', () => {
    const messages = [
      { role: 'assistant', content: 'Do you have any fever or chills?' },
      { role: 'patient', content: 'No fever at all.' },
      { role: 'assistant', content: 'Any shortness of breath or cough?' },
      { role: 'patient', content: 'No, my breathing is completely fine.' },
    ];

    const modelReportedNegatives = [
      'fever',
      'shortness of breath',
      'vision changes', // Patient was NEVER asked about vision changes!
      'seizures', // Patient was NEVER asked about seizures!
    ];

    const verified = verifyNegativeROS(modelReportedNegatives, messages);

    expect(verified).toContain('fever');
    expect(verified).toContain('shortness of breath');
    // Non-asked symptoms must be dropped to prevent false documentation
    expect(verified).not.toContain('vision changes');
    expect(verified).not.toContain('seizures');
  });
});
