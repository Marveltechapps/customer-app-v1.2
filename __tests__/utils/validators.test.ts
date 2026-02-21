/**
 * Validators Utility Tests
 */

import { isValidEmail, isValidPhoneNumber, isValidOTP, isValidPassword } from '../../src/utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('validates 10-digit Indian phone numbers', () => {
      expect(isValidPhoneNumber('9876543210')).toBe(true);
      expect(isValidPhoneNumber('+91 98765 43210')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhoneNumber('12345')).toBe(false);
      expect(isValidPhoneNumber('98765432101')).toBe(false);
    });
  });

  describe('isValidOTP', () => {
    it('validates 6-digit OTP', () => {
      expect(isValidOTP('123456')).toBe(true);
      expect(isValidOTP('000000')).toBe(true);
    });

    it('rejects invalid OTP', () => {
      expect(isValidOTP('12345')).toBe(false);
      expect(isValidOTP('1234567')).toBe(false);
      expect(isValidOTP('abcdef')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates strong passwords', () => {
      const result = isValidPassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('rejects weak passwords', () => {
      const result = isValidPassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

