import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user to verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { full_name, phone, company_name, bio, location } = body;

    // Update developer profile
    const { data: updatedDeveloper, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        company_name,
        bio,
        location,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_role', 'developer')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating developer:', updateError);
      return NextResponse.json({ error: 'Failed to update developer' }, { status: 500 });
    }

    return NextResponse.json({ developer: updatedDeveloper });

  } catch (error) {
    console.error('Error in update developer API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user to verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // First, get the developer's auth user ID
    const { data: developerProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .eq('user_role', 'developer')
      .single();

    if (profileFetchError || !developerProfile) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Delete from auth.users (this will cascade to profiles due to RLS)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error('Error deleting developer:', deleteError);
      return NextResponse.json({ error: 'Failed to delete developer' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Developer deleted successfully' });

  } catch (error) {
    console.error('Error in delete developer API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
