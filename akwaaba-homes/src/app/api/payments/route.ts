import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['GHS', 'USD', 'EUR']).default('GHS'),
  paymentMethod: z.enum(['paystack', 'flutterwave', 'stripe']),
  description: z.string().min(1, 'Description is required'),
  metadata: z.object({
    propertyId: z.string().uuid().optional(),
    userId: z.string().uuid(),
    paymentType: z.enum(['premium_listing', 'subscription', 'commission']),
    reference: z.string().optional()
  }),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required')
})

const paymentVerificationSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  paymentMethod: z.enum(['paystack', 'flutterwave', 'stripe'])
})

interface PaymentResponse {
  success: boolean
  transactionId: string
  amount: number
  currency: string
  status: string
  paymentUrl?: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate payment data
    const validationResult = paymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const paymentData = validationResult.data

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    )

    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns the payment or is making a legitimate payment
    if (paymentData.metadata.userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment can only be made for your own account' },
        { status: 403 }
      )
    }

    // Process payment based on method
    let paymentResult: PaymentResponse

    switch (paymentData.paymentMethod) {
      case 'paystack':
        paymentResult = await processPaystackPayment(paymentData)
        break
      case 'flutterwave':
        paymentResult = await processFlutterwavePayment(paymentData)
        break
      case 'stripe':
        paymentResult = await processStripePayment(paymentData)
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported payment method' },
          { status: 400 }
        )
    }

    if (paymentResult.success) {
      // Log payment in database
      await logPayment(supabase, {
        userId: user.id,
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        paymentMethod: paymentData.paymentMethod,
        status: paymentResult.status,
        metadata: paymentData.metadata
      })

      // Update user subscription or property status if needed
      if (paymentData.metadata.paymentType === 'premium_listing' && paymentData.metadata.propertyId) {
        await updatePropertyPremiumStatus(supabase, paymentData.metadata.propertyId, user.id)
      }
    }

    return NextResponse.json(paymentResult)

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const paymentMethod = searchParams.get('paymentMethod')

    if (!transactionId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Transaction ID and payment method are required' },
        { status: 400 }
      )
    }

    const validationResult = paymentVerificationSchema.safeParse({
      transactionId,
      paymentMethod: paymentMethod as 'paystack' | 'flutterwave' | 'stripe'
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid verification data' },
        { status: 400 }
      )
    }

    const { transactionId: txId, paymentMethod: method } = validationResult.data

    // Verify payment status
    const paymentStatus = await verifyPaymentStatus(txId, method)

    return NextResponse.json({
      transactionId: txId,
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      verified: paymentStatus.verified,
      message: paymentStatus.message
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}

// Payment Gateway Implementations
async function processPaystackPayment(paymentData: any): Promise<PaymentResponse> {
  try {
    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: paymentData.amount * 100, // Convert to kobo (smallest currency unit)
        email: paymentData.customerEmail,
        currency: paymentData.currency,
        reference: paymentData.metadata.reference || `PAY_${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: paymentData.customerName
            },
            {
              display_name: 'Property ID',
              variable_name: 'property_id',
              value: paymentData.metadata.propertyId || ''
            }
          ]
        }
      })
    })

    const paystackData = await paystackResponse.json()

    if (paystackData.status && paystackData.data) {
      return {
        success: true,
        transactionId: paystackData.data.reference,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        paymentUrl: paystackData.data.authorization_url,
        message: 'Payment initialized successfully'
      }
    } else {
      throw new Error(paystackData.message || 'Paystack payment failed')
    }

  } catch (error) {
    console.error('Paystack payment error:', error)
    return {
      success: false,
      transactionId: '',
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'failed',
      message: 'Paystack payment processing failed'
    }
  }
}

async function processFlutterwavePayment(paymentData: any): Promise<PaymentResponse> {
  try {
    // Initialize Flutterwave payment
    const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: paymentData.metadata.reference || `FLW_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        customer: {
          email: paymentData.customerEmail,
          name: paymentData.customerName
        },
        customizations: {
          title: 'Akwaaba Homes',
          description: paymentData.description,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
        },
        meta: {
          property_id: paymentData.metadata.propertyId || '',
          payment_type: paymentData.metadata.paymentType
        }
      })
    })

    const flutterwaveData = await flutterwaveResponse.json()

    if (flutterwaveData.status === 'success' && flutterwaveData.data) {
      return {
        success: true,
        transactionId: flutterwaveData.data.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        paymentUrl: flutterwaveData.data.link,
        message: 'Payment initialized successfully'
      }
    } else {
      throw new Error(flutterwaveData.message || 'Flutterwave payment failed')
    }

  } catch (error) {
    console.error('Flutterwave payment error:', error)
    return {
      success: false,
      transactionId: '',
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'failed',
      message: 'Flutterwave payment processing failed'
    }
  }
}

