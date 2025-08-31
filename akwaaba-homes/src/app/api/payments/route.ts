import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Payment validation schema
const paymentSchema = z.object({
  propertyId: z.string().uuid(),
  tier: z.enum(['basic', 'standard', 'premium']),
  amount: z.number().positive(),
  paymentMethod: z.enum(['mtn', 'vodafone', 'airteltigo']),
  phoneNumber: z.string().min(10),
  agentId: z.string().uuid()
});

// Tier pricing configuration
const TIER_PRICING = {
  basic: 50,
  standard: 150,
  premium: 300
};

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Verify the agent owns the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, seller_id, tier')
      .eq('id', validatedData.propertyId)
      .eq('seller_id', user.id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
    }

    // Check if payment processing is enabled
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('platform')
      .eq('id', 1)
      .single();

    if (settingsError || !settings?.platform?.payment_processing_enabled) {
      return NextResponse.json({ 
        error: 'Payment processing is currently disabled' 
      }, { status: 400 });
    }

    // Validate tier pricing
    const expectedAmount = TIER_PRICING[validatedData.tier];
    if (validatedData.amount !== expectedAmount) {
      return NextResponse.json({ 
        error: `Invalid amount for ${validatedData.tier} tier. Expected ${expectedAmount} GHS` 
      }, { status: 400 });
    }

    // Generate payment reference
    const paymentReference = `AKW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: paymentReference,
        property_id: validatedData.propertyId,
        agent_id: user.id,
        tier: validatedData.tier,
        amount: validatedData.amount,
        currency: 'GHS',
        payment_method: validatedData.paymentMethod,
        phone_number: validatedData.phoneNumber,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json({ 
        error: 'Failed to create payment record' 
      }, { status: 500 });
    }

    // TODO: Integrate with actual mobile money API
    // For now, we'll simulate the payment process
    const mobileMoneyResponse = await simulateMobileMoneyPayment({
      reference: paymentReference,
      amount: validatedData.amount,
      phoneNumber: validatedData.phoneNumber,
      provider: validatedData.paymentMethod
    });

    if (mobileMoneyResponse.success) {
      // Update payment status to completed
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          transaction_id: mobileMoneyResponse.transactionId,
          completed_at: new Date().toISOString()
        })
        .eq('id', paymentReference);

      // Update property tier
      await supabase
        .from('properties')
        .update({ 
          tier: validatedData.tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', validatedData.propertyId);

      return NextResponse.json({
        success: true,
        paymentReference,
        transactionId: mobileMoneyResponse.transactionId,
        message: 'Payment completed successfully'
      });
    } else {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          failure_reason: mobileMoneyResponse.error,
          failed_at: new Date().toISOString()
        })
        .eq('id', paymentReference);

      return NextResponse.json({
        success: false,
        error: mobileMoneyResponse.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    
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

// Simulate mobile money payment (replace with actual API integration)
async function simulateMobileMoneyPayment({
  reference,
  amount,
  phoneNumber,
  provider
}: {
  reference: string;
  amount: number;
  phoneNumber: string;
  provider: string;
}) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate success/failure based on phone number
  const isSuccess = phoneNumber.endsWith('0') || phoneNumber.endsWith('5');
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      message: 'Payment successful'
    };
  } else {
    return {
      success: false,
      error: 'Insufficient funds or invalid phone number'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payment history for the user
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        id,
        property_id,
        tier,
        amount,
        currency,
        payment_method,
        phone_number,
        status,
        transaction_id,
        created_at,
        completed_at,
        failed_at,
        failure_reason,
        properties (
          id,
          title
        )
      `)
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch payment history' 
      }, { status: 500 });
    }

    return NextResponse.json({
      payments: payments || []
    });

  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}