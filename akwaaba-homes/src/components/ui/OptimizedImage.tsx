'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { imageOptimizationService, ImageTransformOptions } from '@/lib/services/imageOptimizationService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  transformOptions?: ImageTransformOptions;
  responsive?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  transformOptions,
  responsive = false,
  sizes,
  onLoad,
  onError
}: OptimizedImageProps) {
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    // Handle different image source formats
    if (src.startsWith('http') || src.startsWith('/')) {
      // Direct URL or local path - use as is
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Parse the src to extract bucket and path
    const [bucketName, ...pathParts] = src.split('/');
    const imagePath = pathParts.join('/');

    if (!bucketName || !imagePath) {
      console.warn('Invalid image src format, expected: "bucket-name/path/to/image.jpg" or direct URL');
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    try {
      // Generate optimized image URL
      const optimizedUrl = imageOptimizationService.getOptimizedUrl(
        bucketName,
        imagePath,
        transformOptions || {
          width,
          height,
          quality: 85,
          format: 'origin',
          resize: 'contain'
        }
      );

      setImageSrc(optimizedUrl);
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating optimized image URL:', err);
      setImageSrc(src); // Fallback to original src
      setIsLoading(false);
    }
  }, [src, width, height, transformOptions]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    onError?.();
  };

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isLoading ? 'animate-pulse' : ''}`}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      sizes={sizes || imageOptimizationService.generateSizesAttribute()}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

/**
 * Property-specific optimized image component
 */
interface PropertyImageProps {
  imagePath: string;
  alt: string;
  variant?: 'gallery' | 'card' | 'hero' | 'detail' | 'mobile';
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function PropertyImage({
  imagePath,
  alt,
  variant = 'card',
  className = '',
  priority = false,
  onLoad,
  onError
}: PropertyImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImageVariants = async () => {
      try {
        const variants = await imageOptimizationService.generatePropertyImageVariants(imagePath);
        setImageUrl(variants[variant]);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading property image variants:', err);
        setIsLoading(false);
      }
    };

    loadImageVariants();
  }, [imagePath, variant]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className}`} />
    );
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}>
        <span className="text-sm">No image</span>
      </div>
    );
  }

  // Get dimensions based on variant
  const dimensions = {
    gallery: { width: 300, height: 200 },
    card: { width: 400, height: 300 },
    hero: { width: 1200, height: 600 },
    detail: { width: 800, height: 600 },
    mobile: { width: 640, height: 480 }
  };

  const { width, height } = dimensions[variant];

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={imageOptimizationService.generateSizesAttribute()}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

/**
 * Responsive image component with srcset
 */
interface ResponsiveImageProps {
  bucketName: string;
  imagePath: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  bucketName,
  imagePath,
  alt,
  className = '',
  priority = false,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [srcset, setSrcset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSrcset = async () => {
      try {
        const responsiveUrls = await imageOptimizationService.generateResponsiveUrls(bucketName, imagePath);
        const srcsetString = Object.entries(responsiveUrls)
          .map(([size, url]) => {
            const width = size === 'xs' ? 320 : size === 'sm' ? 640 : size === 'md' ? 768 : size === 'lg' ? 1024 : size === 'xl' ? 1280 : 1536;
            return `${url} ${width}w`;
          })
          .join(', ');
        
        setSrcset(srcsetString);
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating responsive image srcset:', err);
        setIsLoading(false);
      }
    };

    generateSrcset();
  }, [bucketName, imagePath]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className}`} />
    );
  }

  if (!srcset) {
    return (
      <div className={`bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}>
        <span className="text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={imageOptimizationService.getOptimizedUrl(bucketName, imagePath, { quality: 85, format: 'origin' })}
      srcSet={srcset}
      sizes={imageOptimizationService.generateSizesAttribute()}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

