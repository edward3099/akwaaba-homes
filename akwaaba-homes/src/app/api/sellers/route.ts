import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerIds = searchParams.get('ids');
    
    if (!sellerIds) {
      return Response.json({ error: 'Missing seller IDs' }, { status: 400 });
    }
    
    const ids = sellerIds.split(',').filter(Boolean);
    console.log('Fetching sellers for IDs:', ids);
    
    const { data: sellers, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, is_verified')
      .in('id', ids);
    
    if (error) {
      console.error('Error fetching sellers:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Sellers fetched successfully:', sellers);
    
    // Convert array to object for easy lookup
    const sellersMap = sellers.reduce((acc, seller) => {
      acc[seller.id] = seller;
      return acc;
    }, {} as any);
    
    return Response.json({ sellers: sellersMap });
  } catch (err) {
    console.error('Error in sellers API:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
