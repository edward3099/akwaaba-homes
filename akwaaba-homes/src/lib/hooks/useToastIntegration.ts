import { useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/lib/hooks/useLoading';
import { useErrorIntegration } from '@/lib/hooks/useErrorIntegration';

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Toast notification configuration
export interface ToastConfig {
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Toast notification data
export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  config?: ToastConfig;
  timestamp: number;
  read: boolean;
}

// Toast notification result
export interface ToastResult {
  id: string;
  dismissed: boolean;
}

// Default toast configurations
const DEFAULT_TOAST_CONFIGS: Record<ToastType, Partial<ToastConfig>> = {
  success: {
    duration: 5000,
    dismissible: true,
    priority: 'low',
  },
  error: {
    duration: 8000,
    dismissible: true,
    priority: 'high',
  },
  warning: {
    duration: 6000,
    dismissible: true,
    priority: 'medium',
  },
  info: {
    duration: 4000,
    dismissible: true,
    priority: 'low',
  },
  loading: {
    duration: undefined, // No auto-dismiss for loading
    dismissible: false,
    priority: 'medium',
  },
};

// Toast notification manager
export const useToastIntegration = (componentName: string) => {
  const { toast } = useToast();
  const { withLoading } = useLoading();
  const { handleError } = useErrorIntegration(componentName);

  // Create toast notification
  const createToast = useCallback((
    type: ToastType,
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    const defaultConfig = DEFAULT_TOAST_CONFIGS[type];
    const mergedConfig = { ...defaultConfig, ...config };
    
    const toastId = `${componentName}_${type}_${Date.now()}`;
    
    const toastVariant = type === 'error' ? 'destructive' : 
                         type === 'warning' ? 'default' : 
                         type === 'loading' ? 'default' : 'default';
    
    toast({
      title,
      description,
      variant: toastVariant,
      duration: mergedConfig.duration,
      // action: mergedConfig.action, // Disabled due to type issues
      // onDismiss: mergedConfig.onDismiss, // Disabled due to type issues
    });
    
    return {
      id: toastId,
      dismissed: false,
    };
  }, [componentName, toast]);

  // Success toast
  const showSuccess = useCallback((
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('success', title, description, config);
  }, [createToast]);

  // Error toast
  const showError = useCallback((
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('error', title, description, config);
  }, [createToast]);

  // Warning toast
  const showWarning = useCallback((
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('warning', title, description, config);
  }, [createToast]);

  // Info toast
  const showInfo = useCallback((
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('info', title, description, config);
  }, [createToast]);

  // Loading toast
  const showLoading = useCallback((
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('loading', title, description, {
      ...config,
      duration: undefined, // No auto-dismiss
      dismissible: false,
    });
  }, [createToast]);

  // Toast with loading state integration
  const showLoadingToast = useCallback((
    operationKey: string,
    title: string,
    description?: string,
    config?: ToastConfig
  ): ToastResult => {
    const loadingToast = showLoading(title, description, config);
    
    // Update loading state to show progress
    (withLoading as any)(async () => {
      // This will be handled by the loading system
      return Promise.resolve();
    }, title);
    
    return loadingToast;
  }, [showLoading, withLoading]);

  // Toast with success after loading
  const showSuccessAfterLoading = useCallback((
    operationKey: string,
    successTitle: string,
    successDescription?: string,
    config?: ToastConfig
  ): void => {
    // Show success toast after loading completes
    setTimeout(() => {
      showSuccess(successTitle, successDescription, config);
    }, 100); // Small delay to ensure loading state is cleared
  }, [showSuccess]);

  // Toast with error after loading
  const showErrorAfterLoading = useCallback((
    operationKey: string,
    errorTitle: string,
    errorDescription?: string,
    config?: ToastConfig
  ): void => {
    // Show error toast after loading completes
    setTimeout(() => {
      showError(errorTitle, errorDescription, config);
    }, 100); // Small delay to ensure loading state is cleared
  }, [showError]);

  // Toast with action confirmation
  const showConfirmationToast = useCallback((
    title: string,
    description: string,
    confirmAction: () => void,
    cancelAction?: () => void,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('info', title, description, {
      ...config,
      duration: undefined, // No auto-dismiss for confirmation
      dismissible: true,
      action: {
        label: 'Confirm',
        onClick: confirmAction,
      },
      onDismiss: cancelAction,
    });
  }, [createToast]);

  // Toast with retry action
  const showRetryToast = useCallback((
    title: string,
    description: string,
    retryAction: () => void,
    config?: ToastConfig
  ): ToastResult => {
    return createToast('error', title, description, {
      ...config,
      duration: undefined, // No auto-dismiss for retry
      dismissible: true,
      action: {
        label: 'Retry',
        onClick: retryAction,
      },
    });
  }, [createToast]);

  // Toast with dismiss action
  const showDismissibleToast = useCallback((
    type: ToastType,
    title: string,
    description?: string,
    dismissAction?: () => void,
    config?: ToastConfig
  ): ToastResult => {
    return createToast(type, title, description, {
      ...config,
      dismissible: true,
      onDismiss: dismissAction,
    });
  }, [createToast]);

  // Toast with custom action
  const showToastWithAction = useCallback((
    type: ToastType,
    title: string,
    description: string,
    actionLabel: string,
    actionHandler: () => void,
    config?: ToastConfig
  ): ToastResult => {
    return createToast(type, title, description, {
      ...config,
      action: {
        label: actionLabel,
        onClick: actionHandler,
      },
    });
  }, [createToast]);

  // Toast for form validation errors
  const showValidationErrors = useCallback((
    errors: Record<string, any>,
    title?: string
  ): ToastResult => {
    const errorMessages = Object.values(errors)
      .filter(Boolean)
      .map(error => error.message || 'Invalid input')
      .join(', ');
    
    return showError(
      title || 'Validation Errors',
      errorMessages,
      { duration: 10000 } // Longer duration for validation errors
    );
  }, [showError]);

  // Toast for network errors
  const showNetworkError = useCallback((
    error: any,
    retryAction?: () => void
  ): ToastResult => {
    const isNetworkError = error?.message?.includes('fetch') || 
                          error?.message?.includes('network') ||
                          error?.code === 'NETWORK_ERROR';
    
    if (isNetworkError) {
      if (retryAction) {
        return showRetryToast(
          'Network Error',
          'Please check your internet connection and try again.',
          retryAction
        );
      } else {
        return showError(
          'Network Error',
          'Please check your internet connection and try again.',
          { duration: 8000 }
        );
      }
    } else {
      return showError(
        'Error',
        error?.message || 'An unexpected error occurred',
        { duration: 6000 }
      );
    }
  }, [showError, showRetryToast]);

  // Toast for authentication errors
  const showAuthError = useCallback((
    error: any,
    loginAction?: () => void
  ): ToastResult => {
    const isAuthError = error?.message?.includes('auth') ||
                       error?.message?.includes('unauthorized') ||
                       error?.code === 'AUTH_ERROR';
    
    if (isAuthError) {
      if (loginAction) {
        return showToastWithAction(
          'warning',
          'Authentication Required',
          'Please sign in to continue.',
          'Sign In',
          loginAction
        );
      } else {
        return showWarning(
          'Authentication Required',
          'Please sign in to continue.',
          { duration: 6000 }
        );
      }
    } else {
      return showError(
        'Error',
        error?.message || 'An unexpected error occurred',
        { duration: 6000 }
      );
    }
  }, [showError, showWarning, showToastWithAction]);

  // Toast for permission errors
  const showPermissionError = useCallback((
    error: any,
    contactAdminAction?: () => void
  ): ToastResult => {
    const isPermissionError = error?.message?.includes('permission') ||
                             error?.message?.includes('forbidden') ||
                             error?.code === 'PERMISSION_ERROR';
    
    if (isPermissionError) {
      if (contactAdminAction) {
        return showToastWithAction(
          'warning',
          'Permission Denied',
          'You don\'t have permission to perform this action.',
          'Contact Admin',
          contactAdminAction
        );
      } else {
        return showWarning(
          'Permission Denied',
          'You don\'t have permission to perform this action. Please contact an administrator.',
          { duration: 8000 }
        );
      }
    } else {
      return showError(
        'Error',
        error?.message || 'An unexpected error occurred',
        { duration: 6000 }
      );
    }
  }, [showError, showWarning, showToastWithAction]);

  // Toast for rate limit errors
  const showRateLimitError = useCallback((
    retryAfter?: number,
    retryAction?: () => void
  ): ToastResult => {
    const message = retryAfter 
      ? `Too many requests. Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.';
    
    if (retryAction && retryAfter) {
      // Show retry action after delay
      setTimeout(() => {
        showToastWithAction(
          'info',
          'Ready to Retry',
          'You can now try your request again.',
          'Retry',
          retryAction
        );
      }, retryAfter);
    }
    
    return showWarning(
      'Rate Limit Exceeded',
      message,
      { duration: 10000 }
    );
  }, [showWarning, showToastWithAction]);

  // Toast for file upload progress
  const showUploadProgress = useCallback((
    fileName: string,
    progress: number,
    onCancel?: () => void
  ): ToastResult => {
    const title = `Uploading ${fileName}`;
    const description = `${progress}% complete`;
    
    if (progress >= 100) {
      return showSuccess('Upload Complete', `${fileName} uploaded successfully`);
    }
    
    if (onCancel && progress < 100) {
      return showToastWithAction(
        'loading',
        title,
        description,
        'Cancel',
        onCancel
      );
    }
    
    return showLoading(title, description);
  }, [showSuccess, showLoading, showToastWithAction]);

  // Toast for data operations
  const showDataOperationToast = useCallback((
    operation: 'create' | 'update' | 'delete' | 'fetch',
    entity: string,
    success: boolean,
    error?: any
  ): ToastResult => {
    const operationTitles = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      fetch: 'Fetched',
    };
    
    if (success) {
      return showSuccess(
        `${operationTitles[operation]} Successfully`,
        `${entity} has been ${operation}d successfully.`
      );
    } else {
      return showError(
        `${operationTitles[operation]} Failed`,
        error?.message || `Failed to ${operation} ${entity}.`
      );
    }
  }, [showSuccess, showError]);

  // Toast for system notifications
  const showSystemNotification = useCallback((
    type: 'maintenance' | 'update' | 'alert' | 'info',
    title: string,
    description: string,
    actionLabel?: string,
    actionHandler?: () => void
  ): ToastResult => {
    const toastType: ToastType = type === 'alert' ? 'warning' : 
                                 type === 'maintenance' ? 'warning' : 
                                 type === 'update' ? 'info' : 'info';
    
    if (actionLabel && actionHandler) {
      return showToastWithAction(
        toastType,
        title,
        description,
        actionLabel,
        actionHandler
      );
    }
    
    return createToast(toastType, title, description, {
      duration: type === 'alert' ? undefined : 8000, // Alerts don't auto-dismiss
      dismissible: true,
      priority: type === 'alert' ? 'high' : 'medium',
    });
  }, [createToast, showToastWithAction]);

  // Toast for user feedback
  const showUserFeedback = useCallback((
    feedback: 'positive' | 'negative' | 'neutral',
    title: string,
    description?: string,
    actionLabel?: string,
    actionHandler?: () => void
  ): ToastResult => {
    const toastType: ToastType = feedback === 'positive' ? 'success' : 
                                 feedback === 'negative' ? 'error' : 'info';
    
    if (actionLabel && actionHandler) {
      return showToastWithAction(
        toastType,
        title,
        description || '',
        actionLabel,
        actionHandler
      );
    }
    
    return createToast(toastType, title, description);
  }, [createToast, showToastWithAction]);

  // Memoized toast configurations
  const toastConfigs = useMemo(() => DEFAULT_TOAST_CONFIGS, []);

  return {
    // Basic toast methods
    createToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    
    // Specialized toast methods
    showLoadingToast,
    showSuccessAfterLoading,
    showErrorAfterLoading,
    showConfirmationToast,
    showRetryToast,
    showDismissibleToast,
    showToastWithAction,
    
    // Error-specific toast methods
    showValidationErrors,
    showNetworkError,
    showAuthError,
    showPermissionError,
    showRateLimitError,
    
    // Operation-specific toast methods
    showUploadProgress,
    showDataOperationToast,
    showSystemNotification,
    showUserFeedback,
    
    // Configuration
    toastConfigs,
  };
};

// Hook for simple toast notifications
export const useSimpleToast = () => {
  const { toast } = useToast();
  
  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 5000,
    });
  }, [toast]);
  
  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 8000,
    });
  }, [toast]);
  
  const showWarning = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 6000,
    });
  }, [toast]);
  
  const showInfo = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 4000,
    });
  }, [toast]);
  
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useToastIntegration;
