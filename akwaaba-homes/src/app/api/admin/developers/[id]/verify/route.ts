import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
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
    const { is_verified } = body;

    // Update developer verification status
    const { data: updatedDeveloper, error: updateError } = await supabase
      .from('profiles')
      .update({
        is_verified,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_role', 'developer')
      .select()
      .single();

    if (updateError) {
      console.error('Error updating developer verification:', updateError);
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }

    return NextResponse.json({ developer: updatedDeveloper });

  } catch (error) {
    console.error('Error in verify developer API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
