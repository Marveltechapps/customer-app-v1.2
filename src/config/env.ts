/**
 * Environment Configuration (same method as HHD and Picker apps)
 * Priority: expo extra (from app.config.js) → env-based default. API client uses apiBaseUrl.
 *
 * Note: This file does not use the logger utility to avoid circular dependencies.
 * Logger depends on env.ts, so env.ts uses console directly for error reporting.
 */

import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

/** Backend server port (must match selorg-dashboard-backend-v1.1 PORT, default 5000). Do not use 3000 — that is the dashboard/frontend dev server. */
export const DEFAULT_BACKEND_PORT = 5000;

const CUSTOMER_API_PATH = '/api/v1/customer';
/** Default API base URL for development. Use this so frontend and backend stay in sync. */
export const DEFAULT_DEV_API_BASE_URL = `http://localhost:${DEFAULT_BACKEND_PORT}${CUSTOMER_API_PATH}`;

interface EnvConfig {
  env: Environment;
  apiBaseUrl: string;
  apiVersion: string;
  enableLogging: boolean;
  enableAnalytics: boolean;
}

// Default configuration values (production uses api.selorg.com when ENV=production in .env)
const DEFAULT_CONFIG: EnvConfig = {
  env: 'development' as Environment,
  apiBaseUrl: 'https://api.selorg.com/api/v1/customer',
  apiVersion: '/api/v1',
  enableLogging: true,
  enableAnalytics: true,
};

/**
 * Safely get a config value from expo-constants with fallback
 */
const getConfigValue = (key: string, defaultValue: string): string => {
  try {
    const extra = Constants.expoConfig?.extra;
    if (extra && typeof extra === 'object' && key in extra) {
      const value = extra[key];
      return value !== null && value !== undefined ? String(value) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    // Use console directly to avoid circular dependency with logger
    // Only log in development to avoid noise in production
    // @ts-ignore - __DEV__ is a global defined by React Native/Metro bundler
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`[env] Error accessing config key ${key}:`, error);
    }
    return defaultValue;
  }
};

/**
 * In development, if apiBaseUrl points at localhost:3000 (frontend dev server), replace with backend URL so the app connects to the API.
 */
function normalizeApiBaseUrl(apiBaseUrl: string, env: Environment): string {
  if (env !== 'development') return apiBaseUrl;
  try {
    const u = apiBaseUrl.trim().toLowerCase();
    // Port 3000 is typically the dashboard/Vite dev server, not the backend (5000).
    if (u.includes('localhost:3000') || u.includes('127.0.0.1:3000')) {
      return DEFAULT_DEV_API_BASE_URL;
    }
  } catch {
    // ignore
  }
  return apiBaseUrl;
}

/**
 * Get environment configuration
 */
export const getEnvConfig = (): EnvConfig => {
  try {
    const env = (getConfigValue('env', 'development') || 'development') as Environment;
    const defaultApiBaseUrl =
      env === 'development' ? DEFAULT_DEV_API_BASE_URL : DEFAULT_CONFIG.apiBaseUrl;

    let apiBaseUrl = getConfigValue('apiBaseUrl', defaultApiBaseUrl);
    apiBaseUrl = normalizeApiBaseUrl(apiBaseUrl, env);

    return {
      env,
      apiBaseUrl,
      apiVersion: getConfigValue('apiVersion', DEFAULT_CONFIG.apiVersion),
      enableLogging: getConfigValue('enableLogging', 'true') === 'true',
      enableAnalytics: getConfigValue('enableAnalytics', 'true') === 'true',
    };
  } catch (error) {
    // Use console directly to avoid circular dependency with logger
    // Only log in development to avoid noise in production
    // @ts-ignore - __DEV__ is a global defined by React Native/Metro bundler
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('[env] Error getting environment config, using defaults:', error);
    }
    return DEFAULT_CONFIG;
  }
};

/**
 * Current environment configuration (lazy-loaded)
 */
let cachedEnvConfig: EnvConfig | null = null;

export const getEnvConfigSafe = (): EnvConfig => {
  if (!cachedEnvConfig) {
    cachedEnvConfig = getEnvConfig();
  }
  return cachedEnvConfig;
};

/**
 * Current environment configuration
 * @deprecated Use getEnvConfigSafe() for safer access
 */
export const envConfig: EnvConfig = getEnvConfigSafe();

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  try {
    return getEnvConfigSafe().env === 'development';
  } catch {
    return true; // Default to development if config fails
  }
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  try {
    return getEnvConfigSafe().env === 'production';
  } catch {
    return false;
  }
};

/**
 * Check if running in staging
 */
export const isStaging = (): boolean => {
  try {
    return getEnvConfigSafe().env === 'staging';
  } catch {
    return false;
  }
};

