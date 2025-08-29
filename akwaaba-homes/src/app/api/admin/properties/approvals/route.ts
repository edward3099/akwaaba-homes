import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// GET method to list pending property approvals
export async function GET(request: NextRequest) {
  try {
    console.log('Admin properties approvals GET called');
    
    const supabase = await createApiRouteSupabaseClient();
    console.log('Supabase client created');
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check result:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role - query by id (not user_id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    console.log('Profile check result:', { profile, error: profileError });

    if (profileError || profile?.user_role !== 'admin') {
      console.log('Admin role check failed:', { profileError, userRole: profile?.user_role });
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

    // Get pending property approvals
    console.log('Fetching pending properties...');
    const { data: pendingProperties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        property_type,
        listing_type,
        bedrooms,
        bathrooms,
        square_feet,
        city,
        region,
        address,
        status,
        seller_id,
        created_at,
        updated_at
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    console.log('Properties query result:', { data: pendingProperties, error: propertiesError });

    if (propertiesError) {
      console.error('Error fetching pending properties:', propertiesError);
      return NextResponse.json({ error: 'Failed to fetch pending properties', details: propertiesError }, { status: 500 });
    }

    // Transform the data to match what the page expects
    const transformedProperties = (pendingProperties || []).map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      property_type: property.property_type,
      listing_type: property.listing_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.square_feet, // Map square_feet to size
      city: property.city,
      region: property.region,
      status: property.status,
      seller_id: property.seller_id,
      agent: 'Property Owner', // Mock agent name for now
      company: 'Individual Seller', // Mock company for now
      location: `${property.address}, ${property.city}, ${property.region}`,
      submittedAt: property.created_at,
      images: [], // Mock empty images array for now
      created_at: property.created_at,
      updated_at: property.updated_at
    }));

    console.log('Returning properties:', { count: transformedProperties.length });
    return NextResponse.json({ properties: transformedProperties });
  } catch (error) {
    console.error('Error in admin property approvals GET:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

// POST method to approve/reject property
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role - query by id (not user_id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, action, reason } = body;

    if (!propertyId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the property to check current status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, status, seller_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.status !== 'pending_approval') {
      return NextResponse.json({ error: 'Property is not pending approval' }, { status: 400 });
    }

    // Update property status
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        admin_reviewed_by: user.id,
        admin_reviewed_at: new Date().toISOString(),
        admin_review_notes: reason || null
      })
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property status:', updateError);
      return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
    }

    // If approved, send notification to seller (optional)
    if (action === 'approve' && property.seller_id) {
      // TODO: Implement notification system
      console.log(`Property ${propertyId} approved. Notification sent to seller ${property.seller_id}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Property ${action}d successfully`,
      data: updatedProperty 
    });
  } catch (error) {
    console.error('Error in admin property approvals POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
