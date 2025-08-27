import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  user_type: 'admin' | 'seller' | 'agent';
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  full_name?: string;
  phone?: string;
  verification_status?: string;
  subscription_tier?: string;
  is_verified?: boolean;
}

export interface AdminUserDetails extends AdminUser {
  profile: {
    full_name?: string;
    phone?: string;
    verification_status?: string;
    subscription_tier?: string;
    is_verified?: boolean;
    bio?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  };
  properties: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
  inquiries: Array<{
    id: string;
    property_id: string;
    status: string;
    created_at: string;
  }>;
}

export interface PropertyApproval {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  status: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  moderation_notes?: string;
  seller_email: string;
  seller_type: string;
  seller_name?: string;
  seller_phone?: string;
  seller_verification_status?: string;
}

export interface ApprovalStatistics {
  total_properties: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  under_review: number;
  approval_rate: number;
  recent_approvals: Array<{
    property_id: string;
    title: string;
    action: string;
    admin_id: string;
    created_at: string;
  }>;
  approval_timeline: Array<{
    date: string;
    approved: number;
    rejected: number;
    requested_changes: number;
  }>;
}

export interface PlatformAnalytics {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  overview: {
    total_users: number;
    total_properties: number;
    total_inquiries: number;
    total_revenue: number;
  };
  user_analytics: {
    new_users: number;
    active_users: number;
    user_growth_rate: number;
    user_types_distribution: Record<string, number>;
  };
  property_analytics: {
    new_properties: number;
    properties_by_status: Record<string, number>;
    properties_by_type: Record<string, number>;
    price_distribution: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  };
  engagement_analytics: {
    total_views: number;
    total_inquiries: number;
    inquiry_response_rate: number;
    popular_properties: Array<{
      id: string;
      title: string;
      views: number;
      inquiries: number;
    }>;
  };
  financial_analytics: {
    total_property_value: number;
    average_property_price: number;
    revenue_by_month: Array<{
      month: string;
      revenue: number;
    }>;
  };
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: string;
  description: string;
  is_public: boolean;
  is_editable: boolean;
  validation_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemConfigHistory {
  id: string;
  setting_key: string;
  old_value?: string;
  new_value?: string;
  changed_by: string;
  change_reason?: string;
  created_at: string;
  admin_email?: string;
  admin_type?: string;
}

export interface SystemHealth {
  success: boolean;
  timestamp: string;
  health_status: string;
  metrics: {
    database_connections: number;
    database_size_mb: number;
    table_counts: {
      users: number;
      properties: number;
      inquiries: number;
      analytics: number;
    };
    recent_errors: Array<{
      timestamp: string;
      error: string;
    }>;
    system_uptime: number;
  };
}

export class AdminService {
  private static instance: AdminService;
  private supabase: typeof supabase;

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  /**
   * Check if current user is admin
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

  // ===== USER MANAGEMENT =====

  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(
    limit: number = 20,
    offset: number = 0,
    search?: string,
    userType?: string,
    status?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC'
  ): Promise<{ success: boolean; data: AdminUser[]; pagination: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_all_users_admin', {
          p_limit: limit,
          p_offset: offset,
          p_search: search,
          p_user_type: userType,
          p_status: status,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        });

      if (error) {
        throw new Error(`Failed to get users: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(userId: string): Promise<{ success: boolean; data: AdminUserDetails }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_details_admin', { p_user_id: userId });

      if (error) {
        throw new Error(`Failed to get user details: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting user details:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    updates: Record<string, any>
  ): Promise<{ success: boolean; data: AdminUserDetails }> {
    try {
      const { data, error } = await this.supabase
        .rpc('update_user_admin', {
          p_user_id: userId,
          p_updates: updates
        });

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Toggle user status (suspend/activate)
   */
  async toggleUserStatus(
    userId: string,
    action: 'suspend' | 'activate'
  ): Promise<{ success: boolean; data: AdminUserDetails }> {
    try {
      const { data, error } = await this.supabase
        .rpc('toggle_user_status_admin', {
          p_user_id: userId,
          p_action: action
        });

      if (error) {
        throw new Error(`Failed to toggle user status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message: string; deleted_user_id: string }> {
    try {
      const { data, error } = await this.supabase
        .rpc('delete_user_admin', { p_user_id: userId });

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_statistics_admin');

      if (error) {
        throw new Error(`Failed to get user statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // ===== PROPERTY APPROVAL =====

  /**
   * Get properties pending approval
   */
  async getPendingApprovals(
    limit: number = 20,
    offset: number = 0,
    status: string = 'pending',
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC'
  ): Promise<{ success: boolean; data: PropertyApproval[]; pagination: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_pending_approvals_admin', {
          p_limit: limit,
          p_offset: offset,
          p_status: status,
          p_sort_by: sortBy,
          p_sort_order: sortOrder
        });

      if (error) {
        throw new Error(`Failed to get pending approvals: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  }

  /**
   * Approve property
   */
  async approveProperty(
    propertyId: string,
    notes?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('approve_property_admin', {
          p_property_id: propertyId,
          p_admin_id: user.id,
          p_notes: notes
        });

      if (error) {
        throw new Error(`Failed to approve property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error approving property:', error);
      throw error;
    }
  }

  /**
   * Reject property
   */
  async rejectProperty(
    propertyId: string,
    rejectionReason: string,
    notes?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('reject_property_admin', {
          p_property_id: propertyId,
          p_admin_id: user.id,
          p_rejection_reason: rejectionReason,
          p_notes: notes
        });

      if (error) {
        throw new Error(`Failed to reject property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error rejecting property:', error);
      throw error;
    }
  }

  /**
   * Request property changes
   */
  async requestPropertyChanges(
    propertyId: string,
    notes: string,
    changesRequired: Record<string, any> = {}
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('request_property_changes_admin', {
          p_property_id: propertyId,
          p_admin_id: user.id,
          p_notes: notes
        });

      if (error) {
        throw new Error(`Failed to request property changes: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error requesting property changes:', error);
      throw error;
    }
  }

  /**
   * Get approval statistics
   */
  async getApprovalStatistics(): Promise<{ success: boolean; data: ApprovalStatistics }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_approval_statistics_admin');

      if (error) {
        throw new Error(`Failed to get approval statistics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting approval statistics:', error);
      throw error;
    }
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(
    period: string = 'monthly',
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; data: PlatformAnalytics }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_platform_analytics_admin', {
          p_period: period,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) {
        throw new Error(`Failed to get platform analytics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(
    reportType: string,
    filters: Record<string, any> = {},
    groupBy?: string,
    sortBy: string = 'created_at',
    sortOrder: string = 'DESC',
    limit: number = 1000
  ): Promise<{ success: boolean; report_type: string; filters: any; data: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('generate_custom_report_admin', {
          p_report_type: reportType,
          p_filters: filters,
          p_group_by: groupBy,
          p_sort_by: sortBy,
          p_sort_order: sortOrder,
          p_limit: limit
        });

      if (error) {
        throw new Error(`Failed to generate report: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard metrics
   */
  async getRealtimeMetrics(): Promise<{ success: boolean; timestamp: string; metrics: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_realtime_dashboard_metrics_admin');

      if (error) {
        throw new Error(`Failed to get real-time metrics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  // ===== SYSTEM CONFIGURATION =====

  /**
   * Get system settings
   */
  async getSystemSettings(
    category?: string,
    includePublic: boolean = true
  ): Promise<{ success: boolean; data: SystemSetting[] }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_system_settings_admin', {
          p_category: category,
          p_include_public: includePublic
        });

      if (error) {
        throw new Error(`Failed to get system settings: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting system settings:', error);
      throw error;
    }
  }

  /**
   * Update system setting
   */
  async updateSystemSetting(
    settingKey: string,
    newValue: string,
    changeReason?: string
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('update_system_setting_admin', {
          p_setting_key: settingKey,
          p_new_value: newValue,
          p_admin_id: user.id,
          p_change_reason: changeReason
        });

      if (error) {
        throw new Error(`Failed to update system setting: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  }

  /**
   * Get system configuration history
   */
  async getSystemConfigHistory(
    settingKey?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; data: SystemConfigHistory[]; pagination: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_system_config_history_admin', {
          p_setting_key: settingKey,
          p_limit: limit,
          p_offset: offset
        });

      if (error) {
        throw new Error(`Failed to get config history: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting config history:', error);
      throw error;
    }
  }

  /**
   * Reset system setting to default
   */
  async resetSystemSetting(
    settingKey: string,
    changeReason: string = 'Reset to default value'
  ): Promise<{ success: boolean; data: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .rpc('reset_system_setting_admin', {
          p_setting_key: settingKey,
          p_admin_id: user.id,
          p_change_reason: changeReason
        });

      if (error) {
        throw new Error(`Failed to reset system setting: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error resetting system setting:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{ success: boolean; data: SystemHealth }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_system_health_admin');

      if (error) {
        throw new Error(`Failed to get system health: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance();
export default adminService;
