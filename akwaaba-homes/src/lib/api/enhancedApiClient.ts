import { supabase } from '@/lib/supabase';

// Enhanced API Response Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
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

// Base API client with common functionality
class BaseApiClient {
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `/api${endpoint}`;
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
          message: data.message,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        timestamp: new Date().toISOString(),
        pagination: data.pagination,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  protected async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      };
    }

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
  }
}

// Properties API Client
export class PropertiesApiClient extends BaseApiClient {
  async getProperties(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.request(`/properties${queryParams}`);
  }

  async getPropertyById(id: string): Promise<ApiResponse> {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: string, propertyData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async searchProperties(filters: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return this.request(`/properties/search?${queryParams}`);
  }

  async getFeaturedProperties(limit: number = 6): Promise<ApiResponse> {
    return this.request(`/properties/featured?limit=${limit}`);
  }
}

// Admin API Client
export class AdminApiClient extends BaseApiClient {
  async getUsers(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.authenticatedRequest(`/admin/users${queryParams}`);
  }

  async getUserById(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/admin/users/${id}`);
  }

  async updateUser(id: string, userData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async bulkUserActions(actions: unknown[]): Promise<ApiResponse> {
    return this.authenticatedRequest('/admin/users/bulk-actions', {
      method: 'POST',
      body: JSON.stringify({ actions }),
    });
  }

  async getProperties(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.authenticatedRequest(`/admin/properties${queryParams}`);
  }

  async getPropertiesForApproval(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.authenticatedRequest(`/admin/properties/approval${queryParams}`);
  }

  async approveProperty(id: string, approvalData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest(`/admin/properties/approval`, {
      method: 'POST',
      body: JSON.stringify({ propertyId: id, ...(approvalData as Record<string, any>) }),
    });
  }

  async bulkPropertyApproval(approvals: unknown[]): Promise<ApiResponse> {
    return this.authenticatedRequest('/admin/properties/approval/bulk', {
      method: 'POST',
      body: JSON.stringify({ approvals }),
    });
  }

  async getAnalytics(timeRange: string = '7d', filters?: Record<string, unknown>): Promise<ApiResponse> {
    return this.authenticatedRequest('/admin/analytics', {
      method: 'POST',
      body: JSON.stringify({ timeRange, filters }),
    });
  }

  async getSystemConfig(): Promise<ApiResponse> {
    return this.authenticatedRequest('/admin/system/config');
  }

  async updateSystemConfig(configData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/admin/system/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }
}

// Seller API Client
export class SellerApiClient extends BaseApiClient {
  async getMyProperties(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.authenticatedRequest(`/seller/properties${queryParams}`);
  }

  async getMyPropertyById(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/seller/properties/${id}`);
  }

  async createMyProperty(propertyData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/seller/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateMyProperty(id: string, propertyData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest(`/seller/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteMyProperty(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/seller/properties/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyInquiries(filters?: Record<string, unknown>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters as Record<string, string>)}` : '';
    return this.authenticatedRequest(`/seller/inquiries${queryParams}`);
  }

  async getMyInquiryById(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/seller/inquiries/${id}`);
  }

  async updateInquiry(id: string, inquiryData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest(`/seller/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inquiryData),
    });
  }

  async getMyAnalytics(timeRange: string = '7d', filters?: Record<string, unknown>): Promise<ApiResponse> {
    return this.authenticatedRequest('/seller/analytics', {
      method: 'POST',
      body: JSON.stringify({ timeRange, filters }),
    });
  }

  async sendMessage(messageData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/seller/communication', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async sendBulkMessage(bulkMessageData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/seller/communication/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkMessageData),
    });
  }
}

