import { api } from '../api/client';
import { endpoints } from '../api/endpoints';
import { tokenManager } from '../api/tokenManager';

export interface SendOtpResponse {
  sessionId: string;
  resendCooldownSeconds?: number;
}

export const sendOtp = async (phoneNumber: string) => {
  const resp = await api.post<SendOtpResponse>(endpoints.auth.sendOtp, { phoneNumber });
  // Debug: log raw response to help diagnose mobile issues (can be removed after debugging)
  try {
    // Use console to ensure logs are visible in Metro/Xcode
    // eslint-disable-next-line no-console
    console.debug('[authService] sendOtp response:', resp);
  } catch (e) {
    // ignore
  }
  return resp;
};

export const verifyOtp = async (sessionId: string, otp: string) => {
  const resp = await api.post(endpoints.auth.verifyOtp, { sessionId, otp });
  // resp.data -> { accessToken, user }
  if (resp && resp.data && resp.data.accessToken) {
    await tokenManager.setTokens(resp.data.accessToken, resp.data.refreshToken);
  }
  return resp;
};

export const resendOtp = async (sessionId: string) => {
  const resp = await api.post(endpoints.auth.resendOtp, { sessionId });
  return resp;
};

export default { sendOtp, verifyOtp, resendOtp };

