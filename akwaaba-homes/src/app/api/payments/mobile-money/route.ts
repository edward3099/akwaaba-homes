import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Mobile Money payment schema
const mobileMoneyPaymentSchema = z.object({
  propertyId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.literal('GHS'),
  provider: z.enum(['mtn', 'vodafone', 'airteltigo']),
  phoneNumber: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Invalid Ghana phone number'),
  tier: z.enum(['premium', 'featured', 'urgent']),
});

// Initialize payment
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = mobileMoneyPaymentSchema.parse(body);

    // Get admin settings to check if payment processing is enabled
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('payment_processing_enabled, mobile_money_merchant_number')
      .single();

    if (!settings?.payment_processing_enabled) {
      return NextResponse.json({ 
        error: 'Payment processing is currently disabled' 
      }, { status: 400 });
    }

    if (!settings?.mobile_money_merchant_number) {
      return NextResponse.json({ 
        error: 'Mobile money merchant number not configured. Please contact admin.' 
      }, { status: 400 });
    }

    // Verify property exists and belongs to user
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, seller_id, is_featured')
      .eq('id', validatedData.propertyId)
      .eq('seller_id', user.id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ 
        error: 'Property not found or access denied' 
      }, { status: 404 });
    }

    // Check if property is already premium (using is_featured as a proxy for premium)
    if (validatedData.tier === 'premium' && property.is_featured) {
      return NextResponse.json({ 
        error: 'Property is already premium' 
      }, { status: 400 });
    }

    // Generate payment reference
    const paymentRef = `AKW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: paymentRef,
        property_id: validatedData.propertyId,
        agent_id: user.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        payment_method: 'mobile_money',
        payment_provider: validatedData.provider,
        phone_number: validatedData.phoneNumber,
        tier: validatedData.tier,
        status: 'pending',
        merchant_number: settings.mobile_money_merchant_number,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json({ 
        error: 'Failed to create payment record' 
      }, { status: 500 });
    }

    // Return payment instructions
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.payment_provider,
        phoneNumber: payment.phone_number,
        merchantNumber: payment.merchant_number,
        reference: payment.id,
        instructions: generatePaymentInstructions(payment),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      }
    });

  } catch (error) {
    console.error('Mobile money payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid payment data', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Verify payment status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('agent_id', user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // In a real implementation, you would check with the mobile money provider
    // For now, we'll simulate the verification process
    const isVerified = await verifyMobileMoneyPayment(payment);

    if (isVerified && payment.status === 'pending') {
      // Update payment status
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      // Update property tier (using is_featured for premium)
      if (payment.tier === 'premium') {
        await supabase
          .from('properties')
          .update({ 
            is_featured: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.property_id);
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Payment verified and property upgraded successfully'
      });
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      message: payment.status === 'pending' ? 'Payment still pending' : 'Payment already processed'
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function generatePaymentInstructions(payment: any) {
  const providerNames = {
    mtn: 'MTN Mobile Money',
    vodafone: 'Vodafone Cash',
    airteltigo: 'AirtelTigo Money'
  };

  return {
    provider: providerNames[payment.payment_provider as keyof typeof providerNames],
    steps: [
      `Dial *170# on your ${providerNames[payment.payment_provider as keyof typeof providerNames]} registered phone`,
      'Select "Send Money"',
      `Enter merchant number: ${payment.merchant_number}`,
      `Enter amount: GHS ${payment.amount}`,
      `Enter reference: ${payment.id}`,
      'Confirm transaction',
      'Wait for confirmation SMS'
    ],
    note: 'Payment will be verified automatically within 15 minutes'
  };
}

async function verifyMobileMoneyPayment(payment: any): Promise<boolean> {
  // In a real implementation, this would:
  // 1. Call the mobile money provider's API
  // 2. Check transaction status using the reference number
  // 3. Verify amount and merchant number
  
  // For demo purposes, we'll simulate a 70% success rate
  return Math.random() > 0.3;
}