async function processStripePayment(paymentData: any): Promise<PaymentResponse> {
  try {
    // Initialize Stripe payment
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: (paymentData.amount * 100).toString(), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        description: paymentData.description,
        metadata: JSON.stringify({
          property_id: paymentData.metadata.propertyId || '',
          payment_type: paymentData.metadata.paymentType,
          user_id: paymentData.metadata.userId
        })
      })
    })

    const stripeData = await stripeResponse.json()

    if (stripeData.id) {
      return {
        success: true,
        transactionId: stripeData.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        message: 'Stripe payment intent created successfully'
      }
    } else {
      throw new Error(stripeData.error?.message || 'Stripe payment failed')
    }

  } catch (error) {
    console.error('Stripe payment error:', error)
    return {
      success: false,
      transactionId: '',
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'failed',
      message: 'Stripe payment processing failed'
    }
  }
}

// Payment Verification
async function verifyPaymentStatus(transactionId: string, paymentMethod: string): Promise<any> {
  try {
    switch (paymentMethod) {
      case 'paystack':
        return await verifyPaystackPayment(transactionId)
      case 'flutterwave':
        return await verifyFlutterwavePayment(transactionId)
      case 'stripe':
        return await verifyStripePayment(transactionId)
      default:
        throw new Error('Unsupported payment method')
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return {
      verified: false,
      status: 'failed',
      message: 'Payment verification failed'
    }
  }
}

async function verifyPaystackPayment(transactionId: string): Promise<any> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
  })

  const data = await response.json()

  if (data.status && data.data) {
    return {
      verified: true,
      status: data.data.status,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      message: 'Payment verified successfully'
    }
  }

  return {
    verified: false,
    status: 'failed',
    message: data.message || 'Payment verification failed'
  }
}

async function verifyFlutterwavePayment(transactionId: string): Promise<any> {
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
    }
  })

  const data = await response.json()

  if (data.status === 'success' && data.data) {
    return {
      verified: true,
      status: data.data.status,
      amount: data.data.amount,
      currency: data.data.currency,
      message: 'Payment verified successfully'
    }
  }

  return {
    verified: false,
    status: 'failed',
    message: data.message || 'Payment verification failed'
  }
}

async function verifyStripePayment(transactionId: string): Promise<any> {
  const response = await fetch(`https://api.stripe.com/v1/payment_intents/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
    }
  })

  const data = await response.json()

  if (data.id) {
    return {
      verified: true,
      status: data.status,
      amount: data.amount / 100,
      currency: data.currency,
      message: 'Payment verified successfully'
    }
  }

  return {
    verified: false,
    status: 'failed',
    message: 'Payment verification failed'
  }
}

// Database Operations
async function logPayment(supabase: any, paymentData: any) {
  try {
    const { error } = await supabase
      .from('payments')
      .insert({
        user_id: paymentData.userId,
        transaction_id: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.paymentMethod,
        status: paymentData.status,
        metadata: paymentData.metadata,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging payment:', error)
    }
  } catch (error) {
    console.error('Error logging payment to database:', error)
  }
}

async function updatePropertyPremiumStatus(supabase: any, propertyId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('properties')
      .update({
        is_premium: true,
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .eq('owner_id', userId)

    if (error) {
      console.error('Error updating property premium status:', error)
    }
  } catch (error) {
    console.error('Error updating property premium status:', error)
  }
}
