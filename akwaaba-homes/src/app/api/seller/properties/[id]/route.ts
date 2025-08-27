import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction, verifySellerOwnership } from '@/lib/middleware/sellerAuth';

// Property update schema
const propertyUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  price: z.number().positive().optional(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']).optional(),
  listing_type: z.enum(['for_sale', 'for_rent']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  square_feet: z.number().positive().optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zip_code: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  status: z.enum(['draft', 'pending', 'active', 'inactive']).optional()
});

// GET /api/seller/properties/[id] - Get specific property details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id } = await params;
    
    // Verify seller owns this property
    const isOwner = await verifySellerOwnership(supabase, sellerUser.id, 'property', id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }
    
    // Get property details
    const { data: property, error: queryError } = await supabase
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
        address,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude,
        amenities,
        features,
        is_featured,
        status,
        views_count,
        created_at,
        updated_at,
        property_images (
          id,
          image_url,
          is_primary,
          caption
        )
      `)
      .eq('id', id)
      .single();
    
    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      console.error('Error fetching property:', queryError);
      return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'view_property', 'properties', id);
    
    return NextResponse.json({
      success: true,
      data: property
    });
    
  } catch (error) {
    console.error('Error in GET /api/seller/properties/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/seller/properties/[id] - Update specific property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = propertyUpdateSchema.parse(body);
    
    // Verify seller owns this property
    const isOwner = await verifySellerOwnership(supabase, sellerUser.id, 'property', id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }
    
    // Check if property exists and get current data
    const { data: existingProperty, error: checkError } = await supabase
      .from('properties')
      .select('id, title, status')
      .eq('id', id)
      .single();
    
    if (checkError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // If property is active and being updated, set status to pending for admin review
    let updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    };
    
    if (existingProperty.status === 'active' && Object.keys(validatedData).length > 0) {
      updateData.status = 'pending';
    }
    
    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'update_property', 'properties', id, {
      updated_fields: Object.keys(validatedData),
      previous_status: existingProperty.status,
      new_status: updateData.status,
      property_title: existingProperty.title
    });
    
    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/seller/properties/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/seller/properties/[id] - Delete specific property (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with appropriate permissions
    const authResult = await requireSeller(['write:own_properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id } = await params;
    
    // Verify seller owns this property
    const isOwner = await verifySellerOwnership(supabase, sellerUser.id, 'property', id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }
    
    // Check if property exists
    const { data: existingProperty, error: checkError } = await supabase
      .from('properties')
      .select('id, title, status')
      .eq('id', id)
      .single();
    
    if (checkError || !existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Prevent deletion of active properties (they should be deactivated first)
    if (existingProperty.status === 'active') {
      return NextResponse.json({ 
        error: 'Cannot delete active properties. Please deactivate first.' 
      }, { status: 400 });
    }
    
    // Soft delete property by setting status to inactive
    const { data: deletedProperty, error: deleteError } = await supabase
      .from('properties')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (deleteError) {
      console.error('Error deleting property:', deleteError);
      return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'delete_property', 'properties', id, {
      property_title: existingProperty.title,
      previous_status: existingProperty.status
    });
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      data: deletedProperty
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/seller/properties/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

