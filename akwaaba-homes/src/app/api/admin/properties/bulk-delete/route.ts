import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for bulk delete request
const bulkDeleteSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'active', 'inactive', 'sold', 'rented', 'archived']),
  propertyIds: z.array(z.string().uuid()).optional() // Optional specific IDs, if not provided, delete all with status
});

// Helper function to check if user is admin
async function checkAdminAccess(supabase: any, userId: string) {
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('user_role, is_verified')
    .eq('id', userId)
    .single();

  if (profileError || !userProfile) {
    return { isAdmin: false, error: 'User profile not found' };
  }

  if (userProfile.user_role !== 'admin') {
    return { isAdmin: false, error: 'Admin role required' };
  }

  return { isAdmin: true, profile: userProfile };
}

// POST method to bulk delete properties
export async function POST(request: NextRequest) {
  try {
    console.log('Admin properties bulk delete API called');
    const supabase = await createApiRouteSupabaseClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, authError });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const adminCheck = await checkAdminAccess(supabase, user.id);
    if (!adminCheck.isAdmin) {
      console.log('Admin role check failed:', adminCheck.error);
      return NextResponse.json({ error: adminCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = bulkDeleteSchema.parse(body);
    const { status, propertyIds } = validatedData;

    console.log('Bulk delete request:', { status, propertyIds });

    // Build query for properties to delete
    let query = supabase
      .from('properties')
      .select('id, title, status')
      .eq('status', status);

    // If specific property IDs provided, filter by them
    if (propertyIds && propertyIds.length > 0) {
      query = query.in('id', propertyIds);
    }

    // First, get the properties that will be deleted for logging
    const { data: propertiesToDelete, error: selectError } = await query;

    if (selectError) {
      console.error('Error selecting properties for deletion:', selectError);
      return NextResponse.json(
        { error: 'Failed to select properties for deletion', details: selectError.message },
        { status: 500 }
      );
    }

    if (!propertiesToDelete || propertiesToDelete.length === 0) {
      return NextResponse.json(
        { message: 'No properties found with the specified status', deletedCount: 0 },
        { status: 200 }
      );
    }

    console.log(`Found ${propertiesToDelete.length} properties to delete:`, propertiesToDelete.map(p => ({ id: p.id, title: p.title })));

    // Use service role client for deletion to bypass RLS
    const serviceSupabase = createServiceRoleSupabaseClient();
    
    // Delete the properties using service role client
    // Handle different status mappings
    let deleteQuery;
    
    if (status === 'approved') {
      // For approved properties, delete those with status 'active'
      deleteQuery = serviceSupabase
        .from('properties')
        .delete()
        .eq('status', 'active');
    } else if (status === 'inactive') {
      // For inactive properties, delete those with inactive status OR archived_at timestamp
      deleteQuery = serviceSupabase
        .from('properties')
        .delete()
        .or('status.eq.inactive,archived_at.not.is.null');
    } else if (status === 'archived') {
      // For archived properties, delete those with archived_at timestamp
      deleteQuery = serviceSupabase
        .from('properties')
        .delete()
        .not('archived_at', 'is', null);
    } else {
      // For other statuses (pending, rejected, sold, rented), delete by exact status
      deleteQuery = serviceSupabase
        .from('properties')
        .delete()
        .eq('status', status);
    }

    // If specific property IDs provided, filter by them
    if (propertyIds && propertyIds.length > 0) {
      deleteQuery.in('id', propertyIds);
    }

    console.log(`Executing delete query for status: ${status}`);
    const { error: deleteError, count } = await deleteQuery;

    if (deleteError) {
      console.error('Error deleting properties:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete properties', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted ${propertiesToDelete.length} properties`);

    return NextResponse.json(
      {
        message: `Successfully deleted ${propertiesToDelete.length} properties`,
        deletedCount: propertiesToDelete.length,
        deletedProperties: propertiesToDelete.map(p => ({ id: p.id, title: p.title }))
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in admin properties bulk delete:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
