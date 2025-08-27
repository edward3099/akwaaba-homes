import { useState, useCallback, useEffect, useMemo } from 'react';
import { enhancedApiClient, ApiResponse } from '@/lib/api/enhancedApiClient';
import { useToast } from '@/components/ui/use-toast';

// Base hook for managing API state
function useApiState<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const setDataState = useCallback((newData: T | null) => {
    setData(newData);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    reset,
    setLoadingState,
    setErrorState,
    setDataState,
  };
}

// Generic API call wrapper
function useApiCall<T = unknown>() {
  const { toast } = useToast();
  const state = useApiState<T>();

  const executeCall = useCallback(async <R = T>(
    apiCall: () => Promise<ApiResponse<R>>,
    options?: {
      showToast?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<ApiResponse<R> | null> => {
    try {
      state.setLoadingState(true);
      state.setErrorState(null);

      const response = await apiCall();

      if (response.success) {
        state.setDataState(response.data as T);
        
        if (options?.showToast && options.successMessage) {
          toast({
            title: 'Success',
            description: options.successMessage,
            variant: 'default',
          });
        }
        
        return response;
      } else {
        const errorMsg = options?.errorMessage || response.error || 'Operation failed';
        state.setErrorState(errorMsg);
        
        if (options?.showToast) {
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
        
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      state.setErrorState(errorMessage);
      
      if (options?.showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }, [state, toast]);

  return {
    ...state,
    executeCall,
  };
}

// Properties Hooks
export function useProperties() {
  const { executeCall, ...state } = useApiCall();

  const getProperties = useCallback(async (filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.properties.getProperties(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getPropertyById = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.properties.getPropertyById(id),
      { showToast: false }
    );
  }, [executeCall]);

  const createProperty = useCallback(async (propertyData: unknown) => {
    return executeCall(
      () => enhancedApiClient.properties.createProperty(propertyData),
      { 
        showToast: true, 
        successMessage: 'Property created successfully',
        errorMessage: 'Failed to create property'
      }
    );
  }, [executeCall]);

  const updateProperty = useCallback(async (id: string, propertyData: unknown) => {
    return executeCall(
      () => enhancedApiClient.properties.updateProperty(id, propertyData),
      { 
        showToast: true, 
        successMessage: 'Property updated successfully',
        errorMessage: 'Failed to update property'
      }
    );
  }, [executeCall]);

  const deleteProperty = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.properties.deleteProperty(id),
      { 
        showToast: true, 
        successMessage: 'Property deleted successfully',
        errorMessage: 'Failed to delete property'
      }
    );
  }, [executeCall]);

  const searchProperties = useCallback(async (filters: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.properties.searchProperties(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getFeaturedProperties = useCallback(async (limit: number = 6) => {
    return executeCall(
      () => enhancedApiClient.properties.getFeaturedProperties(limit),
      { showToast: false }
    );
  }, [executeCall]);

  return {
    ...state,
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
    getFeaturedProperties,
  };
}

// Admin Hooks
export function useAdmin() {
  const { executeCall, ...state } = useApiCall();

  const getUsers = useCallback(async (filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.admin.getUsers(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getUserById = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.admin.getUserById(id),
      { showToast: false }
    );
  }, [executeCall]);

  const updateUser = useCallback(async (id: string, userData: unknown) => {
    return executeCall(
      () => enhancedApiClient.admin.updateUser(id, userData),
      { 
        showToast: true, 
        successMessage: 'User updated successfully',
        errorMessage: 'Failed to update user'
      }
    );
  }, [executeCall]);

  const bulkUserActions = useCallback(async (actions: unknown[]) => {
    return executeCall(
      () => enhancedApiClient.admin.bulkUserActions(actions),
      { 
        showToast: true, 
        successMessage: 'Bulk actions completed successfully',
        errorMessage: 'Failed to complete bulk actions'
      }
    );
  }, [executeCall]);

  const getPropertiesForApproval = useCallback(async (filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.admin.getPropertiesForApproval(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const approveProperty = useCallback(async (id: string, approvalData: unknown) => {
    return executeCall(
      () => enhancedApiClient.admin.approveProperty(id, approvalData),
      { 
        showToast: true, 
        successMessage: 'Property approval processed successfully',
        errorMessage: 'Failed to process property approval'
      }
    );
  }, [executeCall]);

  const bulkPropertyApproval = useCallback(async (approvals: unknown[]) => {
    return executeCall(
      () => enhancedApiClient.admin.bulkPropertyApproval(approvals),
      { 
        showToast: true, 
        successMessage: 'Bulk property approvals completed successfully',
        errorMessage: 'Failed to complete bulk property approvals'
      }
    );
  }, [executeCall]);

  const getAnalytics = useCallback(async (timeRange: string = '7d', filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.admin.getAnalytics(timeRange, filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getSystemConfig = useCallback(async () => {
    return executeCall(
      () => enhancedApiClient.admin.getSystemConfig(),
      { showToast: false }
    );
  }, [executeCall]);

  const updateSystemConfig = useCallback(async (configData: unknown) => {
    return executeCall(
      () => enhancedApiClient.admin.updateSystemConfig(configData),
      { 
        showToast: true, 
        successMessage: 'System configuration updated successfully',
        errorMessage: 'Failed to update system configuration'
      }
    );
  }, [executeCall]);

  return {
    ...state,
    getUsers,
    getUserById,
    updateUser,
    bulkUserActions,
    getPropertiesForApproval,
    approveProperty,
    bulkPropertyApproval,
    getAnalytics,
    getSystemConfig,
    updateSystemConfig,
  };
}

// Seller Hooks
export function useSeller() {
  const { executeCall, ...state } = useApiCall();

  const getMyProperties = useCallback(async (filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.seller.getMyProperties(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getMyPropertyById = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.seller.getMyPropertyById(id),
      { showToast: false }
    );
  }, [executeCall]);

  const createMyProperty = useCallback(async (propertyData: unknown) => {
    return executeCall(
      () => enhancedApiClient.seller.createMyProperty(propertyData),
      { 
        showToast: true, 
        successMessage: 'Property created successfully',
        errorMessage: 'Failed to create property'
      }
    );
  }, [executeCall]);

  const updateMyProperty = useCallback(async (id: string, propertyData: unknown) => {
    return executeCall(
      () => enhancedApiClient.seller.updateMyProperty(id, propertyData),
      { 
        showToast: true, 
        successMessage: 'Property updated successfully',
        errorMessage: 'Failed to update property'
      }
    );
  }, [executeCall]);

  const deleteMyProperty = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.seller.deleteMyProperty(id),
      { 
        showToast: true, 
        successMessage: 'Property deleted successfully',
        errorMessage: 'Failed to delete property'
      }
    );
  }, [executeCall]);

  const getMyInquiries = useCallback(async (filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.seller.getMyInquiries(filters),
      { showToast: false }
    );
  }, [executeCall]);

  const getMyInquiryById = useCallback(async (id: string) => {
    return executeCall(
      () => enhancedApiClient.seller.getMyInquiryById(id),
      { showToast: false }
    );
  }, [executeCall]);

  const updateInquiry = useCallback(async (id: string, inquiryData: unknown) => {
    return executeCall(
      () => enhancedApiClient.seller.updateInquiry(id, inquiryData),
      { 
        showToast: true, 
        successMessage: 'Inquiry updated successfully',
        errorMessage: 'Failed to update inquiry'
      }
    );
  }, [executeCall]);

  const getMyAnalytics = useCallback(async (timeRange: string = '7d', filters?: Record<string, unknown>) => {
    return executeCall(
      () => enhancedApiClient.seller.getMyAnalytics(timeRange, filters),
      { showToast: false }
    );
  }, [executeCall]);

  const sendMessage = useCallback(async (messageData: unknown) => {
    return executeCall(
      () => enhancedApiClient.seller.sendMessage(messageData),
      { 
        showToast: true, 
        successMessage: 'Message sent successfully',
        errorMessage: 'Failed to send message'
      }
    );
  }, [executeCall]);

  const sendBulkMessage = useCallback(async (bulkMessageData: unknown) => {
    return executeCall(
      () => enhancedApiClient.seller.sendBulkMessage(bulkMessageData),
      { 
        showToast: true, 
        successMessage: 'Bulk messages sent successfully',
        errorMessage: 'Failed to send bulk messages'
      }
    );
  }, [executeCall]);

  return {
    ...state,
    getMyProperties,
    getMyPropertyById,
    createMyProperty,
    updateMyProperty,
    deleteMyProperty,
    getMyInquiries,
    getMyInquiryById,
    updateInquiry,
    getMyAnalytics,
    sendMessage,
    sendBulkMessage,
  };
}

// CDN Hooks
export function useCDN() {
  const { executeCall, ...state } = useApiCall();

  const uploadFile = useCallback(async (uploadData: unknown) => {
    return executeCall(
      () => enhancedApiClient.cdn.uploadFile(uploadData),
      { 
        showToast: true, 
        successMessage: 'File uploaded successfully',
        errorMessage: 'Failed to upload file'
      }
    );
  }, [executeCall]);

  const preloadAssets = useCallback(async (assets: unknown[]) => {
    return executeCall(
      () => enhancedApiClient.cdn.preloadAssets(assets),
      { 
        showToast: true, 
        successMessage: 'Assets preloaded successfully',
        errorMessage: 'Failed to preload assets'
      }
    );
  }, [executeCall]);

  const warmUpCache = useCallback(async (warmupData: unknown) => {
    return executeCall(
      () => enhancedApiClient.cdn.warmUpCache(warmupData),
      { 
        showToast: true, 
        successMessage: 'Cache warmed up successfully',
        errorMessage: 'Failed to warm up cache'
      }
    );
  }, [executeCall]);

  const getMetrics = useCallback(async (bucketName: string, timeRange: string = '24h') => {
    return executeCall(
      () => enhancedApiClient.cdn.getMetrics(bucketName, timeRange),
      { showToast: false }
    );
  }, [executeCall]);

  const optimizeSettings = useCallback(async (bucketName: string) => {
    return executeCall(
      () => enhancedApiClient.cdn.optimizeSettings(bucketName),
      { 
        showToast: true, 
        successMessage: 'CDN settings optimized successfully',
        errorMessage: 'Failed to optimize CDN settings'
      }
    );
  }, [executeCall]);

  return {
    ...state,
    uploadFile,
    preloadAssets,
    warmUpCache,
    getMetrics,
    optimizeSettings,
  };
}

// Image Optimization Hooks
export function useImageOptimization() {
  const { executeCall, ...state } = useApiCall();

  const optimizeImage = useCallback(async (optimizationData: unknown) => {
    return executeCall(
      () => enhancedApiClient.images.optimizeImage(optimizationData),
      { 
        showToast: true, 
        successMessage: 'Image optimized successfully',
        errorMessage: 'Failed to optimize image'
      }
    );
  }, [executeCall]);

  const getOptimizedImage = useCallback(async (params: Record<string, string>) => {
    return executeCall(
      () => enhancedApiClient.images.getOptimizedImage(params),
      { showToast: false }
    );
  }, [executeCall]);

  const getImageVariants = useCallback(async (bucketName: string, imagePath: string, variant: string) => {
    return executeCall(
      () => enhancedApiClient.images.getImageVariants(bucketName, imagePath, variant),
      { showToast: false }
    );
  }, [executeCall]);

  const getResponsiveImages = useCallback(async (bucketName: string, imagePath: string) => {
    return executeCall(
      () => enhancedApiClient.images.getResponsiveImages(bucketName, imagePath),
      { showToast: false }
    );
  }, [executeCall]);

  return {
    ...state,
    optimizeImage,
    getOptimizedImage,
    getImageVariants,
    getResponsiveImages,
  };
}

// Security Testing Hooks
export function useSecurityTesting() {
  const { executeCall, ...state } = useApiCall();

  const testSecurityHeaders = useCallback(async () => {
    return executeCall(
      () => enhancedApiClient.security.testSecurityHeaders(),
      { showToast: false }
    );
  }, [executeCall]);

  const testRateLimit = useCallback(async () => {
    return executeCall(
      () => enhancedApiClient.security.testRateLimit(),
      { showToast: false }
    );
  }, [executeCall]);

  const testInputValidation = useCallback(async (validationData: unknown) => {
    return executeCall(
      () => enhancedApiClient.security.testInputValidation(validationData),
      { showToast: false }
    );
  }, [executeCall]);

  const testRLSPolicies = useCallback(async () => {
    return executeCall(
      () => enhancedApiClient.security.testRLSPolicies(),
      { showToast: false }
    );
  }, [executeCall]);

  const testSQLInjection = useCallback(async (testData: unknown) => {
    return executeCall(
      () => enhancedApiClient.security.testSQLInjection(testData),
      { showToast: false }
    );
  }, [executeCall]);

  const testXSSProtection = useCallback(async (testData: unknown) => {
    return executeCall(
      () => enhancedApiClient.security.testXSSProtection(testData),
      { showToast: false }
    );
  }, [executeCall]);

  return {
    ...state,
    testSecurityHeaders,
    testRateLimit,
    testInputValidation,
    testRLSPolicies,
    testSQLInjection,
    testXSSProtection,
  };
}

// Authentication and User Management Hooks
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const authenticated = await enhancedApiClient.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const currentUser = await enhancedApiClient.getCurrentUser();
        const role = await enhancedApiClient.getUserRole();
        setUser(currentUser);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);
  const isSeller = useMemo(() => userRole === 'seller', [userRole]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    user,
    userRole,
    isAdmin,
    isSeller,
    loading,
    checkAuth,
  };
}

// Utility hook for managing multiple API calls
export function useMultipleApiCalls() {
  const [calls, setCalls] = useState<Record<string, { loading: boolean; error: string | null; data: unknown }>>({});

  const executeCall = useCallback(async <T = unknown>(
    key: string,
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T> | null> => {
    setCalls(prev => ({ ...prev, [key]: { loading: true, error: null, data: null } }));

    try {
      const response = await apiCall();
      
      if (response.success) {
        setCalls(prev => ({ 
          ...prev, 
          [key]: { loading: false, error: null, data: response.data } 
        }));
      } else {
        setCalls(prev => ({ 
          ...prev, 
          [key]: { loading: false, error: response.error || 'Failed', data: null } 
        }));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCalls(prev => ({ 
        ...prev, 
        [key]: { loading: false, error: errorMessage, data: null } 
      }));
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

  const getCallState = useCallback((key: string) => {
    return calls[key] || { loading: false, error: null, data: null };
  }, [calls]);

  const resetCall = useCallback((key: string) => {
    setCalls(prev => ({ ...prev, [key]: { loading: false, error: null, data: null } }));
  }, []);

  const resetAllCalls = useCallback(() => {
    setCalls({});
  }, []);

  return {
    calls,
    executeCall,
    getCallState,
    resetCall,
    resetAllCalls,
  };
}
