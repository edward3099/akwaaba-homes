import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    if (settingsError && settingsError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return default settings if none exist
    const defaultSettings = {
      platform: {
        siteName: 'AkwaabaHomes',
        siteDescription: 'Your trusted real estate marketplace in Ghana',
        contactEmail: 'admin@akwaabahomes.com',
        supportPhone: '+233 20 123 4567',
        commissionRate: 5.0,
        maxImagesPerProperty: 10,
        enableUserRegistration: true,
        enableAgentApplications: true,
        requireEmailVerification: true,
        enableTwoFactorAuth: false,
        maintenanceMode: false,
        debugMode: false,
      },
      emailTemplates: {
        welcomeEmail: {
          subject: 'Welcome to AkwaabaHomes! 🏠',
          body: 'Dear {{user_name}},\n\nWelcome to AkwaabaHomes! We\'re excited to have you join our community of real estate professionals and home seekers.\n\nBest regards,\nThe AkwaabaHomes Team',
        },
        propertyApproved: {
          subject: 'Your Property Has Been Approved! ✅',
          body: 'Dear {{agent_name}},\n\nGreat news! Your property listing "{{property_title}}" has been approved and is now live on our platform.\n\nBest regards,\nThe AkwaabaHomes Team',
        },
        propertyRejected: {
          subject: 'Property Listing Update',
          body: 'Dear {{agent_name}},\n\nWe regret to inform you that your property listing "{{property_title}}" requires some modifications before it can be approved.\n\nPlease review our guidelines and resubmit.\n\nBest regards,\nThe AkwaabaHomes Team',
        },
        agentApproved: {
          subject: 'Agent Application Approved! 🎉',
          body: 'Dear {{agent_name}},\n\nCongratulations! Your agent application has been approved. You can now start listing properties on our platform.\n\nBest regards,\nThe AkwaabaHomes Team',
        },
        agentRejected: {
          subject: 'Agent Application Update',
          body: 'Dear {{applicant_name}},\n\nThank you for your interest in becoming an agent on AkwaabaHomes. Unfortunately, we are unable to approve your application at this time.\n\nBest regards,\nThe AkwaabaHomes Team',
        },
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        whatsappNotifications: true,
        notifyOnNewUser: true,
        notifyOnNewProperty: true,
        notifyOnAgentApplication: true,
        notifyOnSystemIssues: true,
      },
    };

    return NextResponse.json(settings || defaultSettings);
  } catch (error) {
    console.error('Error in admin settings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { platform, emailTemplates, notifications } = body;

    // Validate required fields
    if (!platform || !emailTemplates || !notifications) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert settings to database
    const { data, error } = await supabase
      .from('platform_settings')
      .upsert({
        id: 1, // Single row for platform settings
        platform,
        email_templates: emailTemplates,
        notification_settings: notifications,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Settings updated successfully', data });
  } catch (error) {
    console.error('Error in admin settings PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
