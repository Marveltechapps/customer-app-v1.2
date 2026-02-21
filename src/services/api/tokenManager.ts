/**
 * Token Manager
 * Manages auth tokens in memory for synchronous access
 */

import * as storage from '../../utils/storage';
import { logger } from '@/utils/logger';

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private initialized: boolean = false;

  /**
   * Initialize token manager - load tokens from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.accessToken = await storage.getToken();
      this.refreshToken = await storage.getRefreshToken();
      this.initialized = true;
    } catch (error) {
      logger.error('Error initializing token manager', error);
    }
  }

  /**
   * Get access token (synchronous)
   */
  getToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token (synchronous)
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Set tokens
   */
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    // Persist to storage
    await storage.saveToken(accessToken);
    if (refreshToken) {
      await storage.saveRefreshToken(refreshToken);
    }
  }

  /**
   * Clear tokens
   */
  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    await storage.clearToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export const tokenManager = new TokenManager();

