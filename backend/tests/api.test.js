import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('API Routes Integration', () => {
  it('GET / should return a 200 service banner for the backend root', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('MediKiosk');
  });

  it('GET /api/health should return 200 and healthy status without exposing secrets', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).not.toHaveProperty('apiKey');
    expect(res.body).not.toHaveProperty('MONGODB_URI');
  });

  it('GET /api/admin/consultations should block unauthorized requests (401)', async () => {
    const res = await request(app).get('/api/admin/consultations');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/login should reject empty body with validation error (400)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/consultations should handle ephemeral mode when dataConsent is false', async () => {
    const res = await request(app)
      .post('/api/consultations')
      .send({
        language: 'en-IN',
        consent: {
          dataConsent: false,
          audioConsent: true,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('consultationId');
    expect(res.body.data.ephemeral).toBe(true);
  });

  it('Unknown routes should return 404 ROUTE_NOT_FOUND', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
