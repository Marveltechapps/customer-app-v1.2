/**
 * Auth Service Tests
 */

import { sendOTP, verifyOTP } from '../../src/services/auth/authService';
import { api } from '../../src/services/api/client';

// Mock the API client
jest.mock('../../src/services/api/client');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    it('sends OTP successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'OTP sent successfully',
          sessionId: 'test-session-id',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendOTP({ phoneNumber: '9876543210' });

      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { phoneNumber: '9876543210' },
        { skipAuth: true }
      );
      expect(result.data?.success).toBe(true);
    });
  });

  describe('verifyOTP', () => {
    it('verifies OTP successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          token: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '1',
            name: 'Test User',
            phoneNumber: '9876543210',
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await verifyOTP({
        phoneNumber: '9876543210',
        otp: '123456',
      });

      expect(api.post).toHaveBeenCalled();
      expect(result.data?.token).toBe('test-token');
    });
  });
});

