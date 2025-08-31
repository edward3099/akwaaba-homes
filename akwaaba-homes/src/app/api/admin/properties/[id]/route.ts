import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireAdmin, logAdminAction } from '@/lib/middleware/adminAuth';



// GET method to get a specific property with admin privileges
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    
    // Authenticate admin with read permissions
    const authResult = await requireAdmin(['read:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Fetch property with related data - simplified to avoid JOIN issues
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
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
          .from('profiles')
          .select('user_id, full_name, company_name, phone, email, user_role, verification_status')
          .eq('user_id', property.seller_id)
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
    
    // Authenticate admin with write permissions
    const authResult = await requireAdmin(['write:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;

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
    
    // Authenticate admin with delete permissions
    const authResult = await requireAdmin(['delete:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user, supabase } = authResult;

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
        status: 'inactive',
        updated_at: new Date().toISOString(),
        archived_at: new Date().toISOString()
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
