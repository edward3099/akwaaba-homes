import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';

// User update schema
const userUpdateSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  user_type: z.enum(['admin', 'super_admin', 'moderator', 'seller', 'agent']).optional(),
  is_verified: z.boolean().optional(),
  is_active: z.boolean().optional(),
  company_name: z.string().optional(),
  bio: z.string().optional(),
  profile_image_url: z.string().url().optional()
});

// GET /api/admin/users/[id] - Get specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin with read permissions
    const authResult = await requireAdmin(['read:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { id } = await params;
    
    // Get user details
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        user_type,
        is_verified,
        is_active,
        company_name,
        bio,
        profile_image_url,
        created_at,
        updated_at,
        last_login_at
      `)
      .eq('id', id)
      .single();
    
    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.error('Error fetching user:', queryError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'view_user', 'users', id);
    
    return NextResponse.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = userUpdateSchema.parse(body);
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single();
    
    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if email already exists (if email is being updated)
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: emailExists } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', id)
        .single();
      
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }
    
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'update_user', 'users', id, {
      updated_fields: Object.keys(validatedData),
      previous_data: existingUser
    });
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete specific user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin with delete permissions
    const authResult = await requireAdmin(['delete:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: adminUser, supabase } = authResult;
    const { id } = await params;
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', id)
      .single();
    
    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent deletion of super admin users (unless by another super admin)
    if (existingUser.user_type === 'super_admin' && adminUser.user_type !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Only super admins can delete super admin users' 
      }, { status: 403 });
    }
    
    // Soft delete user by setting is_active to false
    const { data: deletedUser, error: deleteError } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
    
    // Log admin action
    await logAdminAction(supabase, adminUser.id, 'delete_user', 'users', id, {
      deleted_user: {
        id: existingUser.id,
        full_name: existingUser.full_name,
        email: existingUser.email
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

