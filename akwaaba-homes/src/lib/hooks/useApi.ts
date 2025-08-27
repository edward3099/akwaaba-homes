import { useState, useCallback } from 'react';
import { useApiClient, ApiResponse } from '@/lib/api/apiClient';

// Hook for managing API calls with loading states and error handling
export function useApi<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  // Generic API call wrapper
  const callApi = useCallback(async <R = T>(
    apiCall: () => Promise<ApiResponse<R>>
  ): Promise<ApiResponse<R> | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data as T);
        return response;
      } else {
        setError(response.error || 'API call failed');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    clearError,
    reset,
  };
}

// Specialized hooks for common API operations
export function useProperties() {
  const { apiClient, executeRequest, isLoading, error, data, clearError, reset } = useApiClient();

  const getProperties = useCallback(async (filters?: Record<string, unknown>) => {
    return executeRequest(() => apiClient.getProperties(filters));
  }, [executeRequest, apiClient]);

  const getFeaturedProperties = useCallback(async (limit: number) => {
    return executeRequest(() => apiClient.getFeaturedProperties(limit));
  }, [executeRequest, apiClient]);

  const getPropertyById = useCallback(async (id: string) => {
    return executeRequest(() => apiClient.getPropertyById(id));
  }, [executeRequest, apiClient]);

  const searchProperties = useCallback(async (filters: Record<string, unknown>) => {
    return executeRequest(() => apiClient.searchProperties(filters));
  }, [executeRequest, apiClient]);

  return {
    loading: isLoading,
    error,
    data,
    getProperties,
    getFeaturedProperties,
    getPropertyById,
    searchProperties,
    clearError,
    reset,
  };
}

// Hook for making custom HTTP requests
export function useHttpRequest() {
  const { loading, error, data, callApi, clearError, reset } = useApi();

  const request = useCallback(async <T = unknown>(
    url: string,
    options: RequestInit = {}
  ) => {
    return callApi(() => apiClient.request<T>(url, options));
  }, [callApi]);

  return {
    loading,
    error,
    data,
    request,
    clearError,
    reset,
  };
}
