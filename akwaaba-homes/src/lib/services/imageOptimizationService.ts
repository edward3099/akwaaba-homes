import { supabase } from '@/lib/supabase';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'jpeg' | 'png' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

export interface OptimizedImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  webp: string;
  avif: string;
}

export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private supabase: typeof supabase;

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Generate optimized image URLs for different use cases
   */
  async generateOptimizedUrls(
    bucketName: string,
    imagePath: string,
    options?: Partial<OptimizedImageUrls>
  ): Promise<OptimizedImageUrls> {
    const baseUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath).data.publicUrl;
    
    // Generate thumbnail (small, square)
    const thumbnailUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: {
        width: 150,
        height: 150,
        resize: 'cover',
        quality: 80,
        format: 'webp'
      }
    }).data.publicUrl;

    // Generate medium size (responsive)
    const mediumUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: {
        width: 500,
        height: 400,
        resize: 'contain',
        quality: 85,
        format: 'webp'
      }
    }).data.publicUrl;

    // Generate large size (full width)
    const largeUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: {
        width: 1200,
        height: 800,
        resize: 'contain',
        quality: 90,
        format: 'webp'
      }
    }).data.publicUrl;

    // Generate WebP version
    const webpUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: {
        quality: 85,
        format: 'webp'
      }
    }).data.publicUrl;

    // Generate AVIF version (most modern, best compression)
    const avifUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
      transform: {
        quality: 80,
        format: 'avif'
      }
    }).data.publicUrl;

    return {
      original: options?.original || baseUrl,
      thumbnail: options?.thumbnail || thumbnailUrl,
      medium: options?.medium || mediumUrl,
      large: options?.large || largeUrl,
      webp: options?.webp || webpUrl,
      avif: options?.avif || avifUrl
    };
  }

  /**
   * Get optimized image URL for specific dimensions
   */
  getOptimizedUrl(
    bucketName: string,
    imagePath: string,
    transformOptions: ImageTransformOptions
  ): string {
    try {
      // Handle different image URL formats
      if (imagePath.startsWith('http')) {
        // External URL - return as is
        return imagePath;
      }
      
      if (imagePath.startsWith('/')) {
        // Local path - return as is
        return imagePath;
      }

      // Generate Supabase storage URL with transformations
      const baseUrl = this.supabase.storage.from(bucketName).getPublicUrl(imagePath).data.publicUrl;
      
      // Add transformation parameters
      const params = new URLSearchParams();
      
      if (transformOptions.width) {
        params.append('width', transformOptions.width.toString());
      }
      
      if (transformOptions.height) {
        params.append('height', transformOptions.height.toString());
      }
      
      if (transformOptions.quality) {
        params.append('quality', transformOptions.quality.toString());
      }
      
      if (transformOptions.format && transformOptions.format !== 'origin') {
        params.append('format', transformOptions.format);
      }
      
      if (transformOptions.resize) {
        params.append('resize', transformOptions.resize);
      }

      const queryString = params.toString();
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    } catch (error) {
      console.error('Error generating optimized URL:', error);
      // Fallback to original path
      return imagePath.startsWith('http') || imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    }
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  async generateResponsiveUrls(
    bucketName: string,
    imagePath: string
  ): Promise<Record<string, string>> {
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
      responsiveUrls[size] = this.supabase.storage.from(bucketName).getPublicUrl(imagePath, {
        transform: {
          ...dimensions,
          resize: 'contain',
          quality: 85,
          format: 'webp'
        }
      }).data.publicUrl;
    }

    return responsiveUrls;
  }

  /**
   * Generate property-specific image variants
   */
  async generatePropertyImageVariants(
    imagePath: string
  ): Promise<Record<string, string>> {
    const variants = {
      // Gallery thumbnail
      gallery: this.getOptimizedUrl('property-images', imagePath, {
        width: 300,
        height: 200,
        resize: 'cover',
        quality: 80,
        format: 'webp'
      }),
      
      // Property card image
      card: this.getOptimizedUrl('property-images', imagePath, {
        width: 400,
        height: 300,
        resize: 'cover',
        quality: 85,
        format: 'webp'
      }),
      
      // Hero image
      hero: this.getOptimizedUrl('property-images', imagePath, {
        width: 1200,
        height: 600,
        resize: 'cover',
        quality: 90,
        format: 'webp'
      }),
      
      // Detail view
      detail: this.getOptimizedUrl('property-images', imagePath, {
        width: 800,
        height: 600,
        resize: 'contain',
        quality: 90,
        format: 'webp'
      }),
      
      // Mobile optimized
      mobile: this.getOptimizedUrl('property-images', imagePath, {
        width: 640,
        height: 480,
        resize: 'contain',
        quality: 85,
        format: 'webp'
      })
    };

    return variants;
  }

  /**
   * Create a signed URL for private images with transformations
   */
  async createSignedUrl(
    bucketName: string,
    imagePath: string,
    expiresIn: number,
    transformOptions: ImageTransformOptions
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .createSignedUrl(imagePath, expiresIn, {
        transform: transformOptions
      });

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Download optimized image with transformations
   */
  async downloadOptimizedImage(
    bucketName: string,
    imagePath: string,
    transformOptions: ImageTransformOptions
  ): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .download(imagePath, {
        transform: transformOptions
      });

    if (error) {
      throw new Error(`Failed to download optimized image: ${error.message}`);
    }

    return data;
  }

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(
    bucketName: string,
    imagePath: string,
    sizes: Array<{ width: number; height?: number }>
  ): string {
    return sizes
      .map(({ width, height }) => {
        const url = this.getOptimizedUrl(bucketName, imagePath, {
          width,
          height,
          resize: 'contain',
          quality: 85,
          format: 'webp'
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizesAttribute(): string {
    return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
  }
}

export const imageOptimizationService = ImageOptimizationService.getInstance();

