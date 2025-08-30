import { supabase } from '@/lib/supabase'
import { memoryCache } from './cacheService'

// Image optimization configuration
interface ImageConfig {
  quality: number
  format: 'webp' | 'jpeg' | 'png' | 'avif'
  maxWidth: number
  maxHeight: number
  enableWebP: boolean
  enableAvif: boolean
  compressionLevel: number
}

// Image transformation options
interface TransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  crop?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  gravity?: 'north' | 'south' | 'east' | 'west' | 'center'
  blur?: number
  sharpen?: number
  rotate?: number
  flip?: 'horizontal' | 'vertical'
  background?: string
}

// CDN configuration
interface CDNConfig {
  baseUrl: string
  enableCompression: boolean
  enableCaching: boolean
  cacheTTL: number
  enableResize: boolean
  enableFormatConversion: boolean
  fallbackFormat: string
}

// Image metadata
interface ImageMetadata {
  id: string
  filename: string
  originalSize: number
  optimizedSize: number
  dimensions: {
    width: number
    height: number
  }
  format: string
  quality: number
  url: string
  thumbnailUrl?: string
  createdAt: Date
  updatedAt: Date
}

export class ImageOptimizer {
  private config: ImageConfig
  private cdnConfig: CDNConfig
  private imageCache: Map<string, ImageMetadata>

  constructor(
    imageConfig: Partial<ImageConfig> = {},
    cdnConfig: Partial<CDNConfig> = {}
  ) {
    this.config = {
      quality: 85,
      format: 'webp',
      maxWidth: 1920,
      maxHeight: 1080,
      enableWebP: true,
      enableAvif: true,
      compressionLevel: 6,
      ...imageConfig
    }

    this.cdnConfig = {
      baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.akwaabahomes.com',
      enableCompression: true,
      enableCaching: true,
      cacheTTL: 86400, // 24 hours
      enableResize: true,
      enableFormatConversion: true,
      fallbackFormat: 'jpeg',
      ...cdnConfig
    }

    this.imageCache = new Map()
  }

