import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction } from '@/lib/middleware/sellerAuth';

// Communication schemas
const messageSchema = z.object({
  inquiry_id: z.string().uuid(),
  message: z.string().min(1).max(2000),
  message_type: z.enum(['response', 'follow_up', 'offer', 'information']).default('response'),
  attachments: z.array(z.string().url()).optional(),
  scheduled_send: z.string().optional() // ISO date string for scheduled messages
});

const communicationQuerySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(20),
  inquiry_id: z.string().uuid().optional(),
  message_type: z.enum(['response', 'follow_up', 'offer', 'information']).optional(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']).optional(),
  sort_by: z.enum(['created_at', 'scheduled_send', 'message_type']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// GET /api/seller/communication - List seller's communication history
export async function GET(request: NextRequest) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_communications'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = communicationQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit, inquiry_id, message_type, status, sort_by, sort_order } = queryData;
    
    // Build base query for seller's communications
    let query = supabase
      .from('seller_messages')
      .select(`
        id,
        inquiry_id,
        message,
        message_type,
        status,
        created_at,
        scheduled_send,
        delivered_at,
        read_at,
        property_inquiries!seller_messages_inquiry_id_fkey (
          id,
          buyer_name,
          buyer_email,
          buyer_phone,
          message: original_message,
          status,
          priority,
          properties!property_inquiries_property_id_fkey (
            id,
            title,
            property_type,
            listing_type,
            price
          )
        )
      `)
      .eq('seller_id', sellerUser.id);
    
    // Apply filters
    if (inquiry_id) {
      query = query.eq('inquiry_id', inquiry_id);
    }
    
    if (message_type) {
      query = query.eq('message_type', message_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: messages, error: queryError } = await query;
    
    if (queryError) {
      console.error('Error fetching seller communications:', queryError);
      return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
    }
    
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('seller_messages')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerUser.id);
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'view_communications', 'seller_messages', undefined, {
      page,
      limit,
      inquiry_id,
      message_type,
      status
    });
    
    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
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
    
    console.error('Error in GET /api/seller/communication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/seller/communication - Send message to buyer
export async function POST(request: NextRequest) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_communications'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = messageSchema.parse(body);
    const { inquiry_id, message, message_type, attachments, scheduled_send } = validatedData;
    
    // Verify the inquiry belongs to the seller
    const { data: inquiry, error: inquiryError } = await supabase
      .from('property_inquiries')
      .select('id, seller_id, buyer_email, buyer_name, properties!property_inquiries_property_id_fkey(title)')
      .eq('id', inquiry_id)
      .single();
    
    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    if (inquiry.seller_id !== sellerUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Create the message
    const messageData = {
      inquiry_id,
      seller_id: sellerUser.id,
      message,
      message_type,
      status: scheduled_send ? 'scheduled' : 'pending',
      scheduled_send: scheduled_send || null,
      attachments: attachments || []
    };
    
    const { data: newMessage, error: createError } = await supabase
      .from('seller_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating message:', createError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    // If immediate send (not scheduled), trigger delivery
    if (!scheduled_send) {
      await sendMessageToBuyer(supabase, newMessage, inquiry);
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'send_message', 'seller_messages', newMessage.id, {
      inquiry_id,
      message_type,
      scheduled_send
    });
    
    return NextResponse.json({
      success: true,
      data: {
        message: newMessage,
        status: scheduled_send ? 'scheduled' : 'sent'
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/seller/communication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to send message to buyer
async function sendMessageToBuyer(supabase: any, message: any, inquiry: any) {
  try {
    // Update message status to sent
    await supabase
      .from('seller_messages')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', message.id);
    
    // Update inquiry status to responded if this is a response
    if (message.message_type === 'response') {
      await supabase
        .from('property_inquiries')
        .update({ 
          status: 'responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiry.id);
    }
    
    // Here you would typically integrate with email/SMS service
    // For now, we'll just log the action
    console.log(`Message sent to ${inquiry.buyer_email}: ${message.message}`);
    
    // In a real implementation, you would:
    // 1. Send email to buyer
    // 2. Send SMS if phone number available
    // 3. Update delivery status
    // 4. Handle delivery failures
    
  } catch (error) {
    console.error('Error sending message to buyer:', error);
    
    // Update message status to failed
    await supabase
      .from('seller_messages')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', message.id);
  }
}
