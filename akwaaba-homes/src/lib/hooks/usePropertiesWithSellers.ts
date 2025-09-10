import { useState, useCallback, useEffect } from 'react';
import { useProperties } from './useApi';
import { Property } from '@/lib/types/index';
import { DatabaseProperty } from '@/lib/types/database';

interface Seller {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
}

interface SellersResponse {
  sellers: Record<string, Seller>;
}

// Transform database property with seller data
const transformDatabasePropertyWithSeller = (dbProperty: DatabaseProperty, sellers: Record<string, Seller>): Property => {
  const seller = sellers[dbProperty.seller_id];
  
  return {
    id: dbProperty.id,
    title: dbProperty.title || 'Untitled Property',
    description: dbProperty.description || '',
    price: dbProperty.price || 0,
    currency: 'GHS', // Always GHS for Ghana
    status: dbProperty.status === 'active' ? 'for-sale' : 
            dbProperty.status === 'sold' ? 'sold' : 
            dbProperty.status === 'rented' ? 'rented' : 'for-sale',
    type: dbProperty.property_type === 'office' ? 'commercial' : dbProperty.property_type,
    
    // Location & Geo-tagging (mandatory)
    location: {
      address: dbProperty.address || '',
      city: dbProperty.city || '',
      region: dbProperty.region || '',
      country: 'Ghana',
      coordinates: {
        lat: dbProperty.latitude || 5.6037, // Default to Accra coordinates
        lng: dbProperty.longitude || -0.1870,
      },
      plusCode: undefined, // Will be generated later
    },

    // Property Details
    specifications: {
      bedrooms: dbProperty.bedrooms,
      bathrooms: dbProperty.bathrooms,
      size: dbProperty.square_feet || dbProperty.land_size || 0,
      sizeUnit: 'sqft',
      lotSize: dbProperty.land_size,
      lotSizeUnit: 'sqft',
      yearBuilt: dbProperty.year_built,
      parkingSpaces: undefined,
    },

    // Media
    images: dbProperty.image_urls || [], // Use the image_urls from database
    videos: undefined,
    virtualTour: undefined,
    
    // Features & Amenities
    features: dbProperty.features || [],
    amenities: dbProperty.amenities || [],
    
    // Seller Information - now with actual data
    seller: seller ? {
      id: seller.id,
      name: seller.full_name || 'Unknown Seller',
      full_name: seller.full_name,
      email: seller.email,
      phone: seller.phone,
      type: 'individual',
      isVerified: seller.is_verified || false,
      company: undefined,
      licenseNumber: undefined,
    } : {
      id: dbProperty.seller_id,
      name: 'Unknown Seller',
      full_name: null,
      email: null,
      phone: null,
      type: 'individual',
      isVerified: false,
      company: undefined,
      licenseNumber: undefined,
    },

    // Trust & Verification
    verification: {
      isVerified: false, // Will be updated based on actual verification status
      documentsUploaded: false, // Will be updated based on actual status
      verificationDate: undefined,
      adminNotes: undefined,
    },

    // Timestamps
    createdAt: dbProperty.created_at || new Date().toISOString(),
    updatedAt: dbProperty.updated_at || new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    
    // Visibility Tier
    tier: dbProperty.is_featured ? 'premium' : 'normal',
    
    // Diaspora Features
    diasporaFeatures: {
      multiCurrencyDisplay: true,
      inspectionScheduling: true,
      virtualTourAvailable: false,
      familyRepresentativeContact: undefined,
    },
  };
};

export function usePropertiesWithSellers() {
  const { getProperties, loading: propertiesLoading, error: propertiesError, data: propertiesData } = useProperties();
  const [sellers, setSellers] = useState<Record<string, Seller>>({});
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellersError, setSellersError] = useState<string | null>(null);
  const [transformedProperties, setTransformedProperties] = useState<Property[]>([]);

  // Fetch sellers data
  const fetchSellers = useCallback(async (sellerIds: string[]) => {
    if (sellerIds.length === 0) return;
    
    try {
      setSellersLoading(true);
      setSellersError(null);
      
      const response = await fetch(`/api/sellers?ids=${sellerIds.join(',')}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sellers: ${response.statusText}`);
      }
      
      const data: SellersResponse = await response.json();
      setSellers(data.sellers);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSellersError(error instanceof Error ? error.message : 'Failed to fetch sellers');
    } finally {
      setSellersLoading(false);
    }
  }, []);

  // Fetch properties and sellers
  const fetchPropertiesWithSellers = useCallback(async (filters?: Record<string, unknown>) => {
    try {
      console.log('🔄 usePropertiesWithSellers: Starting fetch with filters:', filters);
      
      // First fetch properties
      const response = await getProperties(filters);
      console.log('🔄 usePropertiesWithSellers: Properties response:', response);
      
      if (response?.success && response.data) {
        const properties = response.data as DatabaseProperty[];
        console.log('🔄 usePropertiesWithSellers: Properties data:', properties);
        
        // Extract unique seller IDs
        const sellerIds = [...new Set(properties.map(p => p.seller_id).filter(Boolean))];
        console.log('🔄 usePropertiesWithSellers: Unique seller IDs:', sellerIds);
        
        // Fetch sellers data
        await fetchSellers(sellerIds);
        
        // Transform properties with seller data
        const transformed = properties.map(property => 
          transformDatabasePropertyWithSeller(property, sellers)
        );
        
        console.log('🔄 usePropertiesWithSellers: Transformed properties:', transformed);
        setTransformedProperties(transformed);
      }
    } catch (error) {
      console.error('Error fetching properties with sellers:', error);
    }
  }, [getProperties, fetchSellers, sellers]);

  // Update transformed properties when sellers data changes
  useEffect(() => {
    if (propertiesData && Object.keys(sellers).length > 0) {
      const properties = propertiesData as DatabaseProperty[];
      const transformed = properties.map(property => 
        transformDatabasePropertyWithSeller(property, sellers)
      );
      setTransformedProperties(transformed);
    }
  }, [propertiesData, sellers]);

  return {
    properties: transformedProperties,
    loading: propertiesLoading || sellersLoading,
    error: propertiesError || sellersError,
    fetchPropertiesWithSellers,
  };
}
