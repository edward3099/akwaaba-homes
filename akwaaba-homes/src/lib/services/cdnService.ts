import { supabase } from '@/lib/supabase';

export interface CDNConfig {
  cacheControl: string;
  maxAge: number;
  staleWhileRevalidate?: number;
  immutable?: boolean;
}

export interface CDNMonitoringData {
  cacheHitRatio: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
}

export class CDNService {
  private static instance: CDNService;
  private supabase: typeof supabase;

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): CDNService {
    if (!CDNService.instance) {
      CDNService.instance = new CDNService();
    }
    return CDNService.instance;
  }

  /**
   * Get optimal cache control headers for different content types
   */
  getCacheControlHeaders(contentType: string, isPublic: boolean = true): CDNConfig {
    const baseConfig: CDNConfig = {
      cacheControl: '',
      maxAge: 3600, // 1 hour default
    };

    switch (contentType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/webp':
      case 'image/avif':
        // Images can be cached longer
        baseConfig.maxAge = isPublic ? 86400 * 7 : 86400; // 7 days for public, 1 day for private
        baseConfig.staleWhileRevalidate = 86400 * 30; // 30 days stale-while-revalidate
        baseConfig.immutable = true; // Images rarely change
        break;
      
      case 'image/svg+xml':
        // SVGs can be cached very long
        baseConfig.maxAge = isPublic ? 86400 * 30 : 86400 * 7;
        baseConfig.staleWhileRevalidate = 86400 * 90;
        baseConfig.immutable = true;
        break;
      
      case 'application/pdf':
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // Documents can be cached moderately
        baseConfig.maxAge = isPublic ? 86400 * 3 : 86400;
        baseConfig.staleWhileRevalidate = 86400 * 7;
        break;
      
      case 'video/mp4':
      case 'video/webm':
      case 'video/ogg':
        // Videos can be cached long
        baseConfig.maxAge = isPublic ? 86400 * 30 : 86400 * 7;
        baseConfig.staleWhileRevalidate = 86400 * 90;
        baseConfig.immutable = true;
        break;
      
      case 'audio/mpeg':
      case 'audio/ogg':
      case 'audio/wav':
        // Audio files can be cached long
        baseConfig.maxAge = isPublic ? 86400 * 30 : 86400 * 7;
        baseConfig.staleWhileRevalidate = 86400 * 90;
        baseConfig.immutable = true;
        break;
      
      default:
        // Default for other content types
        baseConfig.maxAge = isPublic ? 86400 : 3600;
        baseConfig.staleWhileRevalidate = 86400 * 7;
    }

    // Build cache control string
    let cacheControl = `public, max-age=${baseConfig.maxAge}`;
    
    if (baseConfig.staleWhileRevalidate) {
      cacheControl += `, stale-while-revalidate=${baseConfig.staleWhileRevalidate}`;
    }
    
    if (baseConfig.immutable) {
      cacheControl += ', immutable';
    }

    baseConfig.cacheControl = cacheControl;
    return baseConfig;
  }

  /**
   * Upload file with optimized CDN settings
   */
  async uploadWithCDNOptimization(
    bucketName: string,
    filePath: string,
    file: File | Blob,
    contentType: string,
    isPublic: boolean = true,
    customCacheControl?: string
  ) {
    const cdnConfig = this.getCacheControlHeaders(contentType, isPublic);
    const cacheControl = customCacheControl || cdnConfig.cacheControl;

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl,
        upsert: false,
        contentType
      });

    if (error) {
      throw new Error(`CDN upload failed: ${error.message}`);
    }

    // Track CDN upload analytics
    await this.trackCDNUpload(bucketName, filePath, contentType, cdnConfig);

    return { data, cdnConfig };
  }

  /**
   * Generate CDN-optimized URLs with cache busting
   */
  generateCDNUrl(
    bucketName: string,
    filePath: string,
    options: {
      version?: string;
      transform?: any;
      cacheBust?: boolean;
    } = {}
  ): string {
    const { version, transform, cacheBust = false } = options;
    
    let url = this.supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
    
    // Add version parameter for cache busting
    if (version) {
      url += `?v=${version}`;
    } else if (cacheBust) {
      // Add timestamp for cache busting
      url += `?t=${Date.now()}`;
    }

    // Add transform parameters if specified
    if (transform) {
      const separator = url.includes('?') ? '&' : '?';
      const transformParams = new URLSearchParams();
      
      if (transform.width) transformParams.append('width', transform.width.toString());
      if (transform.height) transformParams.append('height', transform.height.toString());
      if (transform.quality) transformParams.append('quality', transform.quality.toString());
      if (transform.format) transformParams.append('format', transform.format);
      if (transform.resize) transformParams.append('resize', transform.resize);
      
      if (transformParams.toString()) {
        url += `${separator}${transformParams.toString()}`;
      }
    }

    return url;
  }

  /**
   * Preload critical assets for better performance
   */
  async preloadAssets(assets: Array<{ bucket: string; path: string; priority: 'high' | 'medium' | 'low' }>) {
    const preloadPromises = assets.map(async (asset) => {
      try {
        // Generate optimized URL
        const url = this.generateCDNUrl(asset.bucket, asset.path, { cacheBust: false });
        
        // Preload using fetch with appropriate headers
        const response = await fetch(url, {
          method: 'HEAD', // Just check if resource exists
          headers: {
            'X-Preload': 'true',
            'Priority': asset.priority === 'high' ? 'high' : 'normal'
          }
        });

        if (response.ok) {
          console.log(`Preloaded asset: ${asset.path}`);
          return { success: true, asset: asset.path };
        } else {
          console.warn(`Failed to preload asset: ${asset.path}`);
          return { success: false, asset: asset.path, error: response.statusText };
        }
      } catch (error) {
        console.error(`Error preloading asset ${asset.path}:`, error);
        return { success: false, asset: asset.path, error: error.message };
      }
    });

    return Promise.allSettled(preloadPromises);
  }

  /**
   * Warm up CDN cache for frequently accessed assets
   */
  async warmUpCDNCache(
    bucketName: string,
    filePaths: string[],
    regions: string[] = ['us-east-1', 'eu-west-1', 'ap-southeast-1']
  ) {
    const warmUpPromises = filePaths.map(async (filePath) => {
      const warmUpPromises = regions.map(async (region) => {
        try {
          // Generate URL for specific region
          const url = this.generateCDNUrl(bucketName, filePath);
          
          // Make request to warm up cache in that region
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'X-CDN-Warmup': 'true',
              'X-Region': region
            }
          });

          if (response.ok) {
            console.log(`Warmed up CDN cache for ${filePath} in ${region}`);
            return { success: true, filePath, region };
          } else {
            console.warn(`Failed to warm up CDN cache for ${filePath} in ${region}`);
            return { success: false, filePath, region, error: response.statusText };
          }
        } catch (error) {
          console.error(`Error warming up CDN cache for ${filePath} in ${region}:`, error);
          return { success: false, filePath, region, error: error.message };
        }
      });

      return Promise.allSettled(warmUpPromises);
    });

    return Promise.allSettled(warmUpPromises);
  }

  /**
   * Track CDN upload analytics
   */
  private async trackCDNUpload(
    bucketName: string,
    filePath: string,
    contentType: string,
    cdnConfig: CDNConfig
  ) {
    try {
      await this.supabase
        .from('analytics')
        .insert([
          {
            event_type: 'cdn_upload',
            metadata: {
              bucket_name: bucketName,
              file_path: filePath,
              content_type: contentType,
              cdn_config: cdnConfig,
              timestamp: new Date().toISOString()
            }
          }
        ]);
    } catch (error) {
      console.warn('Failed to track CDN upload analytics:', error);
    }
  }

  /**
   * Get CDN performance metrics
   */
  async getCDNPerformanceMetrics(bucketName: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<CDNMonitoringData> {
    try {
      // Query edge logs for CDN performance data
      const { data, error } = await this.supabase
        .from('edge_logs')
        .select('*')
        .eq('bucket_name', bucketName)
        .gte('timestamp', this.getTimeRangeDate(timeRange))
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch CDN metrics: ${error.message}`);
      }

      // Calculate metrics from edge logs
      const metrics = this.calculateCDNMetrics(data || []);
      return metrics;
    } catch (error) {
      console.error('Error getting CDN performance metrics:', error);
      return {
        cacheHitRatio: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageResponseTime: 0
      };
    }
  }

  /**
   * Calculate CDN metrics from edge logs
   */
  private calculateCDNMetrics(edgeLogs: any[]): CDNMonitoringData {
    if (edgeLogs.length === 0) {
      return {
        cacheHitRatio: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageResponseTime: 0
      };
    }

    const totalRequests = edgeLogs.length;
    const cacheHits = edgeLogs.filter(log => 
      log.cf_cache_status && ['HIT', 'STALE', 'REVALIDATED', 'UPDATING'].includes(log.cf_cache_status)
    ).length;
    const cacheMisses = totalRequests - cacheHits;
    const cacheHitRatio = (cacheHits / totalRequests) * 100;

    // Calculate average response time (if available in logs)
    const responseTimes = edgeLogs
      .filter(log => log.response_time)
      .map(log => log.response_time);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    return {
      cacheHitRatio,
      totalRequests,
      cacheHits,
      cacheMisses,
      averageResponseTime
    };
  }

  /**
   * Get time range date for metrics
   */
  private getTimeRangeDate(timeRange: string): string {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Optimize CDN settings based on usage patterns
   */
  async optimizeCDNSettings(bucketName: string) {
    try {
      // Get current CDN performance
      const metrics = await this.getCDNPerformanceMetrics(bucketName, '7d');
      
      // Generate optimization recommendations
      const recommendations = this.generateCDNOptimizationRecommendations(metrics);
      
      // Track optimization recommendations
      await this.supabase
        .from('analytics')
        .insert([
          {
            event_type: 'cdn_optimization_recommendations',
            metadata: {
              bucket_name: bucketName,
              current_metrics: metrics,
              recommendations,
              timestamp: new Date().toISOString()
            }
          }
        ]);

      return { metrics, recommendations };
    } catch (error) {
      console.error('Error optimizing CDN settings:', error);
      throw error;
    }
  }

  /**
   * Generate CDN optimization recommendations
   */
  private generateCDNOptimizationRecommendations(metrics: CDNMonitoringData) {
    const recommendations: string[] = [];

    if (metrics.cacheHitRatio < 80) {
      recommendations.push('Consider increasing cache TTL for frequently accessed assets');
      recommendations.push('Implement cache warming for popular content');
    }

    if (metrics.averageResponseTime > 1000) {
      recommendations.push('Optimize image sizes and formats for faster delivery');
      recommendations.push('Consider using WebP/AVIF formats for better compression');
    }

    if (metrics.totalRequests > 10000) {
      recommendations.push('Implement CDN preloading for critical assets');
      recommendations.push('Consider using multiple CDN regions for global distribution');
    }

    if (recommendations.length === 0) {
      recommendations.push('CDN performance is optimal - no changes needed');
    }

    return recommendations;
  }
}

export const cdnService = CDNService.getInstance();

