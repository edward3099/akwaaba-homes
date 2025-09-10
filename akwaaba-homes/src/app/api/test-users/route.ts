import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    console.log('Testing user query with anonymous key...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, is_verified')
      .eq('id', '276631ac-b4dc-4137-889e-2515d666a208');
    
    console.log('User query result:', { users, error });
    
    return Response.json({
      success: true,
      users,
      error: error ? error.message : null
    });
  } catch (err) {
    console.error('Error in test-users API:', err);
    return Response.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
