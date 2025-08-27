import { useToast } from '@/components/ui/use-toast';
import { securityService } from '@/lib/services/securityService';
import { useState, useCallback, useMemo } from 'react';

// Error types and interfaces
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  userMessage?: string;
  recoverable?: boolean;
  action?: string;
}

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  timestamp: string;
  additionalData?: unknown;
}

// Error codes
export const ERROR_CODES = {
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  API_ERROR: 'API_ERROR',
  API_BAD_REQUEST: 'API_BAD_REQUEST',
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  PROPERTY_ACCESS_DENIED: 'PROPERTY_ACCESS_DENIED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INQUIRY_NOT_FOUND: 'INQUIRY_NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error message mappings
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Please sign in to continue',
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again',
  [ERROR_CODES.NETWORK_OFFLINE]: 'You are currently offline',
  [ERROR_CODES.API_ERROR]: 'Server error. Please try again later',
  [ERROR_CODES.API_BAD_REQUEST]: 'Invalid request data',
  [ERROR_CODES.API_NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CODES.API_SERVER_ERROR]: 'Server error. Please try again later',
  [ERROR_CODES.API_RATE_LIMITED]: 'Too many requests. Please wait a moment',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Invalid format for this field',
  [ERROR_CODES.DB_CONNECTION_ERROR]: 'Database connection error. Please try again later',
  [ERROR_CODES.DB_QUERY_ERROR]: 'Database query error. Please try again later',
  [ERROR_CODES.DB_CONSTRAINT_VIOLATION]: 'Data validation error. Please check your input',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Please choose a smaller file',
  [ERROR_CODES.FILE_INVALID_TYPE]: 'Invalid file type. Please choose a supported format',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again',
  [ERROR_CODES.PROPERTY_NOT_FOUND]: 'Property not found',
  [ERROR_CODES.PROPERTY_ACCESS_DENIED]: 'Access denied to this property',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.INQUIRY_NOT_FOUND]: 'Inquiry not found',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
};

