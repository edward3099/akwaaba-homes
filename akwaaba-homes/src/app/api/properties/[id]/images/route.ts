import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Enhanced image upload schema
const imageUploadSchema = z.object({
  image_url: z.string().url('Valid image URL is required').optional(),
  image_file: z.any().optional(), // For file uploads
  caption: z.string().optional(),
  is_primary: z.boolean().default(false),
}).refine(data => data.image_url || data.image_file, {
  message: "Either image_url or image_file must be provided"
});

// File validation helper
const validateImageFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and AVIF images are allowed');
  }
  
  return true;
};

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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch property images
    const { data: images, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching property images:', error);
      return NextResponse.json({ error: 'Failed to fetch property images' }, { status: 500 });
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error in property images GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    const cookieStore = await cookies();
    // Create Supabase client for file operations
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the property or is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id')
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
    const validatedData = imageUploadSchema.parse(body);

    let finalImageUrl = validatedData.image_url;

    // Handle file upload if provided
    if (validatedData.image_file) {
      try {
        // For now, we'll store the file data as a base64 string
        // In a real implementation, you'd want to use FormData and handle multipart uploads
        // This is a simplified version for demonstration
        if (typeof validatedData.image_file === 'string' && validatedData.image_file.startsWith('data:image/')) {
          // This is a base64 image data URL
          finalImageUrl = validatedData.image_file;
        } else {
          return NextResponse.json({ error: 'Invalid file format. Please provide a valid image file or URL.' }, { status: 400 });
        }
      } catch (error) {
        console.error('Error processing image file:', error);
        return NextResponse.json({ error: 'Failed to process image file' }, { status: 500 });
      }
    }

    // If this image is marked as primary, unset other primary images
    if (validatedData.is_primary) {
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId)
        .eq('is_primary', true);
    }

    // Create image record
    const { data: image, error } = await supabase
      .from('property_images')
      .insert([
        {
          property_id: propertyId,
          image_url: finalImageUrl,
          caption: validatedData.caption,
          is_primary: validatedData.is_primary,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating property image:', error);
      return NextResponse.json({ error: 'Failed to create property image' }, { status: 500 });
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'property_image_uploaded',
          user_id: user.id,
          property_id: propertyId,
          metadata: {
            image_url: validatedData.image_url,
            is_primary: validatedData.is_primary,
            caption: validatedData.caption,
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property image uploaded successfully',
      image 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in property images POST:', error);
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
            }
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the property or is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id')
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
    const { image_id, updates } = body;

    if (!image_id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // If this image is marked as primary, unset other primary images
    if (updates.is_primary) {
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId)
        .eq('is_primary', true);
    }

    // Update image
    const { data: updatedImage, error } = await supabase
      .from('property_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', image_id)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property image:', error);
      return NextResponse.json({ error: 'Failed to update property image' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Property image updated successfully',
      image: updatedImage 
    });
  } catch (error) {
    console.error('Error in property images PUT:', error);
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user owns the property or is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.seller_id !== user.id && userProfile.user_type !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get image ID from query params
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('image_id');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Delete image
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error deleting property image:', error);
      return NextResponse.json({ error: 'Failed to delete property image' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Property image deleted successfully' 
    });
  } catch (error) {
    console.error('Error in property images DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
