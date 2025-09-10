import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Approve API called successfully!');
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin by checking user metadata
    const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
    
    if (userType !== 'admin') {
      console.log('❌ Not admin:', { userType, expected: 'admin' });
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { propertyId, action } = await request.json();
    
    if (!propertyId || !action) {
      return NextResponse.json({ error: 'Property ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be approve or reject' }, { status: 400 });
    }

    // Get the property using service role client to bypass RLS
    const serviceSupabase = createServiceRoleSupabaseClient();
    const { data: property, error: propertyError } = await serviceSupabase
      .from('properties')
      .select('id, status, title')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update the property status
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.status = 'active';
      updateData.approval_status = 'approved';
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = user.id;
    } else if (action === 'reject') {
      updateData.status = 'rejected';
      updateData.approval_status = 'rejected';
      updateData.rejection_reason = 'Rejected by admin';
    }

    const { error: updateError } = await serviceSupabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId);

    if (updateError) {
      console.error('Property update error:', updateError);
      return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
    }

    console.log(`✅ Property ${action}d successfully:`, propertyId);
    
    return NextResponse.json({ 
      success: true, 
      message: `Property ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      property: {
        id: property.id,
        title: property.title,
        status: updateData.status,
        approval_status: updateData.approval_status
      }
    });

  } catch (error) {
    console.error('Property approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}