// CDN API Client
export class CDNApiClient extends BaseApiClient {
  async uploadFile(uploadData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/cdn/manage', {
      method: 'POST',
      body: JSON.stringify({ action: 'upload', ...(uploadData as Record<string, any>) }),
    });
  }

  async preloadAssets(assets: unknown[]): Promise<ApiResponse> {
    return this.authenticatedRequest('/cdn/manage', {
      method: 'POST',
      body: JSON.stringify({ action: 'preload', assets }),
    });
  }

  async warmUpCache(warmupData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/cdn/manage', {
      method: 'POST',
      body: JSON.stringify({ action: 'warmup', ...(warmupData as Record<string, any>) }),
    });
  }

  async getMetrics(bucketName: string, timeRange: string = '24h'): Promise<ApiResponse> {
    return this.authenticatedRequest(`/cdn/manage?bucket=${bucketName}&action=metrics&timeRange=${timeRange}`);
  }

  async optimizeSettings(bucketName: string): Promise<ApiResponse> {
    return this.authenticatedRequest(`/cdn/manage?bucket=${bucketName}&action=optimize`);
  }
}

// Image Optimization API Client
export class ImageOptimizationApiClient extends BaseApiClient {
  async optimizeImage(optimizationData: unknown): Promise<ApiResponse> {
    return this.authenticatedRequest('/images/optimize', {
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  }

  async getOptimizedImage(params: Record<string, string>): Promise<ApiResponse> {
    const queryParams = new URLSearchParams(params);
    return this.request(`/images/optimize?${queryParams}`);
  }

  async getImageVariants(bucketName: string, imagePath: string, variant: string): Promise<ApiResponse> {
    return this.authenticatedRequest('/images/optimize', {
      method: 'POST',
      body: JSON.stringify({ bucketName, imagePath, variant }),
    });
  }

  async getResponsiveImages(bucketName: string, imagePath: string): Promise<ApiResponse> {
    return this.authenticatedRequest('/images/optimize', {
      method: 'POST',
      body: JSON.stringify({ bucketName, imagePath, responsive: true }),
    });
  }
}

// Security Testing API Client
export class SecurityTestingApiClient extends BaseApiClient {
  async testSecurityHeaders(): Promise<ApiResponse> {
    return this.request('/test-security-headers');
  }

  async testRateLimit(): Promise<ApiResponse> {
    return this.request('/test-rate-limit');
  }

  async testInputValidation(validationData: unknown): Promise<ApiResponse> {
    return this.request('/test-input-validation', {
      method: 'POST',
      body: JSON.stringify(validationData),
    });
  }

  async testRLSPolicies(): Promise<ApiResponse> {
    return this.request('/test-rls-policies');
  }

  async testSQLInjection(testData: unknown): Promise<ApiResponse> {
    return this.request('/test-sql-injection', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  async testXSSProtection(testData: unknown): Promise<ApiResponse> {
    return this.request('/test-xss-protection', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }
}

// Main Enhanced API Client
export class EnhancedApiClient {
  public properties: PropertiesApiClient;
  public admin: AdminApiClient;
  public seller: SellerApiClient;
  public cdn: CDNApiClient;
  public images: ImageOptimizationApiClient;
  public security: SecurityTestingApiClient;

  constructor() {
    this.properties = new PropertiesApiClient();
    this.admin = new AdminApiClient();
    this.seller = new SellerApiClient();
    this.cdn = new CDNApiClient();
    this.images = new ImageOptimizationApiClient();
    this.security = new SecurityTestingApiClient();
  }

  // Utility method for checking authentication status
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Utility method for getting current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Utility method for getting user role
  async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    return userData?.user_type || null;
  }

  // Utility method for checking if user has specific role
  async hasRole(role: string): Promise<boolean> {
    const userRole = await this.getUserRole();
    return userRole === role;
  }

  // Utility method for checking if user is admin
  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  }

  // Utility method for checking if user is seller
  async isSeller(): Promise<boolean> {
    return this.hasRole('seller');
  }
}

// Export singleton instance
export const enhancedApiClient = new EnhancedApiClient();

// Export individual clients for specific use cases
export const propertiesApi = enhancedApiClient.properties;
export const adminApi = enhancedApiClient.admin;
export const sellerApi = enhancedApiClient.seller;
export const cdnApi = enhancedApiClient.cdn;
export const imagesApi = enhancedApiClient.images;
export const securityApi = enhancedApiClient.security;


















