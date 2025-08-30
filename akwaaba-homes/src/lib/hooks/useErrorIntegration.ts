import { useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useErrorHandler, AppError } from '@/lib/utils/errorHandler';
import { useLoading } from '@/lib/hooks/useLoading';
import { securityService } from '@/lib/services/securityService';

// Error handling configuration
export interface ErrorHandlingConfig {
  showToast?: boolean;
  logToSecurity?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackMessage?: string;
  onError?: (error: AppError) => void;
  onRetry?: () => void;
}

// Extended app error interface (local extension with additional properties)
export interface ExtendedAppError {
  type: string;
  severity: string;
  message: string;
  code?: string;
  details?: any;
  context: any;
  originalError?: Error;
  retryable: boolean;
  userMessage: string;
}

// Error context for components
export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

// Error handling result
export interface ErrorHandlingResult {
  handled: boolean;
  shouldRetry: boolean;
  retryCount: number;
  maxRetries: number;
  userMessage: string;
  technicalMessage: string;
}

// Error recovery strategy
export interface ErrorRecovery {
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: string;
  userAction?: string;
}

// Default error handling configuration
const DEFAULT_ERROR_CONFIG: ErrorHandlingConfig = {
  showToast: true,
  logToSecurity: true,
  retryable: false,
  maxRetries: 3,
  retryDelay: 1000,
  fallbackMessage: 'An unexpected error occurred. Please try again.',
};