  /**
   * Optimize and upload image
   */
  async optimizeAndUpload(
    file: File | Buffer,
    options: TransformOptions = {},
    bucket: string = 'property-images'
  ): Promise<ImageMetadata> {
    try {
      // Generate unique filename
      const filename = this.generateFilename(file, options)
      
      // Check cache first
      const cacheKey = `image:${filename}:${JSON.stringify(options)}`
      const cached = memoryCache.get<ImageMetadata>(cacheKey)
      if (cached) {
        return cached
      }

      // Process image
      const processedImage = await this.processImage(file, options)
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, processedImage, {
          contentType: this.getMimeType(options.format || this.config.format),
          upsert: true
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename)

      // Create metadata
      const metadata: ImageMetadata = {
        id: data.path,
        filename,
        originalSize: file instanceof File ? file.size : file.length,
        optimizedSize: processedImage.length,
        dimensions: {
          width: options.width || this.config.maxWidth,
          height: options.height || this.config.maxHeight
        },
        format: options.format || this.config.format,
        quality: options.quality || this.config.quality,
        url: urlData.publicUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Cache the result
      memoryCache.set(cacheKey, metadata, this.cdnConfig.cacheTTL)
      this.imageCache.set(metadata.id, metadata)

      return metadata
    } catch (error) {
      console.error('Image optimization failed:', error)
      throw error
    }
  }

  /**
   * Generate optimized image URL with CDN parameters
   */
  generateCDNUrl(
    imageUrl: string,
    options: TransformOptions = {}
  ): string {
    if (!this.cdnConfig.enableResize && !this.cdnConfig.enableFormatConversion) {
      return imageUrl
    }

    const params = new URLSearchParams()

    if (options.width) params.append('w', options.width.toString())
    if (options.height) params.append('h', options.height.toString())
    if (options.quality) params.append('q', options.quality.toString())
    if (options.format) params.append('f', options.format)
    if (options.fit) params.append('fit', options.fit)
    if (options.crop) params.append('crop', options.crop)
    if (options.gravity) params.append('g', options.gravity)
    if (options.blur) params.append('blur', options.blur.toString())
    if (options.sharpen) params.append('sharpen', options.sharpen.toString())
    if (options.rotate) params.append('r', options.rotate.toString())
    if (options.flip) params.append('flip', options.flip)
    if (options.background) params.append('bg', options.background)

    // Add CDN-specific parameters
    if (this.cdnConfig.enableCompression) {
      params.append('compress', 'true')
    }

    const separator = imageUrl.includes('?') ? '&' : '?'
    return `${imageUrl}${separator}${params.toString()}`
  }

  /**
   * Create responsive image URLs for different screen sizes
   */
  generateResponsiveUrls(
    imageUrl: string,
    breakpoints: { [key: string]: number } = {}
  ): { [key: string]: string } {
    const defaultBreakpoints = {
      xs: 480,
      sm: 768,
      md: 1024,
      lg: 1280,
      xl: 1920
    }

    const finalBreakpoints = { ...defaultBreakpoints, ...breakpoints }
    const urls: { [key: string]: string } = {}

    for (const [breakpoint, width] of Object.entries(finalBreakpoints)) {
      urls[breakpoint] = this.generateCDNUrl(imageUrl, { width })
    }

    return urls
  }

  /**
   * Generate picture element HTML with multiple formats
   */
  generatePictureElement(
    imageUrl: string,
    alt: string,
    options: TransformOptions = {},
    responsive: boolean = true
  ): string {
    const formats = this.getSupportedFormats()
    const breakpoints = responsive ? { sm: 768, md: 1024, lg: 1280 } : {}

    let pictureHtml = '<picture>\n'

    // Add WebP and AVIF sources if supported
    if (formats.includes('webp')) {
      pictureHtml += `  <source srcset="${this.generateCDNUrl(imageUrl, { ...options, format: 'webp' })}" type="image/webp">\n`
    }
    
    if (formats.includes('avif')) {
      pictureHtml += `  <source srcset="${this.generateCDNUrl(imageUrl, { ...options, format: 'avif' })}" type="image/avif">\n`
    }

    // Add responsive sources
    if (responsive) {
      for (const [breakpoint, width] of Object.entries(breakpoints)) {
        const responsiveUrl = this.generateCDNUrl(imageUrl, { ...options, width })
        pictureHtml += `  <source media="(min-width: ${width}px)" srcset="${responsiveUrl}">\n`
      }
    }

    // Fallback image
    const fallbackUrl = this.generateCDNUrl(imageUrl, { ...options, format: this.cdnConfig.fallbackFormat as any })
    pictureHtml += `  <img src="${fallbackUrl}" alt="${alt}" loading="lazy">\n`
    pictureHtml += '</picture>'

    return pictureHtml
  }

  /**
   * Process image with transformations
   */
  private async processImage(
    file: File | Buffer,
    options: TransformOptions
  ): Promise<Buffer> {
    // In a real implementation, you would use a library like Sharp or Jimp
    // For now, we'll return the original file as a buffer
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
    
    return file
  }

  /**
   * Generate unique filename
   */
  private generateFilename(
    file: File | Buffer,
    options: TransformOptions
  ): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = options.format || this.config.format
    
    if (file instanceof File) {
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      return `${originalName}-${timestamp}-${random}.${extension}`
    }
    
    return `image-${timestamp}-${random}.${extension}`
  }

  /**
   * Get MIME type for format
   */
  private getMimeType(format: string): string {
    const mimeTypes: { [key: string]: string } = {
      webp: 'image/webp',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      avif: 'image/avif'
    }
    
    return mimeTypes[format] || 'image/jpeg'
  }

  /**
   * Get supported formats based on configuration
   */
  private getSupportedFormats(): string[] {
    const formats = ['jpeg', 'png']
    
    if (this.config.enableWebP) {
      formats.push('webp')
    }
    
    if (this.config.enableAvif) {
      formats.push('avif')
    }
    
    return formats
  }

