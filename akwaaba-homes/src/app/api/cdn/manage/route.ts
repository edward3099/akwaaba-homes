import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { cdnService } from '@/lib/services/cdnService';

// CDN management request schema
const cdnManagementSchema = z.object({
  action: z.enum(['upload', 'preload', 'warmup', 'metrics', 'optimize']),
  bucketName: z.string().min(1, 'Bucket name is required'),
  filePath: z.string().optional(),
  file: z.any().optional(),
  contentType: z.string().optional(),
  isPublic: z.boolean().optional(),
  customCacheControl: z.string().optional(),
  assets: z.array(z.object({
    bucket: z.string(),
    path: z.string(),
    priority: z.enum(['high', 'medium', 'low'])
  })).optional(),
  regions: z.array(z.string()).optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
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
    const validatedData = cdnManagementSchema.parse(body);

    const { action, bucketName, filePath, file, contentType, isPublic, customCacheControl, assets, regions, timeRange } = validatedData;

    let result: any;

    switch (action) {
      case 'upload':
        if (!filePath || !file || !contentType) {
          return NextResponse.json({ error: 'File path, file, and content type are required for upload' }, { status: 400 });
        }

        result = await cdnService.uploadWithCDNOptimization(
          bucketName,
          filePath,
          file,
          contentType,
          isPublic ?? true,
          customCacheControl
        );
        break;

      case 'preload':
        if (!assets || assets.length === 0) {
          return NextResponse.json({ error: 'Assets array is required for preloading' }, { status: 400 });
        }

        result = await cdnService.preloadAssets(assets);
        break;

      case 'warmup':
        if (!filePath) {
          return NextResponse.json({ error: 'File path is required for cache warming' }, { status: 400 });
        }

        result = await cdnService.warmUpCDNCache(
          bucketName,
          [filePath],
          regions || ['us-east-1', 'eu-west-1', 'ap-southeast-1']
        );
        break;

      case 'metrics':
        result = await cdnService.getCDNPerformanceMetrics(bucketName, timeRange || '24h');
        break;

      case 'optimize':
        result = await cdnService.optimizeCDNSettings(bucketName);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    // Track CDN management analytics
    await supabase
      .from('analytics')
      .insert([
        {
          event_type: 'cdn_management_action',
          user_id: user.id,
          metadata: {
            action,
            bucket_name: bucketName,
            file_path: filePath,
            content_type: contentType,
            is_public: isPublic,
            custom_cache_control: customCacheControl,
            assets_count: assets?.length || 0,
            regions_count: regions?.length || 0,
            time_range: timeRange,
            timestamp: new Date().toISOString()
          },
        }
      ]);

    return NextResponse.json({
      success: true,
      action,
      data: result
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error in CDN management:', error);
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
    const action = searchParams.get('action');
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' | null;

    if (!bucketName) {
      return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 });
    }

    let result: any;

    switch (action) {
      case 'metrics':
        result = await cdnService.getCDNPerformanceMetrics(bucketName, timeRange || '24h');
        break;

      case 'optimize':
        result = await cdnService.optimizeCDNSettings(bucketName);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      bucket_name: bucketName,
      data: result
    });

  } catch (error) {
    console.error('Error in CDN management GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

