import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SellerUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'seller' | 'agent';
  is_verified: boolean;
  is_active: boolean;
  company_name?: string;
  phone?: string;
  bio?: string;
  profile_image_url?: string;
  permissions: string[];
}

export interface SellerAuthContext {
  user: SellerUser;
  supabase: any;
}

/**
 * Middleware to authenticate seller users and validate permissions
 */
export async function authenticateSeller(request: NextRequest): Promise<SellerAuthContext | null> {
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
      .from('users')
      .select('id, email, full_name, user_type, is_verified, is_active, company_name, phone, bio, profile_image_url')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Check if user is a seller type
    if (!['seller', 'agent'].includes(profile.user_type)) {
      return null;
    }

    // Check if user is verified and active
    if (!profile.is_verified || !profile.is_active) {
      return null;
    }

    // Get user permissions based on role
    const permissions = await getSellerPermissions(profile.user_type, supabase);

    const sellerUser: SellerUser = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      is_verified: profile.is_verified,
      is_active: profile.is_active,
      company_name: profile.company_name,
      phone: profile.phone,
      bio: profile.bio,
      profile_image_url: profile.profile_image_url,
      permissions
    };

    return { user: sellerUser, supabase };
  } catch (error) {
    console.error('Seller authentication error:', error);
    return null;
  }
}

/**
 * Get seller permissions based on their role
 */
async function getSellerPermissions(userType: string, supabase: any): Promise<string[]> {
  const basePermissions = [
    'read:own_properties',
    'write:own_properties',
    'read:own_inquiries',
    'write:own_inquiries',
    'read:own_analytics'
  ];

  switch (userType) {
    case 'seller':
      return [
        ...basePermissions,
        'create:properties',
        'update:own_properties',
        'delete:own_properties',
        'manage:own_images',
        'view:own_statistics',
        'manage:own_profile'
      ];
    
    case 'agent':
      return [
        ...basePermissions,
        'create:properties',
        'update:own_properties',
        'manage:own_images',
        'view:own_statistics',
        'manage:own_profile',
        'limited:property_deletion' // Agents can't delete properties
      ];
    
    default:
      return basePermissions;
  }
}

/**
 * Check if seller user has specific permission
 */
export function hasSellerPermission(user: SellerUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if seller user has any of the specified permissions
 */
export function hasAnySellerPermission(user: SellerUser, permissions: string[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Check if seller user has all of the specified permissions
 */
export function hasAllSellerPermissions(user: SellerUser, permissions: string[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission));
}

/**
 * Create seller authentication decorator for API routes
 */
export function requireSeller(requiredPermissions: string[] = []) {
  return async function(request: NextRequest): Promise<SellerAuthContext | NextResponse> {
    const authContext = await authenticateSeller(request);
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Seller access required' },
        { status: 401 }
      );
    }

    // Check required permissions if specified
    if (requiredPermissions.length > 0) {
      if (!hasAllSellerPermissions(authContext.user, requiredPermissions)) {
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
 * Create role-based access control decorator for sellers
 */
export function requireSellerRole(allowedRoles: string[]) {
  return async function(request: NextRequest): Promise<SellerAuthContext | NextResponse> {
    const authContext = await authenticateSeller(request);
    
    if (!authContext) {
      return NextResponse.json(
        { error: 'Unauthorized - Seller access required' },
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
 * Log seller action for audit trail
 */
export async function logSellerAction(
  supabase: any,
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: any
) {
  try {
    await supabase
      .from('seller_logs')
      .insert([
        {
          seller_id: userId,
          action,
          resource,
          resource_id: resourceId,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('Failed to log seller action:', error);
  }
}

/**
 * Verify seller owns a specific resource
 */
export async function verifySellerOwnership(
  supabase: any,
  sellerId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  try {
    let query;
    
    switch (resourceType) {
      case 'property':
        query = supabase
          .from('properties')
          .select('id')
          .eq('id', resourceId)
          .eq('seller_id', sellerId)
          .single();
        break;
      
      case 'inquiry':
        query = supabase
          .from('property_inquiries')
          .select('id')
          .eq('id', resourceId)
          .eq('seller_id', sellerId)
          .single();
        break;
      
      case 'image':
        query = supabase
          .from('property_images')
          .select('id')
          .eq('id', resourceId)
          .eq('property_id', resourceId)
          .single();
        break;
      
      default:
        return false;
    }
    
    const { data, error } = await query;
    return !error && data !== null;
    
  } catch (error) {
    console.error('Error verifying seller ownership:', error);
    return false;
  }
}

