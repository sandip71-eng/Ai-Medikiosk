import { describe, it, expect, vi } from 'vitest';
import {
  detectLanguage,
  SUPPORTED_LANGUAGES,
  speechToText,
  textToSpeech,
} from '../src/services/sarvamService.js';

describe('Sarvam AI Integration Service', () => {
  it('should detect Indian language scripts accurately', () => {
    // Hindi (Devanagari)
    expect(detectLanguage('मुझे दो दिन से बुखार है')).toBe('hi-IN');
    // Bengali
    expect(detectLanguage('আমার পেটে খুব ব্যথা')).toBe('bn-IN');
    // Telugu
    expect(detectLanguage('నాకు జ్వరం వచ్చింది')).toBe('te-IN');
    // Tamil
    expect(detectLanguage('எனக்கு தலைவலி இருக்கிறது')).toBe('ta-IN');
    // English
    expect(detectLanguage('I have a severe headache')).toBe('en-IN');
  });

  it('should include all required Indian language codes', () => {
    const required = ['en-IN', 'hi-IN', 'bn-IN', 'te-IN', 'ta-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'gu-IN'];
    for (const code of required) {
      expect(SUPPORTED_LANGUAGES).toContain(code);
    }
  });

  it('should format speechToText parameters properly', async () => {
    // Mock global fetch
    const mockResponse = {
      transcript: 'I have severe cough for three days',
      language_code: 'en-IN',
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const buffer = Buffer.from('fake audio data');
    const result = await speechToText(buffer, 'test.wav', 'en-IN');

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.transcript).toBe('I have severe cough for three days');
    expect(result.languageCode).toBe('en-IN');

    fetchSpy.mockRestore();
  });

  it('should format textToSpeech parameters and return playable audio', async () => {
    const fakeBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audios: [fakeBase64],
      }),
    });

    const result = await textToSpeech('Take rest and drink warm water', 'en-IN');

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.audio).toBe(fakeBase64);
    expect(result.audioUrl).toBe(`data:audio/wav;base64,${fakeBase64}`);
    expect(result.format).toBe('audio/wav');

    fetchSpy.mockRestore();
  });
});
