import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎬 Video upload API called for property:', params.id);
    
    const supabase = await createApiRouteSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);
    const propertyId = params.id;
    
    // Verify the property exists and belongs to the user
    console.log('🔍 Checking property ownership for:', propertyId);
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, seller_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.seller_id !== user.id) {
      console.error('❌ Unauthorized to modify property. User:', user.id, 'Property owner:', property.seller_id);
      return NextResponse.json({ error: 'Unauthorized to modify this property' }, { status: 403 });
    }

    console.log('✅ Property ownership verified');
    
    // Parse the form data
    console.log('📝 Parsing form data...');
    const formData = await request.formData();
    const files = formData.getAll('videos') as File[];
    
    console.log('📁 Files received:', files.length);
    
    if (!files || files.length === 0) {
      console.error('❌ No videos provided');
      return NextResponse.json({ error: 'No videos provided' }, { status: 400 });
    }

    const uploadedVideoUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📹 Processing file ${i + 1}/${files.length}:`, file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        console.error('❌ Invalid file type:', file.type);
        return NextResponse.json({ error: `File ${file.name} is not a video` }, { status: 400 });
      }

      // Validate file size (50MB limit for videos)
      if (file.size > 50 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        return NextResponse.json({ error: `File ${file.name} is too large. Maximum size is 50MB` }, { status: 400 });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${propertyId}/${timestamp}-${i}.${fileExtension}`;
      console.log('📁 Generated filename:', fileName);

      // Upload to Supabase Storage
      console.log('☁️ Uploading to Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Video upload error:', uploadError);
        return NextResponse.json({ error: `Failed to upload video: ${uploadError.message}` }, { status: 500 });
      }

      console.log('✅ Video uploaded successfully:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-videos')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL generated:', urlData.publicUrl);
      uploadedVideoUrls.push(urlData.publicUrl);
    }

    // Update the property with the new video URLs
    console.log('💾 Updating property with video URLs:', uploadedVideoUrls);
    const { error: updateError } = await supabase
      .from('properties')
      .update({ 
        videos: uploadedVideoUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to update property with video URLs' }, { status: 500 });
    }

    console.log('✅ Property updated successfully with video URLs');
    return NextResponse.json({ 
      success: true, 
      videoUrls: uploadedVideoUrls,
      message: `Successfully uploaded ${uploadedVideoUrls.length} video(s)` 
    });

  } catch (error) {
    console.error('❌ Video upload error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
