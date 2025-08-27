import { DatabaseProperty, PropertyStatus, PropertyType } from '@/lib/types/database';

export interface PropertyFilters {
  status?: PropertyStatus;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'created_at' | 'views' | 'area';
  sort_order?: 'asc' | 'desc';
}

export interface SearchFilters extends PropertyFilters {
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_area?: number;
  max_area?: number;
  state?: string;
  features?: string[];
  sort_by?: 'price' | 'created_at' | 'views' | 'area';
  sort_order?: 'asc' | 'desc';
}

export interface PropertyResponse {
  properties: DatabaseProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResponse extends PropertyResponse {
  search_metadata: {
    query: string;
    filters_applied: string[];
    sort_by: string;
    sort_order: string;
  };
}

export interface FeaturedPropertiesResponse {
  properties: DatabaseProperty[];
  metadata: {
    total: number;
    filters: {
      property_type?: string;
      city?: string;
    };
    selection_criteria: string;
  };
}

class PropertyService {
  private baseUrl = '/api/properties';

  // Get all properties with filters
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyResponse> {
    const params = new URLSearchParams();
    
    // Handle both naming conventions (frontend and backend)
    if (filters.status) params.append('status', filters.status);
    if (filters.property_type) params.append('property_type', filters.property_type);
    if (filters.min_price) params.append('min_price', filters.min_price.toString());
    if (filters.max_price) params.append('max_price', filters.max_price.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    // Also handle frontend naming convention
    if ((filters as any).propertyType) params.append('property_type', (filters as any).propertyType);
    if ((filters as any).minPrice) params.append('min_price', (filters as any).minPrice.toString());
    if ((filters as any).maxPrice) params.append('max_price', (filters as any).maxPrice.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }

    return response.json();
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<{ property: DatabaseProperty }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Property not found');
      }
      throw new Error(`Failed to fetch property: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new property
  async createProperty(propertyData: Omit<DatabaseProperty, 'id' | 'seller_id' | 'created_at' | 'updated_at' | 'views'>): Promise<{ message: string; property: DatabaseProperty }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create property');
    }

    return response.json();
  }

  // Update property
  async updateProperty(id: string, updates: Partial<DatabaseProperty>): Promise<{ message: string; property: DatabaseProperty }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update property');
    }

    return response.json();
  }

  // Delete property
  async deleteProperty(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete property');
    }

    return response.json();
  }

  // Get featured properties
  async getFeaturedProperties(limit: number = 6, propertyType?: string, city?: string): Promise<FeaturedPropertiesResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (propertyType) params.append('property_type', propertyType);
    if (city) params.append('city', city);

    const response = await fetch(`${this.baseUrl}/featured?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured properties: ${response.statusText}`);
    }

    return response.json();
  }

  // Search properties with advanced filters
  async searchProperties(searchData: SearchFilters): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search properties');
    }

    return response.json();
  }

  // Get property images
  async getPropertyImages(propertyId: string): Promise<{ images: any[] }> {
    const response = await fetch(`${this.baseUrl}/${propertyId}/images`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch property images: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload property image
  async uploadPropertyImage(propertyId: string, imageData: { image_url: string; caption?: string; is_primary?: boolean }): Promise<{ message: string; image: any }> {
    const response = await fetch(`${this.baseUrl}/${propertyId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    return response.json();
  }

  // Update property image
  async updatePropertyImage(propertyId: string, imageId: string, updates: any): Promise<{ message: string; image: any }> {
    const response = await fetch(`${this.baseUrl}/${propertyId}/images`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_id: imageId, updates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update image');
    }

    return response.json();
  }

  // Delete property image
  async deletePropertyImage(propertyId: string, imageId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${propertyId}/images?image_id=${imageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }

    return response.json();
  }

  // Increment property views (this is now handled automatically by the API)
  async incrementViews(propertyId: string): Promise<void> {
    // Views are automatically incremented when viewing a property via the API
    // This method is kept for backward compatibility
    console.log('Property views are automatically tracked via the API');
  }
}

export const propertyService = new PropertyService();
export default propertyService;
