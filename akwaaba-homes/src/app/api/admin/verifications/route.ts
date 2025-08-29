import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// GET method to list pending verifications
export async function GET(request: NextRequest) {
  try {
    console.log('Admin verifications GET called');
    
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

    // Get pending agent verifications
    console.log('Fetching agent verifications...');
    const { data: agentVerifications, error: agentError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        company_name,
        phone,
        email,
        verification_status,
        created_at,
        updated_at
      `)
      .eq('user_role', 'agent')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    console.log('Agent verifications result:', { data: agentVerifications, error: agentError });

    if (agentError) {
      console.error('Error fetching agent verifications:', agentError);
      return NextResponse.json({ error: 'Failed to fetch agent verifications', details: agentError }, { status: 500 });
    }

    // Get pending property verifications
    console.log('Fetching property verifications...');
    const { data: propertyVerifications, error: propertyError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        property_type,
        listing_type,
        status,
        seller_id,
        created_at,
        updated_at
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    console.log('Property verifications result:', { data: propertyVerifications, error: propertyError });

    if (propertyError) {
      console.error('Error fetching property verifications:', propertyError);
      return NextResponse.json({ error: 'Failed to fetch property verifications', details: propertyError }, { status: 500 });
    }

    // Transform the data to match what the page expects
    const transformedAgents = (agentVerifications || []).map(agent => ({
      id: agent.id,
      name: agent.full_name,
      company: agent.company_name,
      phone: agent.phone,
      email: agent.email,
      status: agent.verification_status,
      documents: ['ID Document', 'Business License', 'Phone Verification'], // Mock documents for now
      submittedAt: agent.created_at
    }));

    const transformedProperties = (propertyVerifications || []).map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      property_type: property.property_type,
      listing_type: property.listing_type,
      status: property.status,
      agent: 'Property Owner', // Mock agent name for now
      documents: ['Property Photos', 'Title Deed', 'Location Verification'], // Mock documents for now
      submittedAt: property.created_at
    }));

    const verifications = {
      agents: transformedAgents,
      properties: transformedProperties
    };

    console.log('Returning verifications:', { 
      agentCount: verifications.agents.length, 
      propertyCount: verifications.properties.length 
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error('Error in admin verifications GET:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

// POST method to approve/reject verifications
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
    const { verificationId, verificationType, action, reason } = body;

    if (!verificationId || !verificationType || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    let error;

    if (verificationType === 'agent') {
      // Handle agent verification
      const newStatus = action === 'approve' ? 'verified' : 'rejected';
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: newStatus,
          updated_at: new Date().toISOString(),
          admin_reviewed_by: user.id,
          admin_reviewed_at: new Date().toISOString(),
          admin_review_notes: reason || null
        })
        .eq('id', verificationId)
        .select()
        .single();

      result = data;
      error = updateError;
    } else if (verificationType === 'property') {
      // Handle property verification
      const newStatus = action === 'approve' ? 'active' : 'rejected';
      
      const { data, error: updateError } = await supabase
        .from('properties')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          admin_reviewed_by: user.id,
          admin_reviewed_at: new Date().toISOString(),
          admin_review_notes: reason || null
        })
        .eq('id', verificationId)
        .select()
        .single();

      result = data;
      error = updateError;
    } else {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
    }

    if (error) {
      console.error('Error updating verification:', error);
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${verificationType} ${action}d successfully`,
      data: result 
    });
  } catch (error) {
    console.error('Error in admin verifications POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
