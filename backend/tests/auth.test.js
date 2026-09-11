import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

describe('Authentication & User Model Security', () => {
  it('should hash passwords securely with bcrypt and verify correctly', async () => {
    const rawPassword = 'ClinicalDoctorSecret2026!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    expect(hashedPassword).not.toBe(rawPassword);
    expect(await bcrypt.compare(rawPassword, hashedPassword)).toBe(true);
    expect(await bcrypt.compare('WrongPassword', hashedPassword)).toBe(false);
  });

  it('should omit sensitive fields in toSafeObject', () => {
    const mockUser = new User({
      name: 'Dr. Anita Sharma',
      email: 'anita@medikiosk.com',
      password: 'SamplePassword123!',
      role: 'doctor',
    });

    const safeObj = mockUser.toSafeObject();
    expect(safeObj).toHaveProperty('name', 'Dr. Anita Sharma');
    expect(safeObj).toHaveProperty('email', 'anita@medikiosk.com');
    expect(safeObj).toHaveProperty('role', 'doctor');
    expect(safeObj).not.toHaveProperty('password');
  });
});
