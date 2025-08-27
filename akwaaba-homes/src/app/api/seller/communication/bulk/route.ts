import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction } from '@/lib/middleware/sellerAuth';

// Bulk message schema
const bulkMessageSchema = z.object({
  inquiry_ids: z.array(z.string().uuid()).min(1),
  message: z.string().min(1).max(2000),
  message_type: z.enum(['response', 'follow_up', 'offer', 'information']).default('response'),
  scheduled_send: z.string().optional()
});

// POST /api/seller/communication/bulk - Send bulk messages
export async function POST(request: NextRequest) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_communications'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const body = await request.json();
    
    // Validate request body
    const validatedData = bulkMessageSchema.parse(body);
    const { inquiry_ids, message, message_type, scheduled_send } = validatedData;
    
    // Verify all inquiries belong to the seller
    const { data: inquiries, error: inquiryError } = await supabase
      .from('property_inquiries')
      .select('id, seller_id, buyer_email, buyer_name')
      .in('id', inquiry_ids);
    
    if (inquiryError || !inquiries) {
      return NextResponse.json({ error: 'Failed to verify inquiries' }, { status: 500 });
    }
    
    const unauthorizedInquiries = inquiries.filter(i => i.seller_id !== sellerUser.id);
    if (unauthorizedInquiries.length > 0) {
      return NextResponse.json({ error: 'Access denied to some inquiries' }, { status: 403 });
    }
    
    // Create bulk messages
    const messagesData = inquiry_ids.map(inquiry_id => ({
      inquiry_id,
      seller_id: sellerUser.id,
      message,
      message_type,
      status: scheduled_send ? 'scheduled' : 'pending',
      scheduled_send: scheduled_send || null,
      attachments: []
    }));
    
    const { data: newMessages, error: createError } = await supabase
      .from('seller_messages')
      .insert(messagesData)
      .select();
    
    if (createError) {
      console.error('Error creating bulk messages:', createError);
      return NextResponse.json({ error: 'Failed to send bulk messages' }, { status: 500 });
    }
    
    // If immediate send (not scheduled), trigger delivery for each message
    if (!scheduled_send) {
      for (const newMessage of newMessages || []) {
        const inquiry = inquiries.find(i => i.id === newMessage.inquiry_id);
        if (inquiry) {
          await sendMessageToBuyer(supabase, newMessage, inquiry);
        }
      }
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'send_bulk_messages', 'seller_messages', undefined, {
      inquiry_count: inquiry_ids.length,
      message_type,
      scheduled_send
    });
    
    return NextResponse.json({
      success: true,
      data: {
        messages_sent: newMessages?.length || 0,
        status: scheduled_send ? 'scheduled' : 'sent',
        inquiries_contacted: inquiry_ids
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/seller/communication/bulk:', error);
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
    console.log(`Bulk message sent to ${inquiry.buyer_email}: ${message.message}`);
    
    // In a real implementation, you would:
    // 1. Send email to buyer
    // 2. Send SMS if phone number available
    // 3. Update delivery status
    // 4. Handle delivery failures
    
  } catch (error) {
    console.error('Error sending bulk message to buyer:', error);
    
    // Update message status to failed
    await supabase
      .from('seller_messages')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', message.id);
  }
}

