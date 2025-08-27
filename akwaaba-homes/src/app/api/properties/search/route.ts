import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Search query schema for URL parameters
const searchQuerySchema = z.object({
  query: z.string().optional(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']).optional(),
  listing_type: z.enum(['sale', 'rent']).optional(),
  min_price: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_price: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  min_bedrooms: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  min_bathrooms: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  min_area: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  max_area: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  features: z.string().transform(val => val ? val.split(',') : undefined).optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  sort_by: z.enum(['price', 'created_at', 'views', 'area']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().default('1').transform(val => parseInt(val)),
  limit: z.string().default('20').transform(val => parseInt(val)),
});

export async function GET(request: NextRequest) {
  try {
    // Create a simple Supabase client for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Parse URL parameters instead of request body
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validatedData = searchQuerySchema.parse(queryParams);

    // Build search query - simplified to avoid RLS policy issues
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price,
        property_type,
        status,
        bedrooms,
        bathrooms,
        square_feet,
        address,
        city,
        region,
        features,
        created_at,
        views_count,
        approval_status
      `);

    // Apply search filters
    if (validatedData.query) {
      query = query.or(`
        title.ilike.%${validatedData.query}%,
        description.ilike.%${validatedData.query}%,
        address.ilike.%${validatedData.query}%,
        city.ilike.%${validatedData.query}%,
        state.ilike.%${validatedData.query}%
      `);
    }

    // Apply property type filter
    if (validatedData.property_type) {
      query = query.eq('property_type', validatedData.property_type);
    }

    // Apply listing type filter
    if (validatedData.listing_type) {
      query = query.eq('listing_type', validatedData.listing_type);
    }

    // Apply price filters
    if (validatedData.min_price) {
      query = query.gte('price', validatedData.min_price);
    }
    if (validatedData.max_price) {
      query = query.lte('price', validatedData.max_price);
    }

    // Apply bedroom filter
    if (validatedData.min_bedrooms !== undefined) {
      query = query.gte('bedrooms', validatedData.min_bedrooms);
    }

    // Apply bathroom filter
    if (validatedData.min_bathrooms !== undefined) {
      query = query.gte('bathrooms', validatedData.min_bathrooms);
    }

    // Apply area filters
    if (validatedData.min_area) {
      query = query.gte('square_feet', validatedData.min_area);
    }
    if (validatedData.max_area) {
      query = query.lte('square_feet', validatedData.max_area);
    }

    // Apply location filters
    if (validatedData.city) {
      query = query.ilike('city', `%${validatedData.city}%`);
    }
    if (validatedData.state) {
      query = query.ilike('region', `%${validatedData.state}%`);
    }

    // Apply features filter
    if (validatedData.features && validatedData.features.length > 0) {
      validatedData.features.forEach(feature => {
        query = query.contains('features', [feature]);
      });
    }

    // Apply approval status filter
    if (validatedData.approval_status) {
      query = query.eq('approval_status', validatedData.approval_status);
    }

    // Apply sorting
    const sortColumn = validatedData.sort_by === 'created_at' ? 'created_at' : 
                      validatedData.sort_by === 'views' ? 'views_count' : 
                      validatedData.sort_by === 'area' ? 'square_feet' : 'price';
    
    query = query.order(sortColumn, { ascending: validatedData.sort_order === 'asc' });

    // Apply pagination
    const offset = (validatedData.page - 1) * validatedData.limit;
    query = query.range(offset, offset + validatedData.limit - 1);

    // Get total count for pagination
    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Execute query
    const { data: properties, error } = await query;

    if (error) {
      console.error('Error searching properties:', error);
      return NextResponse.json({ error: 'Failed to search properties' }, { status: 500 });
    }

    // Return search results without analytics tracking (public endpoint)
    return NextResponse.json({
      properties,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedData.limit),
      },
      search_metadata: {
        query: validatedData.query,
        filters_applied: Object.keys(validatedData).filter(key => 
          key !== 'query' && key !== 'page' && key !== 'limit' && 
          key !== 'sort_by' && key !== 'sort_order' && 
          validatedData[key as keyof typeof validatedData] !== undefined
        ),
        sort_by: validatedData.sort_by,
        sort_order: validatedData.sort_order,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in properties search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
