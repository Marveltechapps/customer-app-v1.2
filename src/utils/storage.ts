/**
 * Storage Utility
 * TEMPORARY: Using AsyncStorage with fallback for Expo Go compatibility
 * NOTE: This is a temporary workaround. SecureStore is more secure for production.
 * TODO: Switch back to expo-secure-store for production builds
 * 
 * In Expo Go, AsyncStorage native module is not available, so we use in-memory fallback
 */

import { logger } from '@/utils/logger';
import { NativeFeatures } from '@/utils/nativeFeatures';

// In-memory storage fallback for Expo Go
const memoryStorage: { [key: string]: string } = {};

// Try to load AsyncStorage - it may not be available in Expo Go
let AsyncStorage: any = null;
let asyncStorageAvailable = false;

// Use feature detection to prefer AsyncStorage when available
if (NativeFeatures.asyncStorage.preferred) {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    asyncStorageAvailable = true;
  } catch (error) {
    logger.warn('AsyncStorage preferred but not available', error);
    asyncStorageAvailable = false;
  }
} else {
  // Expected in Expo Go - use info level instead of warn
  if (NativeFeatures.environment.isExpoGo) {
    logger.info('Using in-memory storage fallback (Expo Go)');
  }
  asyncStorageAvailable = false;
}

// Fallback storage functions for Expo Go
const getItemFallback = async (key: string): Promise<string | null> => {
  return memoryStorage[key] || null;
};

const setItemFallback = async (key: string, value: string): Promise<void> => {
  memoryStorage[key] = value;
};

const removeItemFallback = async (key: string): Promise<void> => {
  delete memoryStorage[key];
};

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_COMPLETED_AT_KEY = 'onboarding_completed_at';

/**
 * Get access token from storage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return await getItemFallback(ACCESS_TOKEN_KEY);
  } catch (error) {
    logger.error('Error getting token', error);
    return await getItemFallback(ACCESS_TOKEN_KEY);
  }
};

/**
 * Save access token to storage
 */
export const saveToken = async (token: string): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      return true;
    }
    await setItemFallback(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    logger.error('Error saving token', error);
    try {
      await setItemFallback(ACCESS_TOKEN_KEY, token);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Get refresh token from storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await getItemFallback(REFRESH_TOKEN_KEY);
  } catch (error) {
    logger.error('Error getting refresh token', error);
    return await getItemFallback(REFRESH_TOKEN_KEY);
  }
};

/**
 * Save refresh token to storage
 */
export const saveRefreshToken = async (token: string): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      return true;
    }
    await setItemFallback(REFRESH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    logger.error('Error saving refresh token', error);
    try {
      await setItemFallback(REFRESH_TOKEN_KEY, token);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Clear all tokens from storage
 */
export const clearToken = async (): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      return true;
    }
    await removeItemFallback(ACCESS_TOKEN_KEY);
    await removeItemFallback(REFRESH_TOKEN_KEY);
    return true;
  } catch (error) {
    logger.error('Error clearing tokens', error);
    try {
      await removeItemFallback(ACCESS_TOKEN_KEY);
      await removeItemFallback(REFRESH_TOKEN_KEY);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Save user data to storage
 */
export const saveUserData = async (userData: string): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await AsyncStorage.setItem(USER_DATA_KEY, userData);
      return true;
    }
    await setItemFallback(USER_DATA_KEY, userData);
    return true;
  } catch (error) {
    logger.error('Error saving user data', error);
    try {
      await setItemFallback(USER_DATA_KEY, userData);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Get user data from storage
 */
export const getUserData = async (): Promise<string | null> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      return await AsyncStorage.getItem(USER_DATA_KEY);
    }
    return await getItemFallback(USER_DATA_KEY);
  } catch (error) {
    logger.error('Error getting user data', error);
    return await getItemFallback(USER_DATA_KEY);
  }
};

/**
 * Save onboarding completion status
 */
export const saveOnboardingCompleted = async (): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_AT_KEY, new Date().toISOString());
      return true;
    }
    await setItemFallback(ONBOARDING_COMPLETED_KEY, 'true');
    await setItemFallback(ONBOARDING_COMPLETED_AT_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    logger.error('Error saving onboarding completion', error);
    try {
      await setItemFallback(ONBOARDING_COMPLETED_KEY, 'true');
      await setItemFallback(ONBOARDING_COMPLETED_AT_KEY, new Date().toISOString());
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Get onboarding completion status
 */
export const getOnboardingCompleted = async (): Promise<boolean> => {
  try {
    let completed: string | null = null;
    if (asyncStorageAvailable && AsyncStorage) {
      completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    } else {
      completed = await getItemFallback(ONBOARDING_COMPLETED_KEY);
    }
    return completed === 'true';
  } catch (error) {
    logger.error('Error getting onboarding completion', error);
    const completed = await getItemFallback(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  }
};

/**
 * Get onboarding completion timestamp
 */
export const getOnboardingCompletedAt = async (): Promise<string | null> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      return await AsyncStorage.getItem(ONBOARDING_COMPLETED_AT_KEY);
    }
    return await getItemFallback(ONBOARDING_COMPLETED_AT_KEY);
  } catch (error) {
    logger.error('Error getting onboarding completion timestamp', error);
    return await getItemFallback(ONBOARDING_COMPLETED_AT_KEY);
  }
};

/**
 * Clear all stored data
 */
export const clearAll = async (): Promise<boolean> => {
  try {
    if (asyncStorageAvailable && AsyncStorage) {
      await clearToken();
      await AsyncStorage.removeItem(USER_DATA_KEY);
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_AT_KEY);
      return true;
    }
    await clearToken();
    await removeItemFallback(USER_DATA_KEY);
    await removeItemFallback(ONBOARDING_COMPLETED_KEY);
    await removeItemFallback(ONBOARDING_COMPLETED_AT_KEY);
    return true;
  } catch (error) {
    logger.error('Error clearing all data', error);
    try {
      await clearToken();
      await removeItemFallback(USER_DATA_KEY);
      await removeItemFallback(ONBOARDING_COMPLETED_KEY);
      await removeItemFallback(ONBOARDING_COMPLETED_AT_KEY);
      return true;
    } catch {
      return false;
    }
  }
};
