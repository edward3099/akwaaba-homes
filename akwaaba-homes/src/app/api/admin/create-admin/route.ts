import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Admin creation schema - only admins can create other admins
const adminCreateSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  business_type: z.string().min(2, 'Business type must be at least 2 characters'),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  experience_years: z.number().min(0, 'Experience years must be 0 or greater'),
  bio: z.string().min(10, 'Professional bio must be at least 10 characters'),
  admin_level: z.enum(['admin', 'super_admin']).default('admin'),
  permissions: z.array(z.string()).optional().default([])
});

// Admin update schema
const adminUpdateSchema = z.object({
  admin_level: z.enum(['admin', 'super_admin']).optional(),
  permissions: z.array(z.string()).optional(),
  is_verified: z.boolean().optional(),
  verification_status: z.enum(['pending', 'verified', 'rejected']).optional()
});

// Helper function to check if user is admin
async function checkAdminAccess(supabase: any, userId: string) {
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_role, is_verified')
    .eq('user_id', userId)
    .single();

  if (profileError || !userProfile) {
    return { isAdmin: false, error: 'User profile not found' };
  }

  if (userProfile.user_role !== 'admin') {
    return { isAdmin: false, error: 'Admin role required' };
  }

  return { isAdmin: true, profile: userProfile };
}

// GET method to list existing admin accounts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    // Get all admin accounts from profiles table
    const { data: adminProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        full_name,
        phone,
        company_name,
        business_type,
        license_number,
        experience_years,
        bio,
        user_role,
        is_verified,
        verification_status,
        created_at,
        updated_at
      `)
      .eq('user_role', 'admin')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching admin profiles:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch admin accounts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin accounts retrieved successfully',
      admins: adminProfiles || [],
      count: adminProfiles?.length || 0
    });

  } catch (error) {
    console.error('Admin listing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH method to update admin account
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    // Get the admin ID to update from query params
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Validate input data
    const body = await request.json();
    const validationResult = adminUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update admin profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', adminId)
      .eq('user_role', 'admin');

    if (updateProfileError) {
      console.error('Profile update error:', updateProfileError);
      return NextResponse.json(
        { error: 'Failed to update admin profile', details: updateProfileError.message },
        { status: 500 }
      );
    }

    // Update users table if needed
    if (updateData.is_verified !== undefined || updateData.verification_status) {
      const userUpdateData: any = {};
      if (updateData.is_verified !== undefined) userUpdateData.is_verified = updateData.is_verified;
      if (updateData.verification_status) userUpdateData.verification_status = updateData.verification_status;

      const { error: updateUserError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', adminId);

      if (updateUserError) {
        console.error('User table update error:', updateUserError);
        return NextResponse.json(
          { error: 'Failed to update user record', details: updateUserError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Admin account updated successfully',
      admin_id: adminId
    });

  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE method to remove admin account
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    // Get the admin ID to delete from query params
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (adminId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const { data: adminProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('user_id', adminId)
      .eq('user_role', 'admin')
      .single();

    if (fetchError || !adminProfile) {
      return NextResponse.json(
        { error: 'Admin account not found' },
        { status: 404 }
      );
    }

    // Delete from users table first
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', adminId);

    if (deleteUserError) {
      console.error('User table delete error:', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete user record', details: deleteUserError.message },
        { status: 500 }
      );
    }

    // Delete from profiles table
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', adminId);

    if (deleteProfileError) {
      console.error('Profile delete error:', deleteProfileError);
      return NextResponse.json(
        { error: 'Failed to delete admin profile', details: deleteProfileError.message },
        { status: 500 }
      );
    }

    // Delete from auth.users using Supabase Admin API
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(adminId);

    if (deleteAuthError) {
      console.error('Auth user delete error:', deleteAuthError);
      return NextResponse.json(
        { error: 'Failed to delete auth user', details: deleteAuthError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin account deleted successfully',
      admin_id: adminId
    });

  } catch (error) {
    console.error('Admin deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is an admin
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 }
      );
    }

    // Validate input data
    const body = await request.json();
    const validationResult = adminCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      company_name,
      business_type,
      license_number,
      experience_years,
      bio,
      admin_level,
      permissions
    } = validationResult.data;

    // Check if email already exists by looking in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create admin user account using Supabase Admin API
    const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin accounts
      user_metadata: {
        full_name: `${first_name} ${last_name}`,
        phone,
        company_name,
        business_type,
        license_number,
        experience_years,
        bio,
        user_type: 'admin',
        verification_status: 'verified',
        admin_level,
        permissions
      }
    });

    if (createAuthError) {
      console.error('Supabase admin auth error:', createAuthError);
      return NextResponse.json(
        { error: 'Failed to create admin account', details: createAuthError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      );
    }

    // Insert admin profile data
    const { error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name: `${first_name} ${last_name}`,
        phone,
        company_name,
        business_type,
        license_number,
        experience_years,
        bio,
        user_role: 'admin',
        verification_status: 'verified',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createProfileError) {
      console.error('Profile creation error:', createProfileError);
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create admin profile', details: createProfileError.message },
        { status: 500 }
      );
    }

    // Insert into users table
    const { error: createUserTableError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: `${first_name} ${last_name}`,
        phone,
        user_type: 'admin',
        is_verified: true,
        verification_status: 'verified'
      });

    if (createUserTableError) {
      console.error('User table insert error:', createUserTableError);
      // Clean up if user table insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user record', details: createUserTableError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: `${first_name} ${last_name}`,
        admin_level,
        verification_status: 'verified'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
