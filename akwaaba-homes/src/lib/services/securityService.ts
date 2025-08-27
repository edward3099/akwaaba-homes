import { supabase } from '@/lib/supabase';

export interface RateLimitInfo {
  current_count: number;
  max_requests: number;
  remaining_requests: number;
  retry_after?: string;
}

export interface ValidationSchema {
  schema_name: string;
  schema_type: string;
  schema_definition: {
    fields: Record<string, {
      type: string;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      minimum?: number;
      maximum?: number;
      pattern?: string;
      enum?: string[];
    }>;
  };
  is_active: boolean;
  version: string;
}

export interface ValidationResult {
  is_valid: boolean;
  error_messages: string[];
  validation_time_ms: number;
  schema_name: string;
}

export interface SanitizationResult {
  original_data: any;
  sanitized_data: any;
  validation_result: ValidationResult;
}

export interface PrivacySettings {
  user_id: string;
  data_sharing_enabled: boolean;
  marketing_emails_enabled: boolean;
  analytics_tracking_enabled: boolean;
  third_party_sharing_enabled: boolean;
  data_retention_days: number;
  gdpr_compliant: boolean;
  ccpa_compliant: boolean;
  data_processing_consent: boolean;
  consent_date?: string;
  consent_version: string;
}

export interface DataExportRequest {
  export_request_id: string;
  status: string;
  expires_at: string;
  message: string;
}

export interface DataDeletionRequest {
  deletion_request_id: string;
  status: string;
  anonymization_enabled: boolean;
  message: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_id?: string;
  ip_address?: string;
  event_data: Record<string, any>;
  resolved: boolean;
  created_at: string;
}

export interface ComplianceReport {
  report_period_days: number;
  gdpr_compliance: {
    total_users: number;
    consent_given: number;
    consent_rate: number;
    data_export_requests: number;
    data_deletion_requests: number;
  };
  ccpa_compliance: {
    total_users: number;
    data_sharing_disabled: number;
    third_party_sharing_disabled: number;
    data_export_requests: number;
    data_deletion_requests: number;
  };
  data_access_logs: {
    total_accesses: number;
    accesses_by_type: Record<string, number>;
    sensitive_accesses: number;
  };
  data_retention: {
    policies_count: number;
    auto_delete_enabled: number;
    anonymization_enabled: number;
  };
}

