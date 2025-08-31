import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role key for direct database access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op for service role client
          },
        },
      }
    );

    // Fetch payment settings from platform_settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('platform')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Error fetching payment settings:', settingsError);
      return NextResponse.json({ error: 'Failed to fetch payment settings' }, { status: 500 });
    }

    // Return only the payment-related settings that agents need
    const paymentSettings = {
      payment_processing_enabled: settings.platform?.payment_processing_enabled || false,
      premium_listing_price: settings.platform?.premium_listing_price || 50
    };

    return NextResponse.json({ 
      success: true, 
      paymentSettings 
    });

  } catch (error) {
    console.error('Error in payment settings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
