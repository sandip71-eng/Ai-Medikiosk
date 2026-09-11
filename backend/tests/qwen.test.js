import { describe, it, expect, vi } from 'vitest';
import { getMedicalSystemPrompt } from '../src/prompts/medicalSystemPrompt.js';
import { getReportPrompt } from '../src/prompts/reportPrompt.js';

describe('Qwen LLM Prompt Generation & Guardrails', () => {
  it('should generate system prompt enforcing medical safety and no definitive diagnosis', () => {
    const prompt = getMedicalSystemPrompt({
      language: 'en-IN',
      conversationStage: 'CHIEF_COMPLAINT',
      completedFields: [],
      missingFields: ['chiefComplaint', 'onset', 'duration'],
      redFlags: [],
      isPainComplaint: false,
      dashavidhaMode: false,
    });

    expect(prompt).toContain('AI ASSISTANT, NOT a licensed physician');
    expect(prompt).toContain('NEVER provide a definitive diagnosis');
    expect(prompt).toContain('NEVER prescribe medications');
    expect(prompt).toContain('Ask only 1 or 2 concise, focused questions at a time');
  });

  it('should include SOCRATES guidelines when pain complaint is indicated', () => {
    const prompt = getMedicalSystemPrompt({
      language: 'en-IN',
      conversationStage: 'HPI_SOCRATES',
      completedFields: ['chiefComplaint'],
      missingFields: ['painSite', 'painOnset', 'painSeverity'],
      isPainComplaint: true,
    });

    expect(prompt).toContain('SOCRATES framework');
  });

  it('should include Dashavidha Pariksha when traditional mode is explicitly enabled', () => {
    const promptWithDasha = getMedicalSystemPrompt({
      language: 'en-IN',
      dashavidhaMode: true,
    });
    expect(promptWithDasha).toContain('DASHAVIDHA MODE ENABLED');

    const promptWithoutDasha = getMedicalSystemPrompt({
      language: 'en-IN',
      dashavidhaMode: false,
    });
    expect(promptWithoutDasha).not.toContain('DASHAVIDHA MODE ENABLED');
  });

  it('should generate report prompt with strict ROS negative rule', () => {
    const reportPrompt = getReportPrompt({
      messages: [{ role: 'patient', content: 'I have severe headache' }],
      clinicalState: { chiefComplaint: 'Headache' },
      dashavidhaMode: false,
    });

    expect(reportPrompt).toContain('ONLY include a symptom here if the assistant explicitly asked about it AND the patient explicitly denied having it');
    expect(reportPrompt).toContain('NEVER INVENT OR ASSUME NEGATIVE SYMPTOMS');
    expect(reportPrompt).toContain('disclaimer');
  });
});
