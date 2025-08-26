import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const createAppError = (
  code: ErrorCode,
  message: string,
  details?: string,
  retryable: boolean = false
): AppError => ({
  code,
  message,
  details,
  retryable,
});

export const parseApiError = (error: any): AppError => {
  // Network errors
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return createAppError(
      ErrorCodes.NETWORK_ERROR,
      'Unable to connect to the server. Please check your internet connection.',
      error.message,
      true
    );
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
    return createAppError(
      ErrorCodes.TIMEOUT_ERROR,
      'The request took too long to complete. Please try again.',
      error.message,
      true
    );
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return createAppError(
          ErrorCodes.VALIDATION_ERROR,
          'The information you provided is invalid. Please check your input and try again.',
          error.response.data?.message || error.message
        );
      
      case 401:
      case 403:
        return createAppError(
          ErrorCodes.AUTHORIZATION_ERROR,
          'You are not authorized to perform this action. Please check your permissions.',
          error.response.data?.message || error.message
        );
      
      case 404:
        return createAppError(
          ErrorCodes.NOT_FOUND,
          'The requested resource could not be found.',
          error.response.data?.message || error.message
        );
      
      case 429:
        return createAppError(
          ErrorCodes.SERVER_ERROR,
          'Too many requests. Please wait a moment and try again.',
          error.response.data?.message || error.message,
          true
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return createAppError(
          ErrorCodes.SERVER_ERROR,
          'A server error occurred. Our team has been notified and is working to fix this.',
          error.response.data?.message || error.message,
          true
        );
      
      default:
        return createAppError(
          ErrorCodes.SERVER_ERROR,
          `An unexpected error occurred (${status}). Please try again.`,
          error.response.data?.message || error.message,
          status >= 500
        );
    }
  }

  // Generic errors
  return createAppError(
    ErrorCodes.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
    error.message,
    true
  );
};

export const showErrorToast = (error: AppError) => {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
};

export const handleApiError = (error: any): AppError => {
  const appError = parseApiError(error);
  showErrorToast(appError);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to error reporting service (Sentry, LogRocket, etc.)
    console.error('API Error:', {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      originalError: error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  } else {
    console.error('API Error:', appError, error);
  }
  
  return appError;
};

export const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const appError = parseApiError(error);
      
      // Don't retry non-retryable errors
      if (!appError.retryable || attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleApiError(error);
      throw appError;
    }
  };
};

// Validation error helpers
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  const errorMessages = Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
    .join('\n');
  
  return errorMessages;
};

// Offline detection
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const onOnlineStatusChange = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};