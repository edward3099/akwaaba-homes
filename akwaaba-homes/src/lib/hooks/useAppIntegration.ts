import { useMemo } from 'react';
import { useAuthIntegration } from './useAuthIntegration';
import { useLoading } from './useLoading';
import { useErrorIntegration } from './useErrorIntegration';
import { useToastIntegration } from './useToastIntegration';
import { useApiClient } from '@/lib/api/apiClient';
import { useAuthCheck } from './useAuthIntegration';

// Main integration configuration
export interface AppIntegrationConfig {
  componentName: string;
  enableAuth?: boolean;
  enableLoading?: boolean;
  enableErrorHandling?: boolean;
  enableToast?: boolean;
  enableApiClient?: boolean;
  customRouteConfig?: any;
  customErrorConfig?: any;
  customToastConfig?: any;
}

// Main integration result
export interface AppIntegration {
  // Authentication
  auth: {
    state: any;
    actions: any;
    check: any;
    routeProtection: any;
  };
  
  // Loading management
  loading: any;
  
  // Error handling
  error: any;
  
  // Toast notifications
  toast: any;
  
  // API client
  api: any;
  
  // Utility methods
  utils: {
    isReady: boolean;
    hasPermission: (permission: string) => boolean;
    canPerformAction: (action: string, resource?: string) => boolean;
    getComponentContext: () => string;
  };
}

// Default configuration
const DEFAULT_CONFIG: AppIntegrationConfig = {
  componentName: 'UnknownComponent',
  enableAuth: true,
  enableLoading: true,
  enableErrorHandling: true,
  enableToast: true,
  enableApiClient: true,
};

export const useAppIntegration = (config: Partial<AppIntegrationConfig> = {}): AppIntegration => {
  // Merge with defaults
  const fullConfig: AppIntegrationConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);

  // Initialize authentication integration
  const authIntegration = useAuthIntegration(
    fullConfig.enableAuth ? fullConfig.customRouteConfig : undefined
  );

  // Initialize loading management
  const loading = useLoading();

  // Initialize error handling
  const error = useErrorIntegration(
    fullConfig.componentName,
    fullConfig.customErrorConfig
  );

  // Initialize toast notifications
  const toast = useToastIntegration(fullConfig.componentName);

  // Initialize API client
  const api = useApiClient();

  // Initialize auth check
  const authCheck = useAuthCheck();

  // Check if all systems are ready
  const isReady = useMemo(() => {
    if (fullConfig.enableAuth && authIntegration.authState.isLoading) {
      return false;
    }
    return true;
  }, [fullConfig.enableAuth, authIntegration.authState.isLoading]);

  // Permission checking utility
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!fullConfig.enableAuth || !authIntegration.authState.isAuthenticated) {
        return false;
      }

      const userProfile = authIntegration.authState.userProfile;
      if (!userProfile) return false;

      // Basic role-based permission checking
      switch (permission) {
        case 'admin':
          return userProfile.user_type === 'admin';
        case 'seller':
          return ['admin', 'seller'].includes(userProfile.user_type);
        case 'agent':
          return ['admin', 'agent'].includes(userProfile.user_type);
        case 'staff':
          return ['admin', 'seller', 'agent'].includes(userProfile.user_type);
        case 'authenticated':
          return authIntegration.authState.isAuthenticated;
        default:
          return false;
      }
    };
  }, [fullConfig.enableAuth, authIntegration.authState.isAuthenticated, authIntegration.authState.userProfile]);

  // Action permission checking
  const canPerformAction = useMemo(() => {
    return (action: string, resource?: string): boolean => {
      if (!fullConfig.enableAuth || !authIntegration.authState.isAuthenticated) {
        return false;
      }

      const userProfile = authIntegration.authState.userProfile;
      if (!userProfile) return false;

      // Action-based permission checking
      switch (action) {
        case 'create':
        case 'update':
        case 'delete':
          // Only admins can perform destructive actions on system resources
          if (resource === 'system' || resource === 'users') {
            return userProfile.user_type === 'admin';
          }
          // Sellers and agents can manage their own resources
          return ['admin', 'seller', 'agent'].includes(userProfile.user_type);
        
        case 'read':
          // All authenticated users can read
          return true;
        
        case 'approve':
          // Only admins can approve
          return userProfile.user_type === 'admin';
        
        case 'manage':
          // Admins can manage everything, others can manage their own
          return userProfile.user_type === 'admin';
        
        default:
          return false;
      }
    };
  }, [fullConfig.enableAuth, authIntegration.authState.isAuthenticated, authIntegration.authState.userProfile]);

  // Get component context
  const getComponentContext = useMemo(() => {
    return (): string => {
      return fullConfig.componentName;
    };
  }, [fullConfig.componentName]);

  // Create utility methods object
  const utils = useMemo(() => ({
    isReady,
    hasPermission,
    canPerformAction,
    getComponentContext,
  }), [isReady, hasPermission, canPerformAction, getComponentContext]);

  // Create auth object
  const auth = useMemo(() => ({
    state: authIntegration.authState,
    actions: authIntegration.authActions,
    check: authCheck,
    routeProtection: authIntegration.routeProtection,
  }), [authIntegration, authCheck]);

  // Return the complete integration object
  return {
    auth,
    loading,
    error,
    toast,
    api,
    utils,
  };
};

