import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for creating an inquiry
const createInquirySchema = z.object({
  property_id: z.string().uuid(),
  buyer_name: z.string().min(1, 'Buyer name is required'),
  buyer_email: z.string().email('Valid email is required'),
  buyer_phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  inquiry_type: z.enum(['general', 'viewing', 'price', 'details']).default('general'),
  preferred_contact: z.enum(['email', 'phone', 'whatsapp']).default('email')
});

// Schema for inquiry filters
const inquiryFiltersSchema = z.object({
  property_id: z.string().uuid().optional(),
  seller_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'responded', 'closed', 'spam']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createInquirySchema.parse(body);
    
    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create Supabase client
    const supabase = await createApiRouteSupabaseClient();
    
    // Create the inquiry
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([{
        ...validatedData,
        ip_address: ip,
        user_agent: userAgent,
        status: 'pending',
        is_anonymous: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      return NextResponse.json(
        { error: 'Failed to create inquiry', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry created successfully',
      inquiry
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Unexpected error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const filters = inquiryFiltersSchema.parse({
      property_id: searchParams.get('property_id') || undefined,
      seller_id: searchParams.get('seller_id') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    });

    // Create Supabase client
    const supabase = await createApiRouteSupabaseClient();

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        property:properties!inquiries_property_id_fkey(
          id,
          title,
          seller_id,
          price,
          currency
        )
      `);

    // Apply filters
    if (filters.property_id) {
      query = query.eq('property_id', filters.property_id);
    }

    if (filters.seller_id) {
      query = query.eq('property.seller_id', filters.seller_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const offset = (filters.page - 1) * filters.limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + filters.limit - 1);

    const { data: inquiries, error } = await query;

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiries: inquiries || [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / filters.limit)
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.format() },
        { status: 400 }
      );
    }

    console.error('Unexpected error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
