import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with proper cookie handling
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role, verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin', 'moderator'].includes(profile.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get platform settings
    const { data: settings, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json({ 
        error: 'Failed to fetch platform settings' 
      }, { status: 500 });
    }

    return NextResponse.json({
      settings: settings || {
        id: 1,
        platform: {
          payment_processing_enabled: false,
          user_registration_enabled: true,
          property_listings_enabled: true,
          agent_verification_enabled: true,
          analytics_dashboard_enabled: true,
          mobile_app_enabled: false
        },
        email_templates: {},
        notification_settings: {
          email_notifications_enabled: true,
          sms_notifications_enabled: false,
          push_notifications_enabled: false,
          admin_alerts_enabled: true
        }
      }
    });

  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Create Supabase client with proper cookie handling
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
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
            }
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role, verification_status')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'super_admin', 'moderator'].includes(profile.user_role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { platform, notification_settings, email_templates } = body;

    // Validate the settings structure
    if (platform && typeof platform !== 'object') {
      return NextResponse.json({
        error: 'Invalid platform settings format'
      }, { status: 400 });
    }

    if (notification_settings && typeof notification_settings !== 'object') {
      return NextResponse.json({
        error: 'Invalid notification settings format'
      }, { status: 400 });
    }

    if (email_templates && typeof email_templates !== 'object') {
      return NextResponse.json({
        error: 'Invalid email templates format'
      }, { status: 400 });
    }

    // Update platform settings
    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    if (platform) {
      updateData.platform = platform;
    }

    if (notification_settings) {
      updateData.notification_settings = notification_settings;
    }

    if (email_templates) {
      updateData.email_templates = email_templates;
    }

    const { data: updatedSettings, error: updateError } = await supabase
      .from('platform_settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      console.error('Settings update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update platform settings' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });

  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}