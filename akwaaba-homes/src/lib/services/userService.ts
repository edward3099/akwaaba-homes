import { supabase } from '../supabase';
import { 
  DatabaseUser, 
  UserWithDetails, 
  UpdateUserForm,
  UserRole,
  ApiResponse 
} from '../types/database';

export class UserService {
  // Get current authenticated user
  static async getCurrentUser(): Promise<ApiResponse<DatabaseUser>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseUser,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Not authenticated',
        success: false
      };
    }
  }

  // Get user by ID (admin only)
  static async getUserById(id: string): Promise<ApiResponse<DatabaseUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseUser,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<ApiResponse<DatabaseUser[]>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get users by role (admin only)
  static async getUsersByRole(role: UserRole): Promise<ApiResponse<DatabaseUser[]>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', role)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Update user profile
  static async updateUserProfile(id: string, updates: UpdateUserForm): Promise<ApiResponse<DatabaseUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseUser,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Update user verification status (admin only)
  static async updateVerificationStatus(id: string, status: 'verified' | 'rejected', adminNotes?: string): Promise<ApiResponse<DatabaseUser>> {
    try {
      const updates: Partial<DatabaseUser> = { 
        verification_status: status,
        is_verified: status === 'verified'
      };

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseUser,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Update user subscription tier (admin only)
  static async updateSubscriptionTier(id: string, tier: 'basic' | 'pro' | 'enterprise'): Promise<ApiResponse<DatabaseUser>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        data: data as DatabaseUser,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Get user statistics (admin only)
  static async getUserStats(): Promise<ApiResponse<{
    total: number;
    admins: number;
    sellers: number;
    agents: number;
    verified: number;
    pendingVerification: number;
    newThisMonth: number;
  }>> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        throw error;
      }

      const total = users?.length || 0;
      const admins = users?.filter(u => u.user_type === 'admin').length || 0;
      const sellers = users?.filter(u => u.user_type === 'seller').length || 0;
      const agents = users?.filter(u => u.user_type === 'agent').length || 0;
      const verified = users?.filter(u => u.is_verified).length || 0;
      const pendingVerification = users?.filter(u => u.verification_status === 'pending').length || 0;

      // Calculate new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const newThisMonth = users?.filter(u => new Date(u.created_at) >= thisMonth).length || 0;

      return {
        data: {
          total,
          admins,
          sellers,
          agents,
          verified,
          pendingVerification,
          newThisMonth
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Search users (admin only)
  static async searchUsers(searchTerm: string): Promise<ApiResponse<DatabaseUser[]>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Delete user (admin only)
  static async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Check if user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.user_type === 'admin';
    } catch (error) {
      return false;
    }
  }

  // Check if user is seller or agent
  static async isSellerOrAgent(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.user_type === 'seller' || data.user_type === 'agent';
    } catch (error) {
      return false;
    }
  }
}