  /**
   * Create thumbnail for image
   */
  async createThumbnail(
    imageUrl: string,
    width: number = 300,
    height: number = 200,
    quality: number = 80
  ): Promise<string> {
    const thumbnailUrl = this.generateCDNUrl(imageUrl, {
      width,
      height,
      quality,
      fit: 'cover',
      format: 'webp'
    })

    return thumbnailUrl
  }

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    files: (File | Buffer)[],
    options: TransformOptions = {},
    bucket: string = 'property-images'
  ): Promise<ImageMetadata[]> {
    const promises = files.map(file => 
      this.optimizeAndUpload(file, options, bucket)
    )

    return Promise.all(promises)
  }

  /**
   * Get image statistics
   */
  getImageStats(): any {
    const totalImages = this.imageCache.size
    let totalOriginalSize = 0
    let totalOptimizedSize = 0

    for (const metadata of this.imageCache.values()) {
      totalOriginalSize += metadata.originalSize
      totalOptimizedSize += metadata.optimizedSize
    }

    const compressionRatio = totalOriginalSize > 0 
      ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100
      : 0

    return {
      totalImages,
      totalOriginalSize,
      totalOptimizedSize,
      compressionRatio: compressionRatio.toFixed(2),
      averageCompression: compressionRatio.toFixed(2) + '%'
    }
  }

  /**
   * Clean up expired images
   */
  async cleanupExpiredImages(bucket: string = 'property-images'): Promise<void> {
    try {
      // List all files in bucket
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1000 })

      if (error) {
        console.error('Failed to list files:', error)
        return
      }

      if (!files) return

      const now = Date.now()
      const expiredFiles: string[] = []

      // Check each file for expiration
      for (const file of files) {
        const metadata = this.imageCache.get(file.name)
        if (metadata) {
          const age = now - metadata.createdAt.getTime()
          const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
          
          if (age > maxAge) {
            expiredFiles.push(file.name)
          }
        }
      }

      // Delete expired files
      if (expiredFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(expiredFiles)

        if (deleteError) {
          console.error('Failed to delete expired files:', deleteError)
        } else {
          console.log(`Deleted ${expiredFiles.length} expired images`)
          
          // Remove from cache
          expiredFiles.forEach(filename => {
            for (const [key, metadata] of this.imageCache.entries()) {
              if (metadata.filename === filename) {
                this.imageCache.delete(key)
                break
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  /**
   * Update image configuration
   */
  updateConfig(newConfig: Partial<ImageConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Update CDN configuration
   */
  updateCDNConfig(newConfig: Partial<CDNConfig>): void {
    this.cdnConfig = { ...this.cdnConfig, ...newConfig }
  }
}

// CDN utilities
export const cdnUtils = {
  /**
   * Generate cache-busting URL
   */
  addCacheBuster(url: string, version?: string): string {
    const separator = url.includes('?') ? '&' : '?'
    const cacheBuster = version || Date.now().toString()
    return `${url}${separator}v=${cacheBuster}`
  },

  /**
   * Check if image format is supported by browser
   */
  isFormatSupported(format: string): boolean {
    if (typeof window === 'undefined') return true // Server-side

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return false

    try {
      // Test WebP support
      if (format === 'webp') {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      
      // Test AVIF support
      if (format === 'avif') {
        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
      }
      
      return true
    } catch {
      return false
    }
  },

  /**
   * Get optimal image format for browser
   */
  getOptimalFormat(): string {
    if (typeof window === 'undefined') return 'webp' // Server-side

    if (cdnUtils.isFormatSupported('avif')) {
      return 'avif'
    }
    
    if (cdnUtils.isFormatSupported('webp')) {
      return 'webp'
    }
    
    return 'jpeg'
  },

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(
    baseUrl: string,
    widths: number[],
    options: TransformOptions = {}
  ): string {
    return widths
      .map(width => {
        const url = this.generateCDNUrl(baseUrl, { ...options, width })
        return `${url} ${width}w`
      })
      .join(', ')
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer()




















