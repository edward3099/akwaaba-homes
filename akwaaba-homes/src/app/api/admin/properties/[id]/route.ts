import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// Admin authentication middleware
async function requireAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎯 Admin property details API called:', params.id);
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Verify admin access
    await requireAdmin(supabase);

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        *,
        profiles!properties_owner_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          role
        )
      `)
      .eq('id', params.id)
      .single();

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('✅ Property details fetched successfully');

    return NextResponse.json({
      property
    });

  } catch (error) {
    console.error('❌ Admin property details API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎯 Admin property delete API called:', params.id);
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Verify admin access
    await requireAdmin(supabase);

    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, status')
      .eq('id', params.id)
      .single();

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete the property
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('❌ Error deleting property:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      );
    }

    console.log('✅ Property deleted successfully:', property.title);

    return NextResponse.json({
      message: 'Property deleted successfully',
      property: {
        id: property.id,
        title: property.title
      }
    });

  } catch (error) {
    console.error('❌ Admin property delete API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
