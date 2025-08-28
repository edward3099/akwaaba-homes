import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

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

// GET method to get a specific property with admin privileges
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Fetch property with related data - simplified to avoid JOIN issues
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          is_primary,
          caption
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      console.error('Error fetching property:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch property', 
        details: error.message 
      }, { status: 500 });
    }

    // Fetch seller information separately
    let propertyWithSeller = property;
    if (property && property.seller_id) {
      try {
        const { data: seller, error: sellerError } = await supabase
          .from('users')
          .select('id, full_name, company_name, phone, email, user_type, is_verified')
          .eq('id', property.seller_id)
          .single();

        if (!sellerError && seller) {
          propertyWithSeller = {
            ...property,
            seller
          };
        }
      } catch (sellerError) {
        console.warn('Could not fetch seller information:', sellerError);
      }
    }

    // Fetch inquiries separately
    let propertyWithInquiries = propertyWithSeller;
    try {
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('id, buyer_name, buyer_email, buyer_phone, message, status, created_at')
        .eq('property_id', propertyId);

      if (!inquiriesError && inquiries) {
        propertyWithInquiries = {
          ...propertyWithSeller,
          inquiries
        };
      }
    } catch (inquiriesError) {
      console.warn('Could not fetch inquiries:', inquiriesError);
    }

    return NextResponse.json({ property: propertyWithInquiries });

  } catch (error) {
    console.error('Error in admin property GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update a property with admin privileges
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check if property exists
    const { data: existingProperty, error: propertyError } = await supabase
      .from('properties')
      .select('id, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update property', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_updated_by_admin',
          user_id: user.id,
          property_id: propertyId,
          metadata: {
            property_type: updatedProperty.property_type,
            price: updatedProperty.price,
            location: updatedProperty.city,
            updated_fields: Object.keys(body),
            admin_id: user.id
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property updated successfully',
      property: updatedProperty 
    });

  } catch (error) {
    console.error('Error in admin property PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to archive a property with admin privileges
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check if property exists
    const { data: existingProperty, error: propertyError } = await supabase
      .from('properties')
      .select('id, status, property_type, city')
      .eq('id', propertyId)
      .single();

    if (propertyError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Archive the property instead of deleting for safety
    const { error: archiveError } = await supabase
      .from('properties')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString(),
        archived_at: new Date().toISOString(),
        archived_by: user.id
      })
      .eq('id', propertyId);

    if (archiveError) {
      console.error('Error archiving property:', archiveError);
      return NextResponse.json({ 
        error: 'Failed to archive property', 
        details: archiveError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_archived_by_admin',
          user_id: user.id,
          metadata: {
            property_id: propertyId,
            property_type: existingProperty.property_type,
            location: existingProperty.city,
            archived_by: user.id,
            admin_id: user.id
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property archived successfully' 
    });

  } catch (error) {
    console.error('Error in admin property DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
