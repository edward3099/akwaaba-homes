import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

// Enhanced query schema with better validation
const querySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  propertyType: z.string().optional(),
  property_type: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  min_price: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  max_price: z.string().transform(Number).optional(),
  city: z.string().optional(),
  bedrooms: z.string().transform(Number).optional(),
  bathrooms: z.string().transform(Number).optional(),
  search: z.string().optional(),
});

// Updated property creation schema to match our form schema and database enums
const propertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial', 'office']),
  listing_type: z.enum(['sale', 'rent', 'lease']),
  price: z.number().min(0, 'Price must be non-negative').max(1000000000, 'Price must be less than 1 billion'),
  currency: z.string().min(3, 'Currency must be 3 characters').max(3, 'Currency must be 3 characters').default('GHS'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address must be less than 500 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City must be less than 100 characters'),
  region: z.string().min(2, 'Region must be at least 2 characters').max(100, 'Region must be less than 100 characters'),
  postal_code: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  bedrooms: z.number().min(0, 'Bedrooms must be non-negative').max(20, 'Bedrooms must be less than 20').optional(),
  bathrooms: z.number().min(0, 'Bathrooms must be non-negative').max(20, 'Bathrooms must be less than 20').optional(),
  square_feet: z.number().min(0, 'Square feet must be non-negative').max(1000000, 'Square feet must be less than 1 million').optional(),
  land_size: z.number().min(0, 'Land size must be non-negative').max(1000000, 'Land size must be less than 1 million').optional(),
  year_built: z.number().min(1800, 'Year built must be after 1800').max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
  features: z.array(z.string()).min(1, 'At least one feature must be selected'),
  amenities: z.array(z.string()).min(1, 'At least one amenity must be selected'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    image_type: z.enum(['primary', 'gallery', 'floorplan', 'exterior', 'interior']),
    is_primary: z.boolean(),
    alt_text: z.string().optional(),
    order_index: z.number().min(0)
  })).optional().default([]), // Make images optional with default empty array
  status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).default('pending'),
  is_featured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    const { searchParams } = new URL(request.url);
    const validatedData = querySchema.parse(Object.fromEntries(searchParams.entries()));

    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');

    // Apply filters
    if (validatedData.propertyType || validatedData.property_type) {
      query = query.eq('property_type', validatedData.propertyType || validatedData.property_type);
    }
    if (validatedData.status) {
      query = query.eq('status', validatedData.status);
    }
    if (validatedData.minPrice !== undefined || validatedData.min_price !== undefined) {
      query = query.gte('price', validatedData.minPrice || validatedData.min_price);
    }
    if (validatedData.maxPrice !== undefined || validatedData.max_price !== undefined) {
      query = query.lte('price', validatedData.maxPrice || validatedData.max_price);
    }
    if (validatedData.city) {
      query = query.ilike('city', `%${validatedData.city}%`);
    }
    if (validatedData.bedrooms !== undefined) {
      query = query.gte('bedrooms', validatedData.bedrooms);
    }
    if (validatedData.bathrooms !== undefined) {
      query = query.gte('bathrooms', validatedData.bathrooms);
    }
    if (validatedData.search) {
      query = query.or(`title.ilike.%${validatedData.search}%,description.ilike.%${validatedData.search}%,city.ilike.%${validatedData.search}%`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Apply pagination
    const offset = (validatedData.page - 1) * validatedData.limit;
    query = query.range(offset, offset + validatedData.limit - 1);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: properties, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties', details: error.message },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / validatedData.limit);

    return NextResponse.json({
      properties: properties || [],
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a seller, agent, or admin using the profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role, is_verified, verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Allow agents, sellers, and admins to create properties
    if (!['agent', 'seller', 'admin'].includes(userProfile.user_role)) {
      return NextResponse.json(
        { error: 'Agent, seller, or admin role required to create properties' },
        { status: 403 }
      );
    }

    // For agents and sellers, check if they're verified
    if (['agent', 'seller'].includes(userProfile.user_role) && !userProfile.is_verified) {
      return NextResponse.json(
        { error: 'Account must be verified to create properties' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate property data
    const validatedData = propertyCreateSchema.parse(body);

    // Create property with enhanced data
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert({
        title: validatedData.title,
        description: validatedData.description,
        property_type: validatedData.property_type,
        listing_type: validatedData.listing_type,
        price: validatedData.price,
        currency: validatedData.currency,
        address: validatedData.address,
        city: validatedData.city,
        region: validatedData.region,
        postal_code: validatedData.postal_code,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        square_feet: validatedData.square_feet,
        land_size: validatedData.land_size,
        year_built: validatedData.year_built,
        features: validatedData.features,
        amenities: validatedData.amenities,
        status: validatedData.status,
        is_featured: validatedData.is_featured,
        seller_id: user.id,
        views_count: 0, // Start with 0 views
        approval_status: 'pending', // Set initial approval status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Property creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create property', details: createError.message },
        { status: 500 }
      );
    }

    // Create property images
    if (validatedData.images && validatedData.images.length > 0) {
      const imageData = validatedData.images.map((image, index) => ({
        property_id: property.id,
        image_url: image.url,
        image_type: image.image_type,
        is_primary: image.is_primary,
        alt_text: image.alt_text || `Property image ${index + 1}`,
        order_index: image.order_index,
        created_at: new Date().toISOString()
      }));

      const { error: imageError } = await supabase
        .from('property_images')
        .insert(imageData);

      if (imageError) {
        console.error('Property image creation error:', imageError);
        // Don't fail the entire request, but log the error
        // You might want to handle this differently based on your requirements
      }
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_view',
          user_id: user.id,
          property_id: property.id,
          event_data: {
            property_type: property.property_type,
            price: property.price,
            location: property.city,
            action: 'property_created'
          },
        }
      ]);

    return NextResponse.json({
      message: 'Property created successfully',
      property,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
