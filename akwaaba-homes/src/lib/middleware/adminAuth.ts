import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'super_admin' | 'moderator';
  is_verified: boolean;
  permissions: string[];
}

export interface AdminAuthContext {
  user: AdminUser;
  supabase: any;
}

/**
 * Middleware to authenticate admin users and validate permissions
 */
export async function authenticateAdmin(request: NextRequest): Promise<AdminAuthContext | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_role, verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Check if user is an admin type
    if (!['admin', 'super_admin', 'moderator'].includes(profile.user_role)) {
      return null;
    }

    // Check if user is verified
    if (profile.verification_status !== 'verified') {
      return null;
    }

    // Get user permissions based on role
    const permissions = await getUserPermissions(profile.user_role, supabase);

    const adminUser: AdminUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      user_type: profile.user_role,
      is_verified: profile.verification_status === 'verified',
      permissions
    };

    return { user: adminUser, supabase };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

/**
 * Get user permissions based on their role
 */
async function getUserPermissions(userType: string, supabase: any): Promise<string[]> {
  const basePermissions = [
    'read:users',
    'read:properties',
    'read:analytics'
  ];

  switch (userType) {
    case 'super_admin':
      return [
        ...basePermissions,
        'write:users',
        'delete:users',
        'write:properties',
        'delete:properties',
        'write:system_config',
        'read:admin_logs',
        'write:admin_logs',
        'manage:roles',
        'manage:permissions'
      ];
    
    case 'admin':
      return [
        ...basePermissions,
        'write:users',
        'write:properties',
        'delete:properties',
        'write:system_config',
        'read:admin_logs'
      ];
    
    case 'moderator':
      return [
        ...basePermissions,
        'write:properties',
        'read:admin_logs'
      ];
    
    default:
      return basePermissions;
  }
}

/**
 * Check if admin user has specific permission
 */
export function hasPermission(user: AdminUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if admin user has any of the specified permissions
 */
export function hasAnyPermission(user: AdminUser, permissions: string[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Check if admin user has all of the specified permissions
 */
export function hasAllPermissions(user: AdminUser, permissions: string[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

/**
 * Create admin authentication decorator for API routes
 */
export function requireAdmin(requiredPermissions: string[] = []) {
  return async function(request: NextRequest): Promise<AdminAuthContext | NextResponse> {
    const authContext = await authenticateAdmin(request);
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Check required permissions if specified
    if (requiredPermissions.length > 0) {
      if (!hasAllPermissions(authContext.user, requiredPermissions)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return authContext;
  };
}

/**
 * Create role-based access control decorator
 */
export function requireRole(allowedRoles: string[]) {
  return async function(request: NextRequest): Promise<AdminAuthContext | NextResponse> {
    const authContext = await authenticateAdmin(request);
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(authContext.user.user_type)) {
      return NextResponse.json(
        { error: 'Forbidden - Role access denied' },
        { status: 403 }
      );
    }

    return authContext;
  };
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  supabase: any,
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: any
) {
  try {
    await supabase
      .from('admin_logs')
      .insert([
        {
          admin_id: userId,
          action,
          resource,
          resource_id: resourceId,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

