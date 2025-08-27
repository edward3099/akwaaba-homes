import { propertyService } from '@/lib/services/propertyService';
import { useState, useCallback, useMemo } from 'react';

// API Response Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Main API Client Class - Simplified for Task 4
export class ApiClient {
  // Property Management - Core functionality for Task 4
  async getProperties(filters?: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const result = await propertyService.getProperties(filters);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getPropertyById(id: string): Promise<ApiResponse> {
    try {
      const result = await propertyService.getPropertyById(id);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getFeaturedProperties(limit: number): Promise<ApiResponse> {
    try {
      const result = await propertyService.getFeaturedProperties(limit);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch featured properties',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async searchProperties(filters: Record<string, unknown>): Promise<ApiResponse> {
    try {
      const result = await propertyService.searchProperties(filters);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search properties',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Utility method for making HTTP requests
  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Hook for using the API client
export const useApiClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const apiClient = useMemo(() => new ApiClient(), []);

  const executeRequest = useCallback(async <T>(
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await requestFn();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Request failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new ApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    apiClient,
    executeRequest,
    isLoading,
    error,
    data,
    clearError,
    reset,
  };
};
