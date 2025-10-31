import { AxiosError } from "axios";
import { ApiError } from "@/types";
import { ERROR_MESSAGES } from "@/constants";

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return ERROR_MESSAGES.GENERIC;

  // Axios error
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message;
    
    // Handle specific status codes
    if (error.response?.status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.response?.status === 404) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (error.response?.status === 400) {
      return message || ERROR_MESSAGES.VALIDATION;
    }
    
    return message || ERROR_MESSAGES.GENERIC;
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // ApiError
  if (isApiError(error)) {
    return error.message;
  }

  return ERROR_MESSAGES.GENERIC;
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}

/**
 * Create a standardized ApiError
 */
export function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    message,
    status,
    code,
    details,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.code === "ERR_NETWORK";
  }
  return false;
}

/**
 * Handle API errors with logging
 */
export function handleApiError(error: unknown, context?: string): never {
  const message = getErrorMessage(error);
  
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context || "API Error"}]:`, error);
  }
  
  throw new Error(message);
}
