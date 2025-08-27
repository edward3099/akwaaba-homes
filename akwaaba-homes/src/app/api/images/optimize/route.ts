import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Image optimization request schema
const imageOptimizationSchema = z.object({
  bucketName: z.string().min(1, 'Bucket name is required'),
  imagePath: z.string().min(1, 'Image path is required'),
  width: z.number().int().min(1).max(2500).optional(),
  height: z.number().int().min(1).max(2500).optional(),
  quality: z.number().int().min(20).max(100).optional(),
  format: z.enum(['origin']).optional(),
  resize: z.enum(['cover', 'contain', 'fill']).optional(),
  variant: z.enum(['gallery', 'card', 'hero', 'detail', 'mobile']).optional(),
  responsive: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = await request.json();
    const validatedData = imageOptimizationSchema.parse(body);

    const { bucketName, imagePath, variant, responsive, ...transformOptions } = validatedData;

    // Check if the image exists in the specified bucket
    const { data: imageExists, error: checkError } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: imagePath
      });

    if (checkError) {
      console.error('Error checking image existence:', checkError);
      return NextResponse.json({ error: 'Failed to verify image' }, { status: 500 });
    }

    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Generate optimized image URL
    let optimizedUrl: string;
    
    if (variant) {
      // Generate property-specific variant
      const variants: Record<string, { width: number; height: number; resize: 'fill' | 'cover' | 'contain'; quality: number; format: 'origin' }> = {
        thumbnail: { width: 150, height: 150, resize: 'cover', quality: 80, format: 'origin' },
        hero: { width: 1200, height: 600, resize: 'cover', quality: 90, format: 'origin' },
        detail: { width: 800, height: 600, resize: 'contain', quality: 90, format: 'origin' },
        mobile: { width: 640, height: 480, resize: 'contain', quality: 85, format: 'origin' }
      };

      const variantOptions = variants[variant];
      optimizedUrl = supabase.storage.from(bucketName).getPublicUrl(imagePath, {
        transform: variantOptions
      }).data.publicUrl;
    } else if (responsive) {
      // Generate responsive URLs for different screen sizes
      const sizes = {
        xs: { width: 320, height: 240 },
        sm: { width: 640, height: 480 },
        md: { width: 768, height: 576 },
        lg: { width: 1024, height: 768 },
        xl: { width: 1280, height: 960 },
        '2xl': { width: 1536, height: 1152 }
      };

      const responsiveUrls: Record<string, string> = {};
      
      for (const [size, dimensions] of Object.entries(sizes)) {
        responsiveUrls[size] = supabase.storage.from(bucketName).getPublicUrl(imagePath, {
          transform: {
            ...dimensions,
            resize: 'contain',
            quality: 85,
            format: 'origin'
          }
        }).data.publicUrl;
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'responsive',
          urls: responsiveUrls,
          srcset: Object.entries(responsiveUrls)
            .map(([size, url]) => {
              const width = size === 'xs' ? 320 : size === 'sm' ? 640 : size === 'md' ? 768 : size === 'lg' ? 1024 : size === 'xl' ? 1280 : 1536;
              return `${url} ${width}w`;
            })
            .join(', '),
          sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
        }
      });
    } else {
      // Generate single optimized URL
      optimizedUrl = supabase.storage.from(bucketName).getPublicUrl(imagePath, {
        transform: transformOptions
      }).data.publicUrl;
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'image_optimization_requested',
          user_id: user.id,
          metadata: {
            bucket_name: bucketName,
            image_path: imagePath,
            transform_options: transformOptions,
            variant,
            responsive
          },
        }
      ]);

    return NextResponse.json({
      success: true,
      data: {
        type: variant ? 'variant' : 'optimized',
        url: optimizedUrl,
        bucket_name: bucketName,
        image_path: imagePath,
        transform_options: transformOptions
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in image optimization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get('bucket');
    const imagePath = searchParams.get('path');
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const quality = searchParams.get('quality');
    const format = searchParams.get('format');
    const resize = searchParams.get('resize');

    if (!bucketName || !imagePath) {
      return NextResponse.json({ error: 'Bucket name and image path are required' }, { status: 400 });
    }

    // Build transform options
    const transformOptions: any = {};
    
    if (width) transformOptions.width = parseInt(width);
    if (height) transformOptions.height = parseInt(height);
    if (quality) transformOptions.quality = parseInt(quality);
    if (format) transformOptions.format = format;
    if (resize) transformOptions.resize = resize;

    // Generate optimized URL
    const optimizedUrl = supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: Object.keys(transformOptions).length > 0 ? transformOptions : undefined
    }).data.publicUrl;

    return NextResponse.json({
      success: true,
      data: {
        url: optimizedUrl,
        bucket_name: bucketName,
        image_path: imagePath,
        transform_options: transformOptions
      }
    });

  } catch (error) {
    console.error('Error in image optimization GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

