import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSeller, logSellerAction, verifySellerOwnership } from '@/lib/middleware/sellerAuth';

// Inquiry update schema
const inquiryUpdateSchema = z.object({
  status: z.enum(['new', 'responded', 'closed', 'expired']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  response_message: z.string().min(1).max(2000).optional(),
  response_type: z.enum(['accepted', 'declined', 'more_info', 'counter_offer']).optional(),
  counter_offer_price: z.number().positive().optional(),
  available_times: z.array(z.string()).optional(),
  contact_preference: z.enum(['email', 'phone', 'whatsapp']).optional(),
  notes: z.string().max(1000).optional()
});

// GET /api/seller/inquiries/[id] - Get specific inquiry details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with read permissions
    const authResult = await requireSeller(['read:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id: inquiryId } = await params;
    
    // Get inquiry details with property information
    const { data: inquiry, error: inquiryError } = await supabase
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
        notes,
        properties!property_inquiries_property_id_fkey (
          id,
          title,
          property_type,
          listing_type,
          price,
          address,
          city,
          state,
          zip_code,
          country,
          seller_id
        )
      `)
      .eq('id', inquiryId)
      .single();
    
    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Verify seller owns the property
    if (inquiry.properties.seller_id !== sellerUser.id) {
      return NextResponse.json({ error: 'Access denied - Property ownership verification failed' }, { status: 403 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'view_inquiry_details', 'inquiries', inquiryId, {
      inquiry_id: inquiryId,
      property_id: inquiry.property_id,
      buyer_name: inquiry.buyer_name
    });
    
    return NextResponse.json({
      success: true,
      data: inquiry
    });
    
  } catch (error) {
    console.error('Error in GET /api/seller/inquiries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/seller/inquiries/[id] - Update inquiry details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id: inquiryId } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = inquiryUpdateSchema.parse(body);
    
    // Check if inquiry exists and seller owns the property
    const { data: inquiry, error: inquiryError } = await supabase
      .from('property_inquiries')
      .select(`
        id,
        property_id,
        buyer_name,
        status,
        properties!property_inquiries_property_id_fkey (
          seller_id
        )
      `)
      .eq('id', inquiryId)
      .single();
    
    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Verify seller owns the property
    if (inquiry.properties.seller_id !== sellerUser.id) {
      return NextResponse.json({ error: 'Access denied - Property ownership verification failed' }, { status: 403 });
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Add validated fields to update data
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        updateData[key] = validatedData[key as keyof typeof validatedData];
      }
    });
    
    // Update inquiry
    const { data: updatedInquiry, error: updateError } = await supabase
      .from('property_inquiries')
      .update(updateData)
      .eq('id', inquiryId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating inquiry:', updateError);
      return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'update_inquiry', 'inquiries', inquiryId, {
      inquiry_id: inquiryId,
      property_id: inquiry.property_id,
      buyer_name: inquiry.buyer_name,
      updated_fields: Object.keys(validatedData),
      previous_status: inquiry.status,
      new_status: updateData.status || inquiry.status
    });
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: updatedInquiry
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/seller/inquiries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/seller/inquiries/[id] - Soft delete inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate seller with write permissions
    const authResult = await requireSeller(['write:own_inquiries'])(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const { user: sellerUser, supabase } = authResult;
    const { id: inquiryId } = await params;
    
    // Check if inquiry exists and seller owns the property
    const { data: inquiry, error: inquiryError } = await supabase
      .from('property_inquiries')
      .select(`
        id,
        property_id,
        buyer_name,
        status,
        properties!property_inquiries_property_id_fkey (
          seller_id
        )
      `)
      .eq('id', inquiryId)
      .single();
    
    if (inquiryError || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    
    // Verify seller owns the property
    if (inquiry.properties.seller_id !== sellerUser.id) {
      return NextResponse.json({ error: 'Access denied - Property ownership verification failed' }, { status: 403 });
    }
    
    // Soft delete by setting status to 'closed'
    const { data: deletedInquiry, error: deleteError } = await supabase
      .from('property_inquiries')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .select()
      .single();
    
    if (deleteError) {
      console.error('Error deleting inquiry:', deleteError);
      return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }
    
    // Log seller action
    await logSellerAction(supabase, sellerUser.id, 'delete_inquiry', 'inquiries', inquiryId, {
      inquiry_id: inquiryId,
      property_id: inquiry.property_id,
      buyer_name: inquiry.buyer_name,
      previous_status: inquiry.status
    });
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
      data: deletedInquiry
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/seller/inquiries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

