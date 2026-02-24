/**
 * API Types
 * Common types for API requests and responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Get a user-facing message from any API error (normalized ApiError or axios error).
 * Use this in catch blocks so 404/400 show the server message consistently.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err == null) return fallback;
  const o = err as Record<string, unknown>;
  if (typeof o?.message === 'string' && o.message) return o.message;
  const data = (o?.response as any)?.data as Record<string, unknown> | undefined;
  if (data && typeof data?.message === 'string' && data.message) return data.message;
  if (typeof o?.error === 'string' && o.error) return o.error;
  return fallback;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  skipAuth?: boolean;
}

