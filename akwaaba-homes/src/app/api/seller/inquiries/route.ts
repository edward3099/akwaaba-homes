import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction, verifySellerOwnership } from '@/lib/middleware/sellerAuth';

// Inquiry management schemas
const inquiryResponseSchema = z.object({
  inquiry_id: z.string().uuid(),
  response_message: z.string().min(1).max(2000),
  response_type: z.enum(['accepted', 'declined', 'more_info', 'counter_offer']).optional(),
  counter_offer_price: z.number().positive().optional(),
  available_times: z.array(z.string()).optional(),
  contact_preference: z.enum(['email', 'phone', 'whatsapp']).optional()
});

const inquiryQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  status: z.enum(['new', 'responded', 'closed', 'expired']).optional(),
  property_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

// GET /api/seller/inquiries - List seller's property inquiries
export async function GET(request: NextRequest) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    const queryData = inquiryQuerySchema.parse(queryParams);
    const { page, limit, status, property_id, sort_by, sort_order, priority } = queryData;
    
    // Build base query for seller's inquiries
    let query = supabase
      .from('property_inquiries')
      .select(`
        id,
        property_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        message,
        status,
        priority,
        created_at,
        updated_at,
        response_message,
        response_type,
        counter_offer_price,
        available_times,
        contact_preference,
        properties!property_inquiries_property_id_fkey (
          id,
          title,
          property_type,
          listing_type,
          price,
          address,
          city
        )
      `)
      .eq('seller_id', sellerUser.id);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (property_id) {
      query = query.eq('property_id', property_id);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: inquiries, error: queryError } = await query;
    
    if (queryError) {
      console.error('Error fetching seller inquiries:', queryError);
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('property_inquiries')
      .select('*', { count: 'exact' })
      .eq('seller_id', sellerUser.id);
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'list_inquiries', 'inquiries', undefined, {
      filters: { status, property_id, priority },
      pagination: { page, limit },
      sorting: { sort_by, sort_order }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        inquiries: inquiries || [],
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
    
    console.error('Error in GET /api/seller/inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/seller/inquiries - Respond to inquiry
export async function POST(request: NextRequest) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = inquiryResponseSchema.parse(body);
    const { inquiry_id, response_message, response_type, counter_offer_price, available_times, contact_preference } = validatedData;
    
    // Check if inquiry exists and seller owns the property
    const { data: inquiry, error: inquiryError } = await supabase
      .from('property_inquiries')
      .select(`
        id,
        property_id,
        buyer_name,
        buyer_email,
        status,
        properties!property_inquiries_property_id_fkey (
          seller_id
        )
      `)
      .eq('id', inquiry_id)
      .single();
    
    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Verify seller owns the property
    if (inquiry.properties.seller_id !== sellerUser.id) {
      return NextResponse.json({ error: 'Access denied - Property ownership verification failed' }, { status: 403 });
    }
    
    // Check if inquiry is already responded to
    if (inquiry.status === 'responded' || inquiry.status === 'closed') {
      return NextResponse.json({ error: 'Inquiry has already been responded to' }, { status: 400 });
    }
    
    // Update inquiry with response
    const updateData: any = {
      status: 'responded',
      response_message,
      response_type: response_type || 'accepted',
      updated_at: new Date().toISOString()
    };
    
    if (counter_offer_price) {
      updateData.counter_offer_price = counter_offer_price;
    }
    
    if (available_times && available_times.length > 0) {
      updateData.available_times = available_times;
    }
    
    if (contact_preference) {
      updateData.contact_preference = contact_preference;
    }
    
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('property_inquiries')
      .update(updateData)
      .eq('id', inquiry_id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating inquiry:', updateError);
      return NextResponse.json({ error: 'Failed to respond to inquiry' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'respond_to_inquiry', 'inquiries', inquiry_id, {
      inquiry_id,
      response_type: updateData.response_type,
      has_counter_offer: !!counter_offer_price,
      buyer_name: inquiry.buyer_name,
      property_id: inquiry.property_id
    });
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry responded to successfully',
      data: updatedInquiry
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/seller/inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/seller/inquiries - Bulk inquiry operations
export async function PUT(request: NextRequest) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body for bulk operations
    const bulkOperationSchema = z.object({
      action: z.enum(['update_status', 'mark_priority', 'archive']),
      inquiry_ids: z.array(z.string().uuid()).min(1),
      data: z.record(z.string(), z.any()).optional()
    });
    
    const validatedData = bulkOperationSchema.parse(body);
    const { action, inquiry_ids, data } = validatedData;
    
    const results = [];
    const errors = [];
    
    // Process each inquiry operation
    for (const inquiryId of inquiry_ids) {
      try {
        // Check if inquiry exists and seller owns the property
        const { data: inquiry, error: checkError } = await supabase
          .from('property_inquiries')
          .select(`
            id,
            property_id,
            properties!property_inquiries_property_id_fkey (
              seller_id
            )
          `)
          .eq('id', inquiryId)
          .single();
        
        if (checkError || !inquiry) {
          errors.push({ inquiry_id: inquiryId, error: 'Inquiry not found' });
          continue;
        }
        
        // Verify seller owns the property
        if (inquiry.properties.seller_id !== sellerUser.id) {
          errors.push({ inquiry_id: inquiryId, error: 'Access denied' });
          continue;
        }
        
        let result;
        
        switch (action) {
          case 'update_status':
            if (!data?.status) {
              errors.push({ inquiry_id: inquiryId, error: 'Status is required for update_status action' });
              continue;
            }
            
            const { data: statusUpdated, error: statusError } = await supabase
              .from('property_inquiries')
              .update({
                status: data.status,
                updated_at: new Date().toISOString()
              })
              .eq('id', inquiryId)
              .select()
              .single();
            
            if (statusError) {
              errors.push({ inquiry_id: inquiryId, error: 'Status update failed' });
              continue;
            }
            
            result = statusUpdated;
            break;
          
          case 'mark_priority':
            if (!data?.priority) {
              errors.push({ inquiry_id: inquiryId, error: 'Priority is required for mark_priority action' });
              continue;
            }
            
            const { data: priorityUpdated, error: priorityError } = await supabase
              .from('property_inquiries')
              .update({
                priority: data.priority,
                updated_at: new Date().toISOString()
              })
              .eq('id', inquiryId)
              .select()
              .single();
            
            if (priorityError) {
              errors.push({ inquiry_id: inquiryId, error: 'Priority update failed' });
              continue;
            }
            
            result = priorityUpdated;
            break;
          
          case 'archive':
            const { data: archived, error: archiveError } = await supabase
              .from('property_inquiries')
              .update({
                status: 'closed',
                updated_at: new Date().toISOString()
              })
              .eq('id', inquiryId)
              .select()
              .single();
            
            if (archiveError) {
              errors.push({ inquiry_id: inquiryId, error: 'Archive failed' });
              continue;
            }
            
            result = archived;
            break;
          
          default:
            errors.push({ inquiry_id: inquiryId, error: 'Invalid action' });
            continue;
        }
        
        results.push({
          inquiry_id: inquiryId,
          action,
          success: true,
          data: result
        });
        
      } catch (error) {
        errors.push({ 
          inquiry_id: inquiryId, 
          error: 'Processing error' 
        });
      }
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, `bulk_${action}_inquiries`, 'inquiries', undefined, {
      action,
      inquiry_ids,
      data,
      successful: results.length,
      failed: errors.length
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed ${inquiry_ids.length} inquiries`,
      data: {
        results,
        errors,
        summary: {
          total: inquiry_ids.length,
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
    
    console.error('Error in PUT /api/seller/inquiries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
