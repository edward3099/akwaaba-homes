import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with proper server-side authentication
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Authenticated user:', user.id);

    const body = await request.json();
    const { propertyId, amount, currency, provider, phoneNumber, tier } = body;
    
    console.log('Request body:', { propertyId, amount, currency, provider, phoneNumber, tier });

    // Validate required fields (propertyId can be null for pending payments)
    if (!amount || !currency || !provider || !phoneNumber || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get payment settings from platform_settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('platform')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Error fetching payment settings:', settingsError);
      return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
    }

    const merchantNumber = settings.platform?.mobile_money_merchant_number;
    if (!merchantNumber) {
      return NextResponse.json({ error: 'Merchant number not configured' }, { status: 500 });
    }

    // Generate unique payment reference
    const paymentId = uuidv4();
    const reference = `AKW${Date.now().toString().slice(-8)}`;

    // Create payment instructions based on provider
    const getPaymentInstructions = (provider: string) => {
      const instructions = {
        mtn: {
          provider: 'MTN Mobile Money',
          steps: [
            `Dial *170# on your phone`,
            `Select "Send Money"`,
            `Enter merchant number: ${merchantNumber}`,
            `Enter amount: GHS ${amount}`,
            `Enter reference: ${reference}`,
            `Enter your PIN to confirm`
          ],
          note: 'Make sure to use the exact reference number provided above.'
        },
        vodafone: {
          provider: 'Vodafone Cash',
          steps: [
            `Dial *110# on your phone`,
            `Select "Transfer Money"`,
            `Enter merchant number: ${merchantNumber}`,
            `Enter amount: GHS ${amount}`,
            `Enter reference: ${reference}`,
            `Enter your PIN to confirm`
          ],
          note: 'Make sure to use the exact reference number provided above.'
        },
        airteltigo: {
          provider: 'AirtelTigo Money',
          steps: [
            `Dial *110# on your phone`,
            `Select "Send Money"`,
            `Enter merchant number: ${merchantNumber}`,
            `Enter amount: GHS ${amount}`,
            `Enter reference: ${reference}`,
            `Enter your PIN to confirm`
          ],
          note: 'Make sure to use the exact reference number provided above.'
        }
      };

      return instructions[provider as keyof typeof instructions] || instructions.mtn;
    };

    const paymentInstructions = getPaymentInstructions(provider);

    // Create payment record in database
    const paymentData = {
      id: paymentId,
      property_id: propertyId || null, // Allow null for pending payments
      agent_id: user.id,
      amount: amount,
      currency: currency,
      provider: provider,
      phone_number: phoneNumber,
      merchant_number: merchantNumber,
      reference: reference,
      tier: tier,
      status: 'pending',
      payment_method: provider,
      instructions: paymentInstructions,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
    };

    // Insert payment record
    console.log('About to insert payment data:', paymentData);
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record - Full details:', {
        error: paymentError,
        message: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint,
        code: paymentError.code
      });
      return NextResponse.json({ 
        error: 'Failed to create payment record',
        details: paymentError.message,
        code: paymentError.code
      }, { status: 500 });
    }

    console.log('Payment created successfully:', payment);

    // Return payment data to frontend
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        phoneNumber: payment.phone_number,
        merchantNumber: payment.merchant_number,
        reference: payment.reference,
        instructions: payment.instructions,
        expiresAt: payment.expires_at
      }
    });

  } catch (error) {
    console.error('Error in mobile money payment API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    // Create Supabase client with proper server-side authentication
    const supabase = await createApiRouteSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('agent_id', user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check if payment has expired
    const now = new Date();
    const expiresAt = new Date(payment.expires_at);
    
    if (now > expiresAt && payment.status === 'pending') {
      // Update payment status to expired
      await supabase
        .from('payments')
        .update({ status: 'expired' })
        .eq('id', paymentId);
      
      return NextResponse.json({ 
        status: 'expired',
        message: 'Payment has expired'
      });
    }

    // For now, we'll simulate payment verification
    // In a real implementation, you would integrate with mobile money APIs
    // or use webhooks to verify payments
    
    // Simulate payment completion (remove this in production)
    if (payment.status === 'pending') {
      // In production, this would be triggered by a webhook or manual verification
      // For demo purposes, we'll keep it as pending
    }

    return NextResponse.json({
      status: payment.status,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        reference: payment.reference,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Error in payment verification API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}