import { supabase } from '@/lib/supabase';

export interface ImageUpload {
  id: string;
  bucket_name: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  user_id: string;
  property_id?: string;
  upload_type: 'property_image' | 'user_avatar' | 'document';
  is_primary: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadRequest {
  bucket_name: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  property_id?: string;
  upload_type: 'property_image' | 'user_avatar' | 'document';
  is_primary?: boolean;
  metadata?: Record<string, any>;
}

export interface ImageVariant {
  original: string;
  large: string;
  medium: string;
  small: string;
  thumbnail: string;
}

export interface ImageGallery {
  property_id: string;
  total_images: number;
  primary_image: {
    id: string;
    url: string;
    thumbnail: string;
    alt: string;
  };
  gallery_images: Array<{
    id: string;
    url: string;
    large_url: string;
    thumbnail: string;
    is_primary: boolean;
    alt: string;
    metadata?: Record<string, any>;
  }>;
}

export interface CDNConfig {
  bucket_name: string;
  cdn_domain: string;
  cache_policy: string;
  compression_enabled: boolean;
  image_optimization_enabled: boolean;
}

export interface ImageTransformation {
  id: string;
  transformation_name: string;
  width?: number;
  height?: number;
  quality: number;
  format: string;
  fit: string;
  background_color: string;
  blur: number;
  sharpen: number;
  filters: Record<string, any>;
}

export class ImageService {
  private static instance: ImageService;
  private supabase: typeof supabase;

  private constructor() {
    this.supabase = supabase;
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Upload a single image file
   */
  async uploadImage(
    file: File,
    propertyId?: string,
    isPrimary: boolean = false,
    metadata: Record<string, any> = {}
  ): Promise<ImageUpload> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate secure file path
      const filePath = this.generateSecureFilePath(file.name, propertyId);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      // Create upload record in database
      const uploadRequest: ImageUploadRequest = {
        bucket_name: 'property-images',
        file_path: filePath,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        property_id: propertyId,
        upload_type: 'property_image',
        is_primary: isPrimary,
        metadata: {
          ...metadata,
          width: metadata.width || 0,
          height: metadata.height || 0,
          alt: metadata.alt || file.name
        }
      };

      const { data: dbData, error: dbError } = await this.supabase
        .rpc('process_image_upload', uploadRequest);

      if (dbError) {
        throw new Error(`Database operation failed: ${dbError.message}`);
      }

      return dbData as ImageUpload;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images in batch
   */
  async uploadImages(
    files: File[],
    propertyId: string,
    primaryIndex: number = 0
  ): Promise<ImageUpload[]> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, propertyId, index === primaryIndex)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Batch image upload failed:', error);
      throw error;
    }
  }

  /**
   * Get image gallery for a property
   */
  async getPropertyImageGallery(
    propertyId: string,
    includeMetadata: boolean = false
  ): Promise<ImageGallery> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_property_image_gallery', {
          p_property_id: propertyId,
          p_include_metadata: includeMetadata
        });

      if (error) {
        throw new Error(`Failed to get image gallery: ${error.message}`);
      }

      return data as ImageGallery;
    } catch (error) {
      console.error('Failed to get image gallery:', error);
      throw error;
    }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    uploadId: string,
    updates: Record<string, any>
  ): Promise<ImageUpload> {
    try {
      const { data, error } = await this.supabase
        .rpc('update_image_metadata', {
          p_upload_id: uploadId,
          p_user_id: (await this.supabase.auth.getUser()).data.user?.id,
          p_updates: updates
        });

      if (error) {
        throw new Error(`Failed to update image metadata: ${error.message}`);
      }

      return data as ImageUpload;
    } catch (error) {
      console.error('Failed to update image metadata:', error);
      throw error;
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(uploadId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('delete_image_upload', {
          p_upload_id: uploadId,
          p_user_id: (await this.supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL with transformation
   */
  getOptimizedImageUrl(
    filePath: string,
    transformation: string = 'medium'
  ): string {
    try {
      // This would typically call the database function
      // For now, return a basic URL structure
      const baseUrl = 'https://nzezwxowonbtbavpwgol.supabase.co/storage/v1/object/public/property-images/';
      return `${baseUrl}${transformation}_${filePath}`;
    } catch (error) {
      console.error('Failed to generate optimized URL:', error);
      return filePath;
    }
  }

  /**
   * Get responsive image URL based on device type
   */
  getResponsiveImageUrl(
    filePath: string,
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  ): string {
    const sizeMap = {
      mobile: 'small',
      tablet: 'medium',
      desktop: 'large'
    };

    return this.getOptimizedImageUrl(filePath, sizeMap[deviceType]);
  }

  /**
   * Preload critical images for a property
   */
  async preloadCriticalImages(propertyId: string): Promise<Record<string, string>> {
    try {
      const { data, error } = await this.supabase
        .rpc('preload_critical_images', { property_id: propertyId });

      if (error) {
        throw new Error(`Failed to preload images: ${error.message}`);
      }

      return data as Record<string, string>;
    } catch (error) {
      console.error('Failed to preload images:', error);
      return {};
    }
  }

  /**
   * Get image statistics
   */
  async getImageStatistics(
    propertyId?: string,
    userId?: string
  ): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_image_statistics', {
          property_id: propertyId,
          user_id: userId
        });

      if (error) {
        throw new Error(`Failed to get image statistics: ${error.message}`);
      }

      return data as Record<string, any>;
    } catch (error) {
      console.error('Failed to get image statistics:', error);
      return {};
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('Invalid file extension. Allowed: jpg, jpeg, png, webp, gif');
    }
  }

  /**
   * Generate secure file path
   */
  private generateSecureFilePath(
    filename: string,
    propertyId?: string
  ): string {
    const timestamp = Date.now();
    const userId = this.supabase.auth.getUser().then(user => user.data.user?.id) || 'anonymous';
    
    if (propertyId) {
      return `properties/${propertyId}/${userId}_${timestamp}_${filename}`;
    } else {
      return `general/${userId}_${timestamp}_${filename}`;
    }
  }

  /**
   * Get CDN configuration
   */
  async getCDNConfig(): Promise<CDNConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('cdn_config')
        .select('*');

      if (error) {
        throw new Error(`Failed to get CDN config: ${error.message}`);
      }

      return data as CDNConfig[];
    } catch (error) {
      console.error('Failed to get CDN config:', error);
      return [];
    }
  }

  /**
   * Get available image transformations
   */
  async getImageTransformations(): Promise<ImageTransformation[]> {
    try {
      const { data, error } = await this.supabase
        .from('image_transformations')
        .select('*')
        .order('transformation_name');

      if (error) {
        throw new Error(`Failed to get transformations: ${error.message}`);
      }

      return data as ImageTransformation[];
    } catch (error) {
      console.error('Failed to get transformations:', error);
      return [];
    }
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();
export default imageService;
