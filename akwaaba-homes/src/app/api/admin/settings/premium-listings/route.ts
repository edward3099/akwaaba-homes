import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the premium listings setting from the settings table
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .select('premium_listings_enabled')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      // If no settings exist, return default value
      return NextResponse.json({ premium_listings_enabled: true });
    }

    return NextResponse.json({ 
      premium_listings_enabled: settings.premium_listings_enabled ?? true 
    });

  } catch (error) {
    console.error('Error fetching premium listings setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { premium_listings_enabled } = await request.json();

    if (typeof premium_listings_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Update the setting
    const { error } = await supabase
      .from('platform_settings')
      .update({ 
        premium_listings_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating premium listings setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ 
      premium_listings_enabled,
      message: 'Premium listings setting updated successfully' 
    });

  } catch (error) {
    console.error('Error updating premium listings setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}