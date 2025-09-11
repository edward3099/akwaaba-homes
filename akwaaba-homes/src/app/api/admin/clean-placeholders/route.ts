import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // Define placeholder patterns
    const placeholderPatterns = [
      /^a{3,}$/i, // aaa, aaaa, aaaaa, etc.
      /^c{3,}$/i, // ccc, cccc, ccccc, etc.
      /^q{3,}$/i, // qqq, qqqq, qqqqq, etc.
      /^w{3,}$/i, // www, wwww, wwwww, etc.
      /^s{3,}$/i, // sss, ssss, sssss, etc.
      /^g{3,}$/i, // ggg, gggg, ggggg, etc.
      /^f{3,}$/i, // fff, ffff, fffff, etc.
      /^d{3,}$/i, // ddd, dddd, ddddd, etc.
      /^h{3,}$/i, // hhh, hhhh, hhhhh, etc.
      /^t{3,}$/i, // ttt, tttt, ttttt, etc.
      /^e{3,}$/i, // eee, eeee, eeeee, etc.
      /^r{3,}$/i, // rrr, rrrr, rrrrr, etc.
      /^y{3,}$/i, // yyy, yyyy, yyyyy, etc.
      /^u{3,}$/i, // uuu, uuuu, uuuuu, etc.
      /^i{3,}$/i, // iii, iiii, iiiii, etc.
      /^o{3,}$/i, // ooo, oooo, ooooo, etc.
      /^p{3,}$/i, // ppp, pppp, ppppp, etc.
      /test/i,    // test, Test, TEST, etc.
      /placeholder/i, // placeholder, Placeholder, etc.
    ];

    // Function to check if a value contains placeholder data
    const isPlaceholder = (value: string) => {
      for (const pattern of placeholderPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
      return value.length <= 2;
    };

    // Get all properties
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, description, address, price, bedrooms, bathrooms, property_type');

    if (fetchError) {
      console.error('Error fetching properties:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Identify properties to delete
    const propertiesToDelete = properties?.filter(property => {
      const titleIssue = isPlaceholder(property.title);
      const descriptionIssue = isPlaceholder(property.description);
      const addressIssue = isPlaceholder(property.address);
      const priceIssue = parseFloat(property.price) < 1000;
      const bedroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bedrooms === 0;
      const bathroomIssue = (property.property_type === 'house' || property.property_type === 'apartment') && property.bathrooms === 0;

      return titleIssue || descriptionIssue || addressIssue || priceIssue || bedroomIssue || bathroomIssue;
    }) || [];

    if (propertiesToDelete.length === 0) {
      return NextResponse.json({
        message: 'No placeholder properties found to clean',
        deletedCount: 0
      });
    }

    // Delete properties
    const propertyIds = propertiesToDelete.map(p => p.id);
    
    // First delete related records (property_images, etc.)
    const { error: imagesError } = await supabase
      .from('property_images')
      .delete()
      .in('property_id', propertyIds);

    if (imagesError) {
      console.error('Error deleting property images:', imagesError);
      // Continue with property deletion even if image deletion fails
    }

    // Delete the properties
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .in('id', propertyIds);

    if (deleteError) {
      console.error('Error deleting properties:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete properties' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Placeholder properties cleaned successfully',
      deletedCount: propertiesToDelete.length,
      deletedProperties: propertiesToDelete.map(p => ({
        id: p.id,
        title: p.title,
        reason: 'Placeholder data detected'
      }))
    });

  } catch (error) {
    console.error('Error cleaning placeholders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
