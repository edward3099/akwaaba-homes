import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Search query schema for URL parameters
const searchQuerySchema = z.object({
  query: z.string().optional(),
  user_role: z.enum(['agent', 'seller']).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  is_verified: z.string().transform(val => val === 'true').optional(),
  sort_by: z.enum(['full_name', 'created_at', 'company_name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().default('1').transform(val => parseInt(val)),
  limit: z.string().default('20').transform(val => parseInt(val)),
});

export async function GET(request: NextRequest) {
  try {
    // Create a simple Supabase client for public access
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    // Parse URL parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validatedData = searchQuerySchema.parse(queryParams);

    // Build search query
    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        company_name,
        phone,
        email,
        user_role,
        is_verified,
        verification_status,
        bio,
        profile_image,
        cover_image,
        specializations,
        experience_years,
        address,
        city,
        region,
        created_at
      `)
      .in('user_role', ['agent', 'seller']);

    // Apply search filters
    if (validatedData.query) {
      query = query.or(`full_name.ilike.%${validatedData.query}%,company_name.ilike.%${validatedData.query}%,bio.ilike.%${validatedData.query}%`);
    }
    
    if (validatedData.user_role) {
      query = query.eq('user_role', validatedData.user_role);
    }
    
    if (validatedData.city) {
      query = query.eq('city', validatedData.city);
    }
    
    if (validatedData.region) {
      query = query.eq('region', validatedData.region);
    }
    
    if (validatedData.is_verified !== undefined) {
      query = query.eq('is_verified', validatedData.is_verified);
    }

    // Apply sorting
    const sortColumn = validatedData.sort_by === 'full_name' ? 'full_name' : 
                      validatedData.sort_by === 'company_name' ? 'company_name' : 'created_at';
    
    query = query.order(sortColumn, { ascending: validatedData.sort_order === 'asc' });

    // Apply pagination
    const offset = (validatedData.page - 1) * validatedData.limit;
    query = query.range(offset, offset + validatedData.limit - 1);

    // Get total count for pagination
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('user_role', ['agent', 'seller']);

    // Execute query
    const { data: agents, error } = await query;

    if (error) {
      console.error('Error searching agents:', error);
      return NextResponse.json({ error: 'Failed to search agents' }, { status: 500 });
    }

    // Transform data to match frontend expectations
    const transformedAgents = agents?.map(agent => ({
      id: agent.user_id,
      name: agent.full_name || 'Unnamed Agent',
      type: agent.user_role,
      phone: agent.phone || 'No phone',
      email: agent.email,
      isVerified: agent.is_verified,
      company: agent.company_name || 'Independent',
      experience: agent.experience_years ? `${agent.experience_years}+ years` : 'Experience not specified',
      specializations: agent.specializations || ['General'],
      bio: agent.bio || 'No bio available',
      avatar: agent.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      coverImage: agent.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Use real cover image or default
      stats: {
        totalProperties: 0, // Will need to query properties table
        propertiesSold: 0, // Will need to query properties table
        propertiesRented: 0, // Will need to query properties table
        clientSatisfaction: 4.5, // Default rating
        responseTime: '2 hours' // Default response time
      },
      contactInfo: {
        address: agent.address || 'Address not specified',
        workingHours: 'Working hours not specified', // Default working hours
        languages: ['English'] // Default languages
      }
    })) || [];

    // Return search results
    return NextResponse.json({
      agents: transformedAgents,
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
    
    console.error('Error in agents search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
