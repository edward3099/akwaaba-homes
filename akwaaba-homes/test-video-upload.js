const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testVideoUpload() {
  try {
    console.log('🎬 Testing video upload API...');
    
    // Read the video file
    const videoPath = './public/houses/Belgium 6-0 Kazakhstan  A perfect evening at Lotto Park  #REDDEVILS - Royal Belgian Football Association (720p, h264, youtube).mp4';
    
    if (!fs.existsSync(videoPath)) {
      console.error('❌ Video file not found:', videoPath);
      return;
    }
    
    console.log('✅ Video file found:', videoPath);
    
    // Create form data
    const formData = new FormData();
    formData.append('videos', fs.createReadStream(videoPath));
    
    // Get the property ID
    const propertyId = '58eb1bf6-6ae2-440e-9cc5-263b6f89b9eb';
    
    console.log('📤 Uploading video to property:', propertyId);
    
    // Make the request
    const response = await fetch(`http://localhost:3000/api/properties/${propertyId}/videos/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('📊 Response body:', result);
    
    if (response.ok) {
      console.log('✅ Video upload successful!');
    } else {
      console.log('❌ Video upload failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing video upload:', error);
  }
}

testVideoUpload();
