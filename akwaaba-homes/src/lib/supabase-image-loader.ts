/**
 * Custom Next.js Image Loader for Supabase Storage
 * This loader integrates with Supabase's image transformation service
 * to provide optimized images on-the-fly
 */

interface SupabaseImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'origin';
}

export default function supabaseImageLoader({
  src,
  width,
  quality = 75,
  format = 'webp'
}: SupabaseImageLoaderProps): string {
  
  // Handle different image source formats
  if (src.startsWith('http')) {
    // External URL - return as is, but add width parameter if it's a supported service
    if (src.includes('unsplash.com') || src.includes('images.unsplash.com')) {
      // For Unsplash images, we can optimize by adding width parameter
      const url = new URL(src);
      url.searchParams.set('w', width.toString());
      if (quality) {
        url.searchParams.set('q', quality.toString());
      }
      return url.toString();
    }
    // For other external URLs, return as is
    return src;
  }
  
  if (src.startsWith('/')) {
    // Local path - return as is
    return src;
  }

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    console.warn('Supabase project ID not found, falling back to direct URL');
    return src;
  }

  // Parse the src to extract bucket and path
  // Expected format: "bucket-name/path/to/image.jpg"
  const [bucketName, ...pathParts] = src.split('/');
  const imagePath = pathParts.join('/');

  if (!bucketName || !imagePath) {
    console.warn('Invalid image src format, expected: "bucket-name/path/to/image.jpg"');
    return src;
  }

  // Construct the Supabase image transformation URL
  const baseUrl = `https://${projectId}.supabase.co/storage/v1/render/image/public/${bucketName}/${imagePath}`;
  
  // Build query parameters for transformation
  const params = new URLSearchParams();
  
  if (width) {
    params.append('width', width.toString());
  }
  
  if (quality) {
    params.append('quality', quality.toString());
  }
  
  if (format && format !== 'origin') {
    params.append('format', format);
  }

  // Add resize mode for better aspect ratio handling
  params.append('resize', 'contain');

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate optimized image URLs for different use cases
 * This can be used outside of Next.js Image component
 */
export function generateOptimizedImageUrl(
  bucketName: string,
  imagePath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'origin';
    resize?: 'cover' | 'contain' | 'fill';
  } = {}
): string {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectId) {
    console.warn('Supabase project ID not found');
    return '';
  }

  const baseUrl = `https://${projectId}.supabase.co/storage/v1/render/image/public/${bucketName}/${imagePath}`;
  const params = new URLSearchParams();

  if (options.width) {
    params.append('width', options.width.toString());
  }
  
  if (options.height) {
    params.append('height', options.height.toString());
  }
  
  if (options.quality) {
    params.append('quality', options.quality.toString());
  }
  
  if (options.format && options.format !== 'origin') {
    params.append('format', options.format);
  }
  
  if (options.resize) {
    params.append('resize', options.resize);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateResponsiveSrcSet(
  bucketName: string,
  imagePath: string,
  sizes: Array<{ width: number; height?: number }>
): string {
  return sizes
    .map(({ width, height }) => {
      const url = generateOptimizedImageUrl(bucketName, imagePath, {
        width,
        height,
        quality: 85,
        format: 'webp',
        resize: 'contain'
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
}