export class SecurityService {
  private static instance: SecurityService;
  private supabase: typeof supabase;
  private rateLimitCache: Map<string, RateLimitInfo> = new Map();

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Check rate limits for API endpoints
   */
  async checkRateLimit(
    endpoint: string,
    maxRequests: number = 100,
    windowMinutes: number = 1
  ): Promise<{ success: boolean; data?: RateLimitInfo; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id || null;
      
      // Get client IP (this would typically come from your API middleware)
      const ipAddress = await this.getClientIP();
      
      const { data, error } = await this.supabase
        .rpc('check_rate_limit', {
          p_user_id: userId,
          p_ip_address: ipAddress,
          p_endpoint: endpoint,
          p_max_requests: maxRequests,
          p_window_minutes: windowMinutes
        });

      if (error) {
        throw new Error(`Rate limit check failed: ${error.message}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Rate limit exceeded'
        };
      }

      const rateLimitInfo: RateLimitInfo = {
        current_count: data.data.current_count,
        max_requests: data.data.max_requests,
        remaining_requests: data.data.remaining_requests,
        retry_after: data.data.retry_after
      };

      // Cache rate limit info
      this.rateLimitCache.set(endpoint, rateLimitInfo);

      return {
        success: true,
        data: rateLimitInfo
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Log API request for audit purposes
   */
  async logApiRequest(
    endpoint: string,
    method: string,
    requestHeaders: Record<string, any> = {},
    requestBody: any = {},
    responseStatus?: number,
    responseTimeMs?: number,
    errorMessage?: string
  ): Promise<{ success: boolean; log_id?: string; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id || null;
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const { data, error } = await this.supabase
        .rpc('log_api_request', {
          p_user_id: userId,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
          p_endpoint: endpoint,
          p_method: method,
          p_request_headers: requestHeaders,
          p_request_body: requestBody,
          p_response_status: responseStatus,
          p_response_time_ms: responseTimeMs,
          p_error_message: errorMessage
        });

      if (error) {
        throw new Error(`API request logging failed: ${error.message}`);
      }

      return {
        success: true,
        log_id: data.data.log_id
      };
    } catch (error) {
      console.error('Error logging API request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate data against a schema
   */
  async validateData(
    schemaName: string,
    inputData: any
  ): Promise<{ success: boolean; data?: ValidationResult; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id || null;

      const { data, error } = await this.supabase
        .rpc('validate_data', {
          p_schema_name: schemaName,
          p_input_data: inputData,
          p_user_id: userId
        });

      if (error) {
        throw new Error(`Data validation failed: ${error.message}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Validation failed'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error validating data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sanitize data based on field type
   */
  async sanitizeData(
    inputData: any,
    fieldType: string = 'text'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('sanitize_data', {
          p_input_data: inputData,
          p_field_type: fieldType
        });

      if (error) {
        throw new Error(`Data sanitization failed: ${error.message}`);
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error sanitizing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate and sanitize data in one operation
   */
  async validateAndSanitizeData(
    schemaName: string,
    inputData: any
  ): Promise<{ success: boolean; data?: SanitizationResult; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id || null;

      const { data, error } = await this.supabase
        .rpc('validate_and_sanitize_data', {
          p_schema_name: schemaName,
          p_input_data: inputData,
          p_user_id: userId
        });

      if (error) {
        throw new Error(`Validation and sanitization failed: ${error.message}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Validation and sanitization failed'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error validating and sanitizing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user privacy settings
   */
  async getPrivacySettings(): Promise<{ success: boolean; data?: PrivacySettings; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('get_user_privacy_settings', { p_user_id: user.id });

      if (error) {
        throw new Error(`Failed to get privacy settings: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user privacy settings
   */
  async updatePrivacySettings(
    settings: Partial<PrivacySettings>
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('update_privacy_settings', {
          p_user_id: user.id,
          p_settings: settings
        });

      if (error) {
        throw new Error(`Failed to update privacy settings: ${error.message}`);
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Request data export (GDPR/CCPA compliance)
   */
  async requestDataExport(
    requestType: 'gdpr' | 'ccpa' | 'user_request',
    requestedDataTypes?: string[],
    exportFormat: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<{ success: boolean; data?: DataExportRequest; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('request_data_export', {
          p_user_id: user.id,
          p_request_type: requestType,
          p_requested_data_types: requestedDataTypes,
          p_export_format: exportFormat
        });

      if (error) {
        throw new Error(`Failed to request data export: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error requesting data export:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Request data deletion (GDPR/CCPA compliance)
   */
  async requestDataDeletion(
    requestType: 'gdpr_right_to_be_forgotten' | 'ccpa_deletion' | 'user_request',
    deletionScope?: string[],
    anonymizationEnabled: boolean = true
  ): Promise<{ success: boolean; data?: DataDeletionRequest; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('request_data_deletion', {
          p_user_id: user.id,
          p_request_type: requestType,
          p_deletion_scope: deletionScope,
          p_anonymization_enabled: anonymizationEnabled
        });

      if (error) {
        throw new Error(`Failed to request data deletion: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get security events summary
   */
  async getSecurityEventsSummary(
    days: number = 7
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_security_events_summary', { p_days: days });

      if (error) {
        throw new Error(`Failed to get security events summary: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error getting security events summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(
    days: number = 30
  ): Promise<{ success: boolean; data?: ComplianceReport; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_compliance_report', { p_days: days });

      if (error) {
        throw new Error(`Failed to get compliance report: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error getting compliance report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStatistics(
    days: number = 7
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_rate_limit_statistics', { p_days: days });

      if (error) {
        throw new Error(`Failed to get rate limit statistics: ${error.message}`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error getting rate limit statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Resolve security event
   */
  async resolveSecurityEvent(
    eventId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await this.supabase
        .rpc('resolve_security_event', {
          p_event_id: eventId,
          p_resolved_by: user.id
        });

      if (error) {
        throw new Error(`Failed to resolve security event: ${error.message}`);
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Error resolving security event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get client IP address (placeholder - would be implemented in your API)
   */
  private async getClientIP(): Promise<string> {
    // This is a placeholder - in a real application, the client IP
    // would be determined by your API middleware or server
    try {
      // You could use a service like ipify.org to get the client's public IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback to a placeholder IP
      return '127.0.0.1';
    }
  }

  /**
   * Sanitize input data on the client side
   */
  sanitizeInput(input: string, type: 'text' | 'email' | 'phone' | 'url'): string {
    switch (type) {
      case 'text':
        // Remove HTML tags and dangerous content
        return input
          .replace(/<[^>]*>/g, '')
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '')
          .trim();

      case 'email':
        // Basic email sanitization
        return input.toLowerCase().trim();

      case 'phone':
        // Remove non-digit characters except + at the beginning
        return input.replace(/[^\d+]/g, '');

      case 'url':
        // Ensure protocol is present
        if (!input.match(/^https?:\/\//)) {
          return `https://${input}`;
        }
        return input;

      default:
        return input;
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate URL format
   */
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has admin privileges
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await this.supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error || !data) return false;
      return data.user_type === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    eventData: Record<string, any> = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id || null;
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const { error } = await this.supabase
        .from('security_events')
        .insert({
          event_type: eventType,
          severity,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          event_data: eventData
        });

      if (error) {
        throw new Error(`Failed to log security event: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error logging security event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
export default securityService;
