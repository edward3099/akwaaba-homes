import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params;
    
    // Create Supabase client (same as working test route)
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

    // Check authentication (same as working test route)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to upload images' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Verify property exists and user has access
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, seller_id, title')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Property not found:', propertyError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('Property found:', property);

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} files for property ${propertyId}`);

    const uploadedImages = [];
    const uploadedImageUrls = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Only JPEG, PNG, WebP, and AVIF images are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      try {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}-${i}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        console.log('File uploaded successfully:', { fileName, publicUrl });

        // Insert image record into property_images table
        const imageData = {
          property_id: propertyId,
          image_url: publicUrl,
          alt_text: file.name,
          image_type: i === 0 ? 'primary' : 'gallery', // First image is primary, others are gallery
          is_primary: i === 0, // First image is primary
          order_index: i
        };

        const { data: imageRecord, error: insertError } = await supabase
          .from('property_images')
          .insert([imageData])
          .select()
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
          // Try to clean up the uploaded file if database insert fails
          await supabase.storage
            .from('property-images')
            .remove([fileName]);
          
          throw new Error(`Failed to save image record for ${file.name}: ${insertError.message}`);
        }

        console.log('Image record created:', imageRecord);

        uploadedImages.push({
          fileName,
          publicUrl,
          imageRecord
        });

        uploadedImageUrls.push(publicUrl);

      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);
        
        // Clean up any uploaded files
        for (const uploaded of uploadedImages) {
          try {
            await supabase.storage
              .from('property-images')
              .remove([uploaded.fileName]);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        }

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    console.log(`Successfully uploaded ${uploadedImages.length} images`);
    console.log('Image URLs to update property with:', uploadedImageUrls);

    // Update property with image URLs
    const { error: updateError } = await supabase
      .from('properties')
      .update({ 
        image_urls: uploadedImageUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('Property update error:', updateError);
      console.warn('Property update failed, but images were uploaded successfully');
    } else {
      console.log('Property image_urls updated successfully');
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      uploadedImageUrls,
      uploadedImages: uploadedImages.map(img => ({
        id: img.imageRecord.id,
        url: img.publicUrl,
        fileName: img.fileName
      }))
    });

  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
