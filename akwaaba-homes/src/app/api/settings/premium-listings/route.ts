import { NextResponse } from 'next/server';
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
