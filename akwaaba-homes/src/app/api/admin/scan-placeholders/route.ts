import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profile?.user_role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all properties
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, description, address, city, price, bedrooms, bathrooms, property_type')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Define placeholder patterns
    const placeholderPatterns = [
      { pattern: /^a{3,}$/i, reason: 'Repeated letters (aaa, aaaa, etc.)' },
      { pattern: /^c{3,}$/i, reason: 'Repeated letters (ccc, cccc, etc.)' },
      { pattern: /^q{3,}$/i, reason: 'Repeated letters (qqq, qqqq, etc.)' },
      { pattern: /^w{3,}$/i, reason: 'Repeated letters (www, wwww, etc.)' },
      { pattern: /^s{3,}$/i, reason: 'Repeated letters (sss, ssss, etc.)' },
      { pattern: /^g{3,}$/i, reason: 'Repeated letters (ggg, gggg, etc.)' },
      { pattern: /^f{3,}$/i, reason: 'Repeated letters (fff, ffff, etc.)' },
      { pattern: /^d{3,}$/i, reason: 'Repeated letters (ddd, dddd, etc.)' },
      { pattern: /^h{3,}$/i, reason: 'Repeated letters (hhh, hhhh, etc.)' },
      { pattern: /^t{3,}$/i, reason: 'Repeated letters (ttt, tttt, etc.)' },
      { pattern: /^e{3,}$/i, reason: 'Repeated letters (eee, eeee, etc.)' },
      { pattern: /^r{3,}$/i, reason: 'Repeated letters (rrr, rrrr, etc.)' },
      { pattern: /^y{3,}$/i, reason: 'Repeated letters (yyy, yyyy, etc.)' },
      { pattern: /^u{3,}$/i, reason: 'Repeated letters (uuu, uuuu, etc.)' },
      { pattern: /^i{3,}$/i, reason: 'Repeated letters (iii, iiii, etc.)' },
      { pattern: /^o{3,}$/i, reason: 'Repeated letters (ooo, oooo, etc.)' },
      { pattern: /^p{3,}$/i, reason: 'Repeated letters (ppp, pppp, etc.)' },
      { pattern: /test/i, reason: 'Contains "test" keyword' },
      { pattern: /placeholder/i, reason: 'Contains "placeholder" keyword' },
    ];

    // Function to check if a value contains placeholder data
    const isPlaceholder = (value: string, fieldName: string) => {
      for (const { pattern, reason } of placeholderPatterns) {
        if (pattern.test(value)) {
          return reason;
        }
      }
      if (value.length <= 2) {
        return `Too short (${fieldName})`;
      }
      return null;
    };

    // Scan properties for placeholder data
    const placeholderProperties = properties?.filter(property => {
      const titleIssue = isPlaceholder(property.title, 'title');
      const descriptionIssue = isPlaceholder(property.description, 'description');
      const addressIssue = isPlaceholder(property.address, 'address');
      const priceIssue = parseFloat(property.price) < 1000 ? 'Unrealistic price' : null;
      const bedroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bedrooms === 0 ? 'Zero bedrooms for house/apartment' : null;
      const bathroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bathrooms === 0 ? 'Zero bathrooms for house/apartment' : null;

      return titleIssue || descriptionIssue || addressIssue || priceIssue || bedroomIssue || bathroomIssue;
    }).map(property => {
      const issues = [];
      const titleIssue = isPlaceholder(property.title, 'title');
      const descriptionIssue = isPlaceholder(property.description, 'description');
      const addressIssue = isPlaceholder(property.address, 'address');
      const priceIssue = parseFloat(property.price) < 1000 ? 'Unrealistic price' : null;
      const bedroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bedrooms === 0 ? 'Zero bedrooms for house/apartment' : null;
      const bathroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bathrooms === 0 ? 'Zero bathrooms for house/apartment' : null;

      if (titleIssue) issues.push(titleIssue);
      if (descriptionIssue) issues.push(descriptionIssue);
      if (addressIssue) issues.push(addressIssue);
      if (priceIssue) issues.push(priceIssue);
      if (bedroomIssue) issues.push(bedroomIssue);
      if (bathroomIssue) issues.push(bathroomIssue);

      return {
        id: property.id,
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        reason: issues.join(', ')
      };
    }) || [];

    return NextResponse.json({
      placeholderProperties,
      totalScanned: properties?.length || 0,
      placeholderCount: placeholderProperties.length
    });

  } catch (error) {
    console.error('Error scanning for placeholders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
