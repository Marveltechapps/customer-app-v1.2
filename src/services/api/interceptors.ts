/**
 * API Interceptors
 * Request and response interceptors for axios
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiError } from './types';
import { tokenManager } from './tokenManager';
import { getEnvConfigSafe } from '../../config/env';

/**
 * Request interceptor - Set base URL from current config, add auth token
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Use current apiBaseUrl so we always hit the right backend (e.g. after env load)
  try {
    config.baseURL = getEnvConfigSafe().apiBaseUrl;
  } catch {
    // keep existing baseURL if config fails
  }

  // Skip auth for certain endpoints
  if (config.skipAuth) {
    return config;
  }

  // Add auth token if available (synchronous access via token manager)
  const token = tokenManager.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add common headers
  if (config.headers) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  // Debug: log outgoing request in development to help diagnose incorrect baseURL or proxying
  try {
    // @ts-ignore __DEV__ may be global in RN/Expo
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.debug('[api][request]', {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        fullUrl: `${config.baseURL || ''}${config.url || ''}`,
        data: config.data,
        headers: config.headers,
      });
    }
  } catch (e) {
    // ignore logging errors
  }

  return config;
};

/**
 * Response interceptor - Handle responses and errors
 */
export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => {
    try {
      // @ts-ignore __DEV__
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // eslint-disable-next-line no-console
        console.debug('[api][response]', {
          status: response.status,
          url: response.config && `${response.config.baseURL || ''}${response.config.url || ''}`,
          data: response.data,
          headers: response.headers,
        });
      }
    } catch (e) {
      // ignore
    }
    // Return the full axios response to let higher-level wrappers handle .data consistently
    return response;
  },
  onRejected: (error: AxiosError<ApiError>) => {
    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          tokenManager.clearTokens();
          // You can add navigation logic here if needed
          break;
        case 403:
          // #region agent log
          try {
            const fullUrl = error.config?.baseURL && error.config?.url ? `${error.config.baseURL}${error.config.url}` : error.config?.url || '';
            fetch('http://127.0.0.1:7246/ingest/5893c50f-2689-43ab-aef7-52afb23dce6d', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'interceptors.ts:403', message: 'API 403 response', data: { status: 403, baseURL: error.config?.baseURL, url: error.config?.url, fullUrl, hypothesisId: 'D' }, timestamp: Date.now() }) }).catch(() => {});
          } catch (_) {}
          // #endregion
          // Forbidden
          break;
        case 404:
          // Not found
          break;
        case 500:
          // Server error
          break;
        default:
          break;
      }

      // Return formatted error
      const apiError: ApiError = {
        message: data?.message || error.message || 'An error occurred',
        code: data?.code,
        status,
        errors: data?.errors,
      };

      return Promise.reject(apiError);
    }

    // Network error or other issues
    const apiError: ApiError = {
      message: error.message || 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };

    return Promise.reject(apiError);
  },
};

