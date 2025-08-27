import { createClient } from '@supabase/supabase-js';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Base API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        details: data.details,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Authentication API client
export const authApi = {
  signUp: async (email: string, password: string, userData: any) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
  },

  signIn: async (email: string, password: string) => {
    return apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signOut: async () => {
    return apiRequest('/auth/signout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/user');
  },
};

// Properties API client
export const propertiesApi = {
  getFeatured: async (limit: number = 6) => {
    return apiRequest(`/properties/featured?limit=${limit}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/properties/${id}`);
  },

  search: async (params: any) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiRequest(`/properties/search?${searchParams.toString()}`);
  },

  uploadImage: async (propertyId: string, file: File, caption?: string, isPrimary?: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (isPrimary !== undefined) formData.append('is_primary', isPrimary.toString());

    return apiRequest(`/properties/${propertyId}/images/upload`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

// Admin API client
export const adminApi = {
  users: {
    list: async (params: any = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest(`/admin/users?${searchParams.toString()}`);
    },

    getById: async (id: string) => {
      return apiRequest(`/admin/users/${id}`);
    },

    create: async (userData: any) => {
      return apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    update: async (id: string, updates: any) => {
      return apiRequest(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  properties: {
    getPendingApproval: async (params: any = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest(`/admin/properties/approval?${searchParams.toString()}`);
    },

    approve: async (propertyId: string, approvalData: any) => {
      return apiRequest(`/admin/properties/approval`, {
        method: 'POST',
        body: JSON.stringify({ property_id: propertyId, ...approvalData }),
      });
    },
  },

  analytics: {
    getDashboard: async (params: any = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest(`/admin/analytics?${searchParams.toString()}`);
    },
  },
};

// Seller API client
export const sellerApi = {
  properties: {
    list: async (params: any = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest(`/seller/properties?${searchParams.toString()}`);
    },

    getById: async (id: string) => {
      return apiRequest(`/seller/properties/${id}`);
    },

    create: async (propertyData: any) => {
      return apiRequest('/seller/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
    },

    update: async (id: string, updates: any) => {
      return apiRequest(`/seller/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  inquiries: {
    list: async (params: any = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      
      return apiRequest(`/seller/inquiries?${searchParams.toString()}`);
    },

    respond: async (inquiryId: string, responseData: any) => {
      return apiRequest('/seller/inquiries', {
        method: 'POST',
        body: JSON.stringify({ inquiry_id: inquiryId, ...responseData }),
      });
    },
  },
};

// Export the main API client
export const apiClient = {
  auth: authApi,
  properties: propertiesApi,
  admin: adminApi,
  seller: sellerApi,
};

export default apiClient;
