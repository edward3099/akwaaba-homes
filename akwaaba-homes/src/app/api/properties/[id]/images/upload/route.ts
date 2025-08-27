import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// File upload schema
const fileUploadSchema = z.object({
  caption: z.string().optional(),
  is_primary: z.boolean().default(false),
});

export async function POST(
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const isPrimary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and AVIF images are allowed' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    // If this image is marked as primary, unset other primary images
    if (isPrimary) {
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId)
        .eq('is_primary', true);
    }

    // Create image record in database
    const { data: image, error: dbError } = await supabase
      .from('property_images')
      .insert([
        {
          property_id: propertyId,
          image_url: publicUrl,
          caption: caption || null,
          is_primary: isPrimary,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error creating image record:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('property-images')
        .remove([fileName]);
      return NextResponse.json({ error: 'Failed to create image record' }, { status: 500 });
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
            image_url: publicUrl,
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            is_primary: isPrimary,
            caption: caption,
          },
        }
      ]);

    return NextResponse.json({ 
      message: 'Property image uploaded successfully',
      image: {
        ...image,
        storage_path: fileName,
        public_url: publicUrl
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in property image upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
