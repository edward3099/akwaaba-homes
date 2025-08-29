import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth API called');
    
    const supabase = await createApiRouteSupabaseClient();
    console.log('Supabase client created successfully');
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check result:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    console.log('Profile check result:', { profile, error: profileError });

    if (profileError || !profile) {
      console.log('Profile fetch failed:', profileError);
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 500 });
    }

    if (profile.user_role !== 'admin') {
      console.log('Admin role check failed:', { userRole: profile.user_role });
      return NextResponse.json({ error: 'Forbidden - Admin role required', userRole: profile.user_role }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Authentication successful',
      user: { id: user.id, role: profile.user_role }
    });
    
  } catch (error) {
    console.error('Error in test auth API:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
