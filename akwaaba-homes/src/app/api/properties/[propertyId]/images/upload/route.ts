import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  try {
    const { propertyId } = params;
    
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
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to upload images' },
        { status: 401 }
      );
    }

    // Check if user is an agent
    let isAgent = false;
    
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user.id)
      .single();

    if (profile && !profileError) {
      isAgent = profile.user_role === 'agent';
    }

    // If not found in profiles, check users table
    if (!isAgent) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (userData && !userError) {
        isAgent = userData.user_type === 'agent';
      }
    }

    // If still not an agent, check if user email matches known agent emails
    if (!isAgent) {
      const { data: knownAgent, error: agentError } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('email', user.email)
        .eq('user_type', 'agent')
        .single();

      if (knownAgent && !agentError) {
        isAgent = true;
      }
    }

    if (!isAgent) {
      console.error('User is not an agent:', { 
        userId: user.id, 
        email: user.email 
      });
      return NextResponse.json(
        { error: 'Unauthorized - Only agents can upload property images' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const isPrimary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${propertyId}-${timestamp}-${randomString}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to storage', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    // Insert image record into property_images table
    const imageData = {
      property_id: propertyId,
      image_url: publicUrl,
      caption: caption || file.name,
      is_primary: isPrimary,
      uploaded_by: user.id,
      uploaded_at: new Date().toISOString()
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
      
      return NextResponse.json(
        { error: 'Failed to save image record', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('Image uploaded successfully:', {
      fileName,
      publicUrl,
      imageRecord
    });

    return NextResponse.json(
      { 
        message: 'Image uploaded successfully',
        image_url: publicUrl,
        image_id: imageRecord.id,
        file_name: fileName
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in image upload:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
