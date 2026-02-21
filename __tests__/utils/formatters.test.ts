/**
 * Formatters Utility Tests
 */

import { formatCurrency, formatPhoneNumber, formatDiscount } from '../../src/utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(1000, 'INR')).toContain('₹');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 10-digit phone number', () => {
      expect(formatPhoneNumber('9876543210')).toContain('+91');
    });

    it('handles already formatted numbers', () => {
      const formatted = formatPhoneNumber('+91 98765 43210');
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatDiscount', () => {
    it('calculates discount percentage correctly', () => {
      expect(formatDiscount(100, 80)).toBe('20% OFF');
      expect(formatDiscount(100, 100)).toBe('0%');
    });
  });
});

