import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Search query schema for URL parameters
const searchQuerySchema = z.object({
  query: z.string().optional(),
  specialization: z.string().optional(),
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Parse URL parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Validate query parameters
    const validatedData = searchQuerySchema.parse(queryParams);

    // Build search query for developers
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
      .eq('user_role', 'developer');

    console.log('Query built for developers:', query);

    // Apply search filters
    if (validatedData.query) {
      query = query.or(`full_name.ilike.%${validatedData.query}%,company_name.ilike.%${validatedData.query}%,bio.ilike.%${validatedData.query}%`);
    }
    
    if (validatedData.specialization && validatedData.specialization !== 'all') {
      query = query.contains('specializations', [validatedData.specialization]);
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
      .eq('user_role', 'developer');

    // Execute query
    const { data: developers, error } = await query;

    console.log('Developers query result:', { developers, error, count });

    if (error) {
      console.error('Error searching developers:', error);
      return NextResponse.json({ error: 'Failed to search developers' }, { status: 500 });
    }

    // Transform data to match frontend expectations
    const transformedDevelopers = developers?.map(developer => ({
      id: developer.user_id,
      name: developer.full_name || 'Unnamed Developer',
      type: developer.user_role,
      phone: developer.phone || 'No phone',
      email: developer.email,
      isVerified: developer.is_verified,
      company: developer.company_name || 'Independent',
      experience: developer.experience_years ? `${developer.experience_years}+ years` : 'Experience not specified',
      specializations: developer.specializations || ['General'],
      bio: developer.bio || 'No bio available',
      avatar: developer.profile_image || null,
      coverImage: developer.cover_image || null,
      address: developer.address || '',
      city: developer.city || '',
      region: developer.region || '',
      stats: {
        totalProjects: 0, // Will need to query projects table
        projectsCompleted: 0, // Will need to query projects table
        clientSatisfaction: 4.5, // Default rating
        responseTime: '2 hours' // Default response time
      },
      contactInfo: {
        address: developer.address || 'Address not specified',
        workingHours: 'Working hours not specified', // Default working hours
        languages: ['English'] // Default languages
      }
    })) || [];

    // Return search results
    return NextResponse.json({
      agents: transformedDevelopers, // Keep same structure as agents API for compatibility
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
    
    console.error('Error in developers search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
