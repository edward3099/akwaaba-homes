import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Enhanced property update schema
const updatePropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters').optional(),
  price: z.number().positive('Price must be positive').max(1000000000, 'Price must be less than 1 billion').optional(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial', 'office']).optional(),
  status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).optional(),
  bedrooms: z.number().int().min(0).max(20, 'Bedrooms must be less than 20').optional(),
  bathrooms: z.number().int().min(0).max(20, 'Bathrooms must be less than 20').optional(),
  area: z.number().positive('Area must be positive').max(1000000, 'Area must be less than 1 million sq ft').optional(),
  location: z.object({
    address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
    city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
    region: z.string().min(1, 'Region is required').max(100, 'Region must be less than 100 characters'),
    postal_code: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  contact_info: z.object({
    phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
    email: z.string().email('Valid email is required').max(100, 'Email must be less than 100 characters'),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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
              // user sessions.
            }
          },
        },
      }
    );

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check authentication (optional for public viewing)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isAuthenticated = !authError && user;

    // Fetch property with related data
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        users!properties_seller_id_fkey (
          id,
          full_name,
          phone,
          email,
          user_type,
          is_verified
        ),
        property_images (
          id,
          image_url,
          is_primary,
          alt_text
        ),
        inquiries (
          id,
          buyer_name,
          buyer_email,
          buyer_phone,
          message,
          status,
          created_at
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      console.error('Error fetching property:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch property', 
        details: error.message 
      }, { status: 500 });
    }

    // Track property view (only if authenticated)
    if (isAuthenticated) {
      try {
        await supabase
          .from('analytics')
          .insert([
            {
              event_type: 'property_viewed',
              user_id: user.id,
              property_id: propertyId,
              metadata: {
                property_type: property.property_type,
                price: property.price,
                location: property.city,
              },
            }
          ]);

        // Increment view count
        await supabase
          .from('properties')
          .update({ views_count: (property.views_count || 0) + 1 })
          .eq('id', propertyId);
      } catch (analyticsError) {
        // Don't fail the request if analytics tracking fails
        console.warn('Analytics tracking failed:', analyticsError);
      }
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Error in property GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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
              // user sessions.
            }
          },
        },
      }
    );

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type, is_verified')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user owns the property or is admin
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id, property_type, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.seller_id !== user.id && userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = updatePropertySchema.parse(body);

    // Prepare update data
    const updateData: Record<string, unknown> = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update property', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_updated',
          user_id: user.id,
          property_id: propertyId,
          metadata: {
            property_type: updatedProperty.property_type,
            price: updatedProperty.price,
            location: updatedProperty.city,
            updated_fields: Object.keys(validatedData),
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property updated successfully',
      property: updatedProperty 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in property PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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
              // user sessions.
            }
          },
        },
      }
    );

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type, is_verified')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user owns the property or is admin
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id, property_type, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.seller_id !== user.id && userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // For PATCH, we allow partial updates including image_urls
    const updateData: Record<string, unknown> = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update property', 
        details: updateError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_updated',
          user_id: user.id,
          property_id: propertyId,
          metadata: {
            property_type: updatedProperty.property_type,
            updated_fields: Object.keys(body),
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property updated successfully',
      property: updatedProperty 
    });
  } catch (error) {
    console.error('Error in property PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
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
              // user sessions.
            }
          },
        },
      }
    );

    // Validate property ID
    if (!propertyId || propertyId === 'undefined' || propertyId === 'null') {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type, is_verified')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check if user owns the property or is admin
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id, property_type, status')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.seller_id !== user.id && userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Instead of deleting, mark as archived for safety
    const { error: archiveError } = await supabase
      .from('properties')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString(),
        archived_at: new Date().toISOString(),
        archived_by: user.id
      })
      .eq('id', propertyId);

    if (archiveError) {
      console.error('Error archiving property:', archiveError);
      return NextResponse.json({ 
        error: 'Failed to archive property', 
        details: archiveError.message 
      }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_archived',
          user_id: user.id,
          metadata: {
            property_id: propertyId,
            property_type: property.property_type,
            archived_by: userProfile.user_type,
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property archived successfully' 
    });
  } catch (error) {
    console.error('Error in property DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