// Hook for simple integration (minimal features)
export const useSimpleIntegration = (componentName: string) => {
  const { toast } = useToastIntegration(componentName);
  const { handleError } = useErrorIntegration(componentName, {
    showToast: false, // We'll handle toasts manually
  });
  const { withLoading } = useLoading();

  // Simple error handler with toast
  const handleErrorWithToast = async (error: any, action: string) => {
    const appError = await handleError(error, action);
    
    if (appError.severity === 'critical') {
      toast.showError('Critical Error', appError.userMessage);
    } else if (appError.severity === 'high') {
      toast.showError('Error', appError.userMessage);
    } else {
      toast.showWarning('Warning', appError.userMessage);
    }
  };

  // Simple loading wrapper
  const withSimpleLoading = async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    return withLoading(operationKey, async () => {
      try {
        return await operation();
      } catch (error) {
        await handleErrorWithToast(error, operationKey);
        throw error;
      }
    }, message);
  };

  return {
    toast,
    handleError: handleErrorWithToast,
    withLoading: withSimpleLoading,
    componentName,
  };
};

// Hook for form integration
export const useFormIntegration = (componentName: string) => {
  const { toast } = useToastIntegration(componentName);
  const { handleError } = useErrorIntegration(componentName, {
    showToast: false,
  });
  const { withLoading } = useLoading();

  // Handle form submission with loading and error handling
  const handleFormSubmit = async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    successMessage: string = 'Operation completed successfully',
    errorMessage: string = 'Operation failed'
  ): Promise<T | null> => {
    try {
      const result = await withLoading(operationKey, operation);
      toast.showSuccess('Success', successMessage);
      return result;
    } catch (error) {
      await handleError(error, 'form_submit');
      toast.showError('Error', errorMessage);
      return null;
    }
  };

  // Handle form validation errors
  const handleValidationErrors = (errors: Record<string, any>) => {
    toast.showValidationErrors(errors);
  };

  // Handle form reset
  const handleFormReset = () => {
    toast.showInfo('Form Reset', 'Form has been reset to its initial state');
  };

  return {
    handleFormSubmit,
    handleValidationErrors,
    handleFormReset,
    toast,
  };
};

// Hook for data operation integration
export const useDataIntegration = (componentName: string) => {
  const { toast } = useToastIntegration(componentName);
  const { handleError } = useErrorIntegration(componentName, {
    showToast: false,
  });
  const { withLoading } = useLoading();

  // Handle CRUD operations
  const handleDataOperation = async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    operationType: 'create' | 'update' | 'delete' | 'fetch',
    entityName: string
  ): Promise<T | null> => {
    try {
      const result = await withLoading(operationKey, operation);
      
      // Show success toast
      toast.showDataOperationToast(operationType, entityName, true);
      
      return result;
    } catch (error) {
      await handleError(error, `${operationType}_${entityName}`);
      
      // Show error toast
      toast.showDataOperationToast(operationType, entityName, false, error);
      
      return null;
    }
  };

  // Handle batch operations
  const handleBatchOperation = async <T>(
    operationKey: string,
    operations: Array<() => Promise<any>>,
    entityName: string
  ): Promise<T[]> => {
    try {
      const results = await withLoading(operationKey, async () => {
        const results: T[] = [];
        const total = operations.length;
        
        for (let i = 0; i < total; i++) {
          const result = await operations[i]();
          results.push(result);
        }
        
        return results;
      });
      
      toast.showSuccess('Batch Operation Complete', `${total} ${entityName} processed successfully`);
      return results;
    } catch (error) {
      await handleError(error, `batch_${entityName}`);
      toast.showError('Batch Operation Failed', `Failed to process ${entityName}`);
      return [];
    }
  };

  return {
    handleDataOperation,
    handleBatchOperation,
    toast,
  };
};

// Hook for file operation integration
export const useFileIntegration = (componentName: string) => {
  const { toast } = useToastIntegration(componentName);
  const { handleError } = useErrorIntegration(componentName, {
    showToast: false,
  });
  const { withLoading } = useLoading();

  // Handle file upload
  const handleFileUpload = async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    fileName: string
  ): Promise<T | null> => {
    try {
      const result = await withLoading(operationKey, operation);
      toast.showSuccess('Upload Complete', `${fileName} uploaded successfully`);
      return result;
    } catch (error) {
      await handleError(error, 'file_upload');
      toast.showError('Upload Failed', `Failed to upload ${fileName}`);
      return null;
    }
  };

  // Handle file deletion
  const handleFileDelete = async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    fileName: string
  ): Promise<T | null> => {
    try {
      const result = await withLoading(operationKey, operation);
      toast.showSuccess('File Deleted', `${fileName} deleted successfully`);
      return result;
    } catch (error) {
      await handleError(error, 'file_delete');
      toast.showError('Deletion Failed', `Failed to delete ${fileName}`);
      return null;
    }
  };

  return {
    handleFileUpload,
    handleFileDelete,
    toast,
  };
};

export default useAppIntegration;
