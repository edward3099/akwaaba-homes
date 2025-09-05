import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      supabaseUrlSet: !!supabaseUrl,
      supabaseAnonKeySet: !!supabaseAnonKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'Not set',
      message: 'Environment variables test'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Environment variables test failed'
    }, { status: 500 });
  }
}