// Error recovery suggestions
const ERROR_RECOVERY_SUGGESTIONS: Record<string, string[]> = {
  [ERROR_CODES.AUTH_UNAUTHORIZED]: ['Sign in to your account', 'Check if your session is still valid'],
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: ['Check your email and password', 'Try resetting your password'],
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: ['Sign in again', 'Check if you\'re using the correct account'],
  
  [ERROR_CODES.NETWORK_ERROR]: ['Check your internet connection', 'Try refreshing the page', 'Check if the service is available'],
  [ERROR_CODES.NETWORK_TIMEOUT]: ['Try again in a moment', 'Check your internet speed', 'Try a different network'],
  [ERROR_CODES.NETWORK_OFFLINE]: ['Connect to the internet', 'Check your network settings', 'Try using mobile data'],
  
  [ERROR_CODES.API_BAD_REQUEST]: ['Check your input data', 'Make sure all required fields are filled', 'Verify the data format'],
  [ERROR_CODES.API_NOT_FOUND]: ['Check if the URL is correct', 'Verify the resource exists', 'Contact support if needed'],
  [ERROR_CODES.API_SERVER_ERROR]: ['Try again later', 'Check if the service is down', 'Contact support if the problem persists'],
  [ERROR_CODES.API_RATE_LIMITED]: ['Wait a few minutes', 'Reduce the frequency of requests', 'Contact support if needed'],
  
  [ERROR_CODES.VALIDATION_ERROR]: ['Review your input', 'Check for typos', 'Ensure all required fields are completed'],
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: ['Fill in the required field', 'Check if the field is marked as required'],
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: ['Check the expected format', 'Review the field description', 'Use the correct input type'],
  
  [ERROR_CODES.DB_CONNECTION_ERROR]: ['Try again later', 'Check if the service is available', 'Contact support if the problem persists'],
  [ERROR_CODES.DB_QUERY_ERROR]: ['Try again later', 'Check your input data', 'Contact support if the problem persists'],
  [ERROR_CODES.DB_CONSTRAINT_VIOLATION]: ['Check your input data', 'Ensure data meets requirements', 'Review validation rules'],
  
  [ERROR_CODES.FILE_TOO_LARGE]: ['Choose a smaller file', 'Compress the file', 'Use a different file format'],
  [ERROR_CODES.FILE_INVALID_TYPE]: ['Choose a supported file format', 'Convert the file to a supported format', 'Check the allowed file types'],
  [ERROR_CODES.FILE_UPLOAD_FAILED]: ['Try again', 'Check your internet connection', 'Try a different file'],
  
  [ERROR_CODES.PROPERTY_NOT_FOUND]: ['Check if the property exists', 'Verify the property ID', 'Search for similar properties'],
  [ERROR_CODES.PROPERTY_ACCESS_DENIED]: ['Check your permissions', 'Contact the property owner', 'Verify your account status'],
  [ERROR_CODES.USER_NOT_FOUND]: ['Check if the user exists', 'Verify the user ID', 'Contact support if needed'],
  [ERROR_CODES.INQUIRY_NOT_FOUND]: ['Check if the inquiry exists', 'Verify the inquiry ID', 'Contact support if needed'],
  
  [ERROR_CODES.UNKNOWN_ERROR]: ['Try again', 'Refresh the page', 'Contact support if the problem persists'],
};

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create a standardized error object
  public createError(
    code: string,
    message?: string,
    details?: unknown,
    context?: ErrorContext
  ): AppError {
    const error: AppError = {
      code,
      message: message || ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details,
      userMessage: ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      recoverable: this.isRecoverable(code),
      action: this.getSuggestedAction(code),
    };

    // Log the error
    this.logError(error, context);

    return error;
  }

  // Handle API errors
  public handleApiError(error: any, context?: ErrorContext): AppError {
    if (error?.code) {
      return this.createError(error.code, error.message, error.details, context);
    }

    if (error?.status) {
      const status = error.status;
      let code: string = ERROR_CODES.UNKNOWN_ERROR;

      if (status === 401) code = ERROR_CODES.AUTH_UNAUTHORIZED;
      else if (status === 403) code = ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS;
      else if (status === 404) code = ERROR_CODES.API_NOT_FOUND;
      else if (status === 400) code = ERROR_CODES.API_BAD_REQUEST;
      else if (status === 429) code = ERROR_CODES.API_RATE_LIMITED;
      else if (status >= 500) code = ERROR_CODES.API_SERVER_ERROR;

      return this.createError(code, error.message, error, context);
    }

    if (error?.message) {
      return this.createError(ERROR_CODES.UNKNOWN_ERROR, error.message, error, context);
    }

    return this.createError(ERROR_CODES.UNKNOWN_ERROR, 'An unexpected error occurred', error, context);
  }

  // Handle network errors
  public handleNetworkError(error: any, context?: ErrorContext): AppError {
    if (error?.name === 'TypeError' && error?.message.includes('fetch')) {
      return this.createError(ERROR_CODES.NETWORK_ERROR, 'Network connection failed', error, context);
    }

    if (error?.name === 'AbortError') {
      return this.createError(ERROR_CODES.NETWORK_TIMEOUT, 'Request was cancelled', error, context);
    }

    return this.createError(ERROR_CODES.NETWORK_ERROR, 'Network error occurred', error, context);
  }

  // Handle validation errors
  public handleValidationError(errors: any[], context?: ErrorContext): AppError {
    const errorDetails = errors.map(err => ({
      field: err.path?.join('.') || 'unknown',
      message: err.message,
      code: err.code,
    }));

    return this.createError(
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      { errors: errorDetails },
      context
    );
  }

  // Check if an error is recoverable
  private isRecoverable(code: string): boolean {
    const nonRecoverableCodes = [
      ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS,
      ERROR_CODES.API_NOT_FOUND,
      ERROR_CODES.USER_NOT_FOUND,
      ERROR_CODES.PROPERTY_NOT_FOUND,
      ERROR_CODES.INQUIRY_NOT_FOUND,
    ];

    return !nonRecoverableCodes.includes(code as any);
  }

  // Get suggested action for an error
  private getSuggestedAction(code: string): string {
    const suggestions = ERROR_RECOVERY_SUGGESTIONS[code];
    return suggestions?.[0] || 'Try again';
  }

  // Log error for debugging
  private logError(error: AppError, context?: ErrorContext): void {
    const logEntry = {
      ...error,
      context,
      timestamp: new Date().toISOString(),
    };

    this.errorLog.push(logEntry);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }
  }

  // Get error log
  public getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  // Get recovery suggestions for an error
  public getRecoverySuggestions(code: string): string[] {
    return ERROR_RECOVERY_SUGGESTIONS[code] || [];
  }

  // Check if user is offline
  public isOffline(): boolean {
    return !navigator.onLine;
  }

  // Handle offline state
  public handleOfflineError(context?: ErrorContext): AppError {
    return this.createError(ERROR_CODES.NETWORK_OFFLINE, 'You are currently offline', null, context);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const createError = (code: string, message?: string, details?: unknown, context?: ErrorContext) =>
  errorHandler.createError(code, message, details, context);

export const handleApiError = (error: any, context?: ErrorContext) =>
  errorHandler.handleApiError(error, context);

export const handleNetworkError = (error: any, context?: ErrorContext) =>
  errorHandler.handleNetworkError(error, context);

export const handleValidationError = (errors: any[], context?: ErrorContext) =>
  errorHandler.handleValidationError(errors, context);

export const isOffline = () => errorHandler.isOffline();

export const handleOfflineError = (context?: ErrorContext) =>
  errorHandler.handleOfflineError(context);

// Hook for using error handling
export const useErrorHandler = (componentName?: string) => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const { toast } = useToast();

  const addError = useCallback((error: AppError) => {
    setErrors(prev => [...prev, error]);
    
    // Show toast notification
    toast({
      title: 'Error',
      description: error.userMessage || error.message,
      variant: 'destructive',
    });
  }, [toast]);

  const removeError = useCallback((errorCode: string) => {
    setErrors(prev => prev.filter(err => err.code !== errorCode));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleError = useCallback((error: unknown, context?: Partial<ErrorContext>) => {
    const appError: AppError = {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      recoverable: true,
      details: error,
      ...context,
    };

    addError(appError);
    return appError;
  }, [addError]);

  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const hasUnrecoverableErrors = useMemo(() => errors.some(err => !err.recoverable), [errors]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
    hasErrors,
    hasUnrecoverableErrors,
  };
};
