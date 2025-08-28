import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get platform settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .single();

    if (settingsError) {
      return NextResponse.json({
        error: 'Failed to fetch settings',
        details: settingsError.message
      }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in admin settings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createApiRouteSupabaseClient();

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Update platform settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('platform_settings')
      .update({
        platform: body.platform || {},
        email_templates: body.email_templates || {},
        notification_settings: body.notification_settings || {},
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update settings',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error in admin settings PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
