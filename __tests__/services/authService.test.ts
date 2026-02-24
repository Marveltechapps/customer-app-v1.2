/**
 * Auth Service Tests
 */

import { sendOtp, verifyOtp } from '../../src/services/auth/authService';
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

      const result = await sendOtp('9876543210');

      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/send-otp'),
        { phoneNumber: '9876543210' }
      );
      expect(result.data?.sessionId).toBe('test-session-id');
    });
  });

  describe('verifyOTP', () => {
    it('verifies OTP successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: '1',
            name: 'Test User',
            phoneNumber: '9876543210',
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await verifyOtp('test-session-id', '123456');

      expect(api.post).toHaveBeenCalled();
      expect(result.data?.accessToken).toBe('test-token');
    });
  });
});