export const useErrorIntegration = (componentName: string, customConfig?: Partial<ErrorHandlingConfig>) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { withLoading } = useLoading();
  
  // Merge custom config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_ERROR_CONFIG,
    ...customConfig,
  }), [customConfig]);

  // Create error context
  const createErrorContext = useCallback((action: string, additionalData?: Record<string, any>): ErrorContext => {
    return {
      component: componentName,
      action,
      additionalData,
    };
  }, [componentName]);

  // Handle errors with comprehensive processing
  const handleErrorWithContext = useCallback(async (
    error: Error | string | any,
    action: string,
    additionalData?: Record<string, any>,
    customConfig?: Partial<ErrorHandlingConfig>
  ): Promise<ErrorHandlingResult> => {
    const mergedConfig = { ...config, ...customConfig };
    const context = createErrorContext(action, additionalData);
    
    try {
      // Process error through error handler
      const appError = await handleError(error, context);
      
      // Log to security service if enabled
      if (mergedConfig.logToSecurity) {
        await securityService.logSecurityEvent(
          'frontend_error',
          'medium' as any, // Default severity since errorHandler AppError doesn't have severity
          {
            error_type: 'unknown', // Default type since errorHandler AppError doesn't have type
            error_message: appError.message,
            component: context.component,
            action: context.action,
            user_id: context.userId,
            additional_data: context.additionalData,
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Show toast notification if enabled
      if (mergedConfig.showToast) {
        const toastVariant = 'default'; // Default since errorHandler AppError doesn't have severity
        toast({
          title: getErrorTitle('unknown'), // Default since errorHandler AppError doesn't have type
          description: appError.userMessage || appError.message,
          variant: toastVariant,
        });
      }

      // Call custom error handler if provided
      if (mergedConfig.onError) {
        mergedConfig.onError(appError);
      }

      return {
        handled: true,
        shouldRetry: (appError.recoverable || false) && mergedConfig.retryable,
        retryCount: 0,
        maxRetries: mergedConfig.maxRetries || 3,
        userMessage: appError.userMessage,
        technicalMessage: appError.message,
      };

    } catch (handlerError) {
      // Fallback error handling if the main handler fails
      console.error('Error handler failed:', handlerError);
      
      const fallbackMessage = mergedConfig.fallbackMessage || 'An error occurred while processing your request.';
      
      if (mergedConfig.showToast) {
        toast({
          title: "Error",
          description: fallbackMessage,
          variant: "destructive",
        });
      }

      return {
        handled: false,
        shouldRetry: false,
        retryCount: 0,
        maxRetries: 0,
        userMessage: fallbackMessage,
        technicalMessage: 'Error handler failed',
      };
    }
  }, [config, createErrorContext, handleError, toast]);

  // Handle errors with retry logic
  const handleErrorWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    action: string,
    additionalData?: Record<string, any>,
    customConfig?: Partial<ErrorHandlingConfig>
  ): Promise<T> => {
    const mergedConfig = { ...config, ...customConfig };
    const maxRetries = mergedConfig.maxRetries || 3;
    const retryDelay = mergedConfig.retryDelay || 1000;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          // Final attempt failed, handle error
          await handleErrorWithContext(error, action, additionalData, {
            ...customConfig,
            retryable: false,
          });
          throw error;
        }
        
        // Log retry attempt
        if (mergedConfig.logToSecurity) {
          await securityService.logSecurityEvent(
            'retry_attempt',
            'low',
            {
              component: componentName,
              action,
              attempt: attempt + 1,
              max_retries: maxRetries,
              error_message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            }
          );
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }, [config, componentName, handleErrorWithContext]);

  // Handle errors with loading state
  const handleErrorWithLoading = useCallback(async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    action: string,
    additionalData?: Record<string, any>,
    customConfig?: Partial<ErrorHandlingConfig>
  ): Promise<T> => {
    return (withLoading as any)(async () => {
      try {
        return await operation();
      } catch (error) {
        await handleErrorWithContext(error, action, additionalData, customConfig);
        throw error;
      }
    }, 'Loading...');
  }, [withLoading, handleErrorWithContext]);

  // Handle form validation errors
  const handleValidationError = useCallback((
    errors: Record<string, any>,
    action: string,
    additionalData?: Record<string, any>
  ): void => {
    const errorMessages = Object.values(errors)
      .filter(Boolean)
      .map(error => error.message || 'Invalid input')
      .join(', ');
    
    const context = createErrorContext(action, {
      ...additionalData,
      validation_errors: errors,
    });
    
    // Log validation error
    if (config.logToSecurity) {
      securityService.logSecurityEvent(
        'validation_error',
        'low',
        {
          component: context.component,
          action: context.action,
          error_count: Object.keys(errors).length,
          error_details: errors,
          timestamp: new Date().toISOString(),
        }
      );
    }
    
    // Show toast
    if (config.showToast) {
      toast({
        title: "Validation Error",
        description: errorMessages,
        variant: "destructive",
      });
    }
  }, [config, createErrorContext, toast]);

  // Handle network errors
  const handleNetworkError = useCallback(async (
    error: any,
    action: string,
    additionalData?: Record<string, any>
  ): Promise<void> => {
    const isNetworkError = error?.message?.includes('fetch') || 
                          error?.message?.includes('network') ||
                          error?.code === 'NETWORK_ERROR';
    
    if (isNetworkError) {
      await handleErrorWithContext(error, action, {
        ...additionalData,
        error_category: 'network',
        retryable: true,
      }, {
        retryable: true,
        fallbackMessage: 'Network connection issue. Please check your internet connection and try again.',
      });
    } else {
      await handleErrorWithContext(error, action, additionalData);
    }
  }, [handleErrorWithContext]);

  // Handle authentication errors
  const handleAuthError = useCallback(async (
    error: any,
    action: string,
    additionalData?: Record<string, any>
  ): Promise<void> => {
    const isAuthError = error?.message?.includes('auth') ||
                       error?.message?.includes('unauthorized') ||
                       error?.code === 'AUTH_ERROR';
    
    if (isAuthError) {
      await handleErrorWithContext(error, action, {
        ...additionalData,
        error_category: 'authentication',
        requires_login: true,
      }, {
        fallbackMessage: 'Authentication required. Please sign in to continue.',
      });
    } else {
      await handleErrorWithContext(error, action, additionalData);
    }
  }, [handleErrorWithContext]);

  // Handle permission errors
  const handlePermissionError = useCallback(async (
    error: any,
    action: string,
    additionalData?: Record<string, any>
  ): Promise<void> => {
    const isPermissionError = error?.message?.includes('permission') ||
                             error?.message?.includes('forbidden') ||
                             error?.code === 'PERMISSION_ERROR';
    
    if (isPermissionError) {
      await handleErrorWithContext(error, action, {
        ...additionalData,
        error_category: 'permission',
        requires_elevation: true,
      }, {
        fallbackMessage: 'You don\'t have permission to perform this action. Please contact an administrator.',
      });
    } else {
      await handleErrorWithContext(error, action, additionalData);
    }
  }, [handleErrorWithContext]);

  // Get error title based on error type
  const getErrorTitle = useCallback((errorType: string): string => {
    switch (errorType) {
      case 'network':
        return 'Network Error';
      case 'authentication':
        return 'Authentication Error';
      case 'authorization':
        return 'Permission Denied';
      case 'validation':
        return 'Validation Error';
      case 'rate_limit':
        return 'Rate Limit Exceeded';
      case 'server':
        return 'Server Error';
      case 'client':
        return 'Client Error';
      default:
        return 'Error';
    }
  }, []);

  // Get error recovery strategy
  const getErrorRecovery = useCallback((error: AppError, retryCount: number = 0): ErrorRecovery => {
    const maxRetries = config.maxRetries || 3;
    const canRetry = (error.recoverable || false) && config.retryable && retryCount < maxRetries;
    
    return {
      canRetry,
      retryCount,
      maxRetries,
      retryDelay: config.retryDelay || 1000,
      fallbackAction: 'Please try again later or contact support if the problem persists.',
      userAction: canRetry ? 'Click retry to attempt the operation again.' : 'Please check your input and try again.',
    };
  }, [config]);

  // Clear error state (useful for form resets)
  const clearError = useCallback((action?: string): void => {
    // This could be extended to clear specific error states
    // For now, we'll just log the action
    if (action && config.logToSecurity) {
      securityService.logSecurityEvent(
        'error_cleared',
        'low',
        {
          component: componentName,
          action,
          timestamp: new Date().toISOString(),
        }
      );
    }
  }, [componentName, config.logToSecurity]);

  // Effect to handle global error events
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleErrorWithContext(event.error, 'global_error', {
        error_source: 'global',
        error_line: event.lineno,
        error_column: event.colno,
        error_filename: event.filename,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleErrorWithContext(event.reason, 'unhandled_promise_rejection', {
        error_source: 'promise_rejection',
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleErrorWithContext]);

  return {
    // Core error handling
    handleError: handleErrorWithContext,
    handleErrorWithRetry,
    handleErrorWithLoading,
    
    // Specialized error handlers
    handleValidationError,
    handleNetworkError,
    handleAuthError,
    handlePermissionError,
    
    // Utilities
    createErrorContext,
    getErrorTitle,
    getErrorRecovery,
    clearError,
    
    // Configuration
    config,
  };
};

// Hook for simple error handling
export const useSimpleError = (componentName: string) => {
  const { toast } = useToast();
  
  const handleError = useCallback((error: any, action: string = 'unknown') => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Show error toast
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    // Log to console
    console.error(`[${componentName}] Error in ${action}:`, error);
  }, [componentName, toast]);
  
  const handleValidationError = useCallback((errors: Record<string, any>) => {
    const errorMessages = Object.values(errors)
      .filter(Boolean)
      .map(error => error.message || 'Invalid input')
      .join(', ');
    
    toast({
      title: "Validation Error",
      description: errorMessages,
      variant: "destructive",
    });
  }, [toast]);
  
  return {
    handleError,
    handleValidationError,
  };
};

// Hook for error boundaries
export const useErrorBoundary = (componentName: string) => {
  const { handleError } = useErrorIntegration(componentName, {
    showToast: true,
    logToSecurity: true,
  });
  
  const captureError = useCallback((error: Error, errorInfo: any) => {
    handleError(error, 'error_boundary', {
      error_info: errorInfo,
      component_stack: errorInfo.componentStack,
    });
  }, [handleError]);
  
  return {
    captureError,
  };
};

export default useErrorIntegration;
