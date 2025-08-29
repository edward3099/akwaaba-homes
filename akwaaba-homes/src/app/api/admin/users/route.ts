import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';

// User management schemas
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

const userQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  search: z.string().optional(),
  user_type: z.enum(['admin', 'super_admin', 'moderator', 'seller', 'agent']).optional(),
  is_verified: z.string().transform(val => val === 'true').optional(),
  is_active: z.string().transform(val => val === 'true').optional(),
  sort_by: z.enum(['created_at', 'full_name', 'email', 'user_type']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

const bulkActionSchema = z.object({
  action: z.enum(['verify', 'unverify', 'activate', 'deactivate', 'delete']),
  user_ids: z.array(z.string().uuid()).min(1)
});

// GET /api/admin/users - List users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin with read permissions
    const authResult = await requireAdmin(['read:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = userQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit, search, user_type, is_verified, is_active, sort_by, sort_order } = queryData;
    
    // Build base query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        user_role,
        is_verified,
        created_at,
        updated_at
      `);
    
    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }
    
    if (user_type) {
      query = query.eq('user_role', user_type);
    }
    
    if (is_verified !== undefined) {
      query = query.eq('is_verified', is_verified);
    }
    
    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: users, error: queryError, count } = await query;
    
    if (queryError) {
      console.error('Error fetching users:', queryError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Log admin action
    await logAdminAction(supabase, user.id, 'list_users', 'profiles', undefined, {
      filters: { search, user_type, is_verified },
      pagination: { page, limit },
      sorting: { sort_by, sort_order }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          total_pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = userUpdateSchema.parse(body);
    
    // Check if email already exists
    if (validatedData.email) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validatedData.email)
        .single();
      
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }
    
    // Create user profile
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert([{
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    // Log admin action
    await logAdminAction(supabase, user.id, 'create_user', 'profiles', newUser.id, {
      user_data: validatedData
    });
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - Bulk actions on users
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:users'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = bulkActionSchema.parse(body);
    const { action, user_ids } = validatedData;
    
    let updateData: any = {};
    let actionDescription = '';
    
    // Prepare update data based on action
    switch (action) {
      case 'verify':
        updateData = { is_verified: true };
        actionDescription = 'verify users';
        break;
      case 'unverify':
        updateData = { is_verified: false };
        actionDescription = 'unverify users';
        break;
      case 'delete':
        // For delete action, we'll handle it separately
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    let result;
    
    if (action === 'delete') {
      // Delete users (soft delete by setting is_verified to false)
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: false, 
          updated_at: new Date().toISOString() 
        })
        .in('id', user_ids)
        .select('id');
      
      if (error) {
        console.error('Error deleting users:', error);
        return NextResponse.json({ error: 'Failed to delete users' }, { status: 500 });
      }
      
      result = data;
      actionDescription = 'delete users';
    } else {
      // Update users
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...updateData, 
          updated_at: new Date().toISOString() 
        })
        .in('id', user_ids)
        .select('id');
      
      if (error) {
        console.error('Error updating users:', error);
        return NextResponse.json({ error: 'Failed to update users' }, { status: 500 });
      }
      
      result = data;
    }
    
    // Log admin action
    await logAdminAction(supabase, user.id, actionDescription, 'profiles', undefined, {
      action,
      user_ids,
      affected_count: result?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${actionDescription}`,
      data: {
        action,
        affected_users: result?.length || 0,
        user_ids: result?.map((u: { id: string }) => u.id) || []
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
