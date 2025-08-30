import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test API route called');
    
    // Create Supabase client
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
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Test basic Supabase connection
    console.log('🧪 Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🧪 Auth result:', { user: user?.id, error: authError?.message });

    // Test database access
    console.log('🧪 Testing database access...');
    const { data: testData, error: dbError } = await supabase
      .from('property_images')
      .select('count')
      .limit(1);
    
    console.log('🧪 Database test result:', { data: testData, error: dbError?.message });

    // Test manual insert
    console.log('🧪 Testing manual insert...');
    const testInsertData = {
      property_id: '54f8ad71-cdd2-49e2-9e79-e59154bb3334',
      image_url: 'https://test.com/test-image.jpg',
      alt_text: 'Test image from API'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('property_images')
      .insert([testInsertData])
      .select()
      .single();

    console.log('🧪 Insert test result:', { 
      data: insertResult?.id, 
      error: insertError?.message,
      code: insertError?.code,
      details: insertError?.details
    });

    return NextResponse.json({
      message: 'Test completed',
      auth: { user: user?.id, error: authError?.message },
      db: { data: testData, error: dbError?.message },
      insert: { data: insertResult?.id, error: insertError?.message }
    });

  } catch (error) {
    console.error('🧪 Test API error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
