import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction, verifySellerOwnership } from '@/lib/middleware/sellerAuth';

// Property management schemas
const propertyCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']),
  listing_type: z.enum(['for_sale', 'for_rent']),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  square_feet: z.number().positive().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  country: z.string().min(1).default('Ghana'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(['draft', 'pending', 'active', 'inactive']).default('draft')
});

const propertyUpdateSchema = propertyCreateSchema.partial();

const propertyQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  status: z.enum(['draft', 'pending', 'active', 'inactive', 'rejected', 'changes_requested']).optional(),
  property_type: z.string().optional(),
  listing_type: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'price', 'views_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

// GET /api/seller/properties - List seller's properties
export async function GET(request: NextRequest) {
  try {
    // Authenticate seller
    const authResult = await requireSeller(['read:own_properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    const queryData = propertyQuerySchema.parse(queryParams);
    const { page, limit, status, property_type, listing_type, sort_by, sort_order, search } = queryData;
    
    // Build base query for seller's properties
    let query = supabase
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
          is_primary
        )
      `)
      .eq('seller_id', sellerUser.id);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (property_type) {
      query = query.eq('property_type', property_type);
    }
    
    if (listing_type) {
      query = query.eq('listing_type', listing_type);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: properties, error: queryError } = await query;
    
    if (queryError) {
      console.error('Error fetching seller properties:', queryError);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUser.id);
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'list_properties', 'properties', undefined, {
      filters: { status, property_type, listing_type, search },
      pagination: { page, limit },
      sorting: { sort_by, sort_order }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        properties: properties || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          total_pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/seller/properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/seller/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    // Authenticate seller with create permissions
    const authResult = await requireSeller(['create:properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = propertyCreateSchema.parse(body);
    
    // Create property
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert([{
        ...validatedData,
        seller_id: sellerUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating property:', createError);
      return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'create_property', 'properties', newProperty.id, {
      property_title: newProperty.title,
      property_type: newProperty.property_type,
      listing_type: newProperty.listing_type,
      price: newProperty.price
    });
    
    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      data: newProperty
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/seller/properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/seller/properties - Bulk property operations
export async function PUT(request: NextRequest) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_properties'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body for bulk operations
    const bulkOperationSchema = z.object({
      action: z.enum(['update_status', 'update_featured', 'delete']),
      property_ids: z.array(z.string().uuid()).min(1),
      data: z.record(z.string(), z.any()).optional()
    });
    
    const validatedData = bulkOperationSchema.parse(body);
    const { action, property_ids, data } = validatedData;
    
    const results = [];
    const errors = [];
    
    // Process each property operation
    for (const propertyId of property_ids) {
      try {
        // Verify seller owns this property
        const isOwner = await verifySellerOwnership(supabase, sellerUser.id, 'property', propertyId);
        if (!isOwner) {
          errors.push({ property_id: propertyId, error: 'Property ownership verification failed' });
          continue;
        }
        
        let result;
        
        switch (action) {
          case 'update_status':
            if (!data?.status) {
              errors.push({ property_id: propertyId, error: 'Status is required for update_status action' });
              continue;
            }
            
            const { data: updatedProperty, error: updateError } = await supabase
              .from('properties')
              .update({
                status: data.status,
                updated_at: new Date().toISOString()
              })
              .eq('id', propertyId)
              .select()
              .single();
            
            if (updateError) {
              errors.push({ property_id: propertyId, error: 'Update failed' });
              continue;
            }
            
            result = updatedProperty;
            break;
          
          case 'update_featured':
            if (data?.is_featured === undefined) {
              errors.push({ property_id: propertyId, error: 'is_featured is required for update_featured action' });
              continue;
            }
            
            const { data: featuredProperty, error: featuredError } = await supabase
              .from('properties')
              .update({
                is_featured: data.is_featured,
                updated_at: new Date().toISOString()
              })
              .eq('id', propertyId)
              .select()
              .single();
            
            if (featuredError) {
              errors.push({ property_id: propertyId, error: 'Update failed' });
              continue;
            }
            
            result = featuredProperty;
            break;
          
          case 'delete':
            // Soft delete by setting status to inactive
            const { data: deletedProperty, error: deleteError } = await supabase
              .from('properties')
              .update({
                status: 'inactive',
                updated_at: new Date().toISOString()
              })
              .eq('id', propertyId)
              .select()
              .single();
            
            if (deleteError) {
              errors.push({ property_id: propertyId, error: 'Delete failed' });
              continue;
            }
            
            result = deletedProperty;
            break;
          
          default:
            errors.push({ property_id: propertyId, error: 'Invalid action' });
            continue;
        }
        
        results.push({
          property_id: propertyId,
          action,
          success: true,
          data: result
        });
        
      } catch (error) {
        errors.push({ 
          property_id: propertyId, 
          error: 'Processing error' 
        });
      }
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, `bulk_${action}_properties`, 'properties', undefined, {
      action,
      property_ids,
      data,
      successful: results.length,
      failed: errors.length
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed ${property_ids.length} properties`,
      data: {
        results,
        errors,
        summary: {
          total: property_ids.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/seller/properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

