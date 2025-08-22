// Core Types for AkwaabaHomes Platform

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // Always in GHS
  currency: 'GHS';
  status: 'for-sale' | 'for-rent' | 'short-let' | 'sold' | 'rented';
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'townhouse' | 'condo';
  
  // Location & Geo-tagging (mandatory)
  location: {
    address: string;
    city: string;
    region: string;
    country: 'Ghana';
    coordinates: {
      lat: number;
      lng: number;
    };
    plusCode?: string; // Google Plus Code
  };

  // Property Details
  specifications: {
    bedrooms?: number;
    bathrooms?: number;
    size: number; // in square feet or meters
    sizeUnit: 'sqft' | 'sqm';
    lotSize?: number;
    lotSizeUnit?: 'sqft' | 'sqm' | 'acres';
    yearBuilt?: number;
    parkingSpaces?: number;
  };

  // Media
  images: string[]; // minimum 3 required
  videos?: string[];
  virtualTour?: string;
  
  // Features & Amenities
  features: string[];
  amenities: string[];
  
  // Seller Information
  seller: {
    id: string;
    name: string;
    type: 'individual' | 'agent' | 'developer';
    phone: string;
    email?: string;
    whatsapp?: string;
    isVerified: boolean;
    company?: string;
    licenseNumber?: string;
  };

  // Trust & Verification
  verification: {
    isVerified: boolean;
    documentsUploaded: boolean;
    verificationDate?: string;
    adminNotes?: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt: string; // 30 days from creation
  
  // Visibility Tier
  tier: 'normal' | 'premium';
  
  // Diaspora Features
  diasporaFeatures?: {
    multiCurrencyDisplay: boolean;
    inspectionScheduling: boolean;
    virtualTourAvailable: boolean;
    familyRepresentativeContact?: string;
  };
}

export interface SearchFilters {
  location?: string;
  type?: Property['type'][];
  status?: Property['status'];
  priceRange?: {
    min?: number;
    max?: number;
    currency: CurrencyCode;
  };
  bedrooms?: {
    min?: number;
    max?: number;
  };
  bathrooms?: {
    min?: number;
    max?: number;
  };
  sizeRange?: {
    min?: number;
    max?: number;
    unit: 'sqft' | 'sqm';
  };
  verifiedOnly?: boolean;
  features?: string[];
  amenities?: string[];
  tier?: Property['tier'][];
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: SearchFilters;
  sortBy: SortOption;
}

export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'price-low-high' 
  | 'price-high-low' 
  | 'size-large-small' 
  | 'size-small-large'
  | 'relevance';

export type CurrencyCode = 'GHS' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyRate {
  code: CurrencyCode;
  rate: number; // Rate relative to GHS
  symbol: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  type: 'buyer' | 'seller' | 'both';
  location?: {
    country: string;
    region?: string;
  };
  preferences: {
    currency: CurrencyCode;
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
    savedSearches: SearchFilters[];
    favoriteProperties: string[];
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Agent extends User {
  type: 'seller';
  agentProfile: {
    company?: string;
    licenseNumber?: string;
    experienceYears?: number;
    specializations: Property['type'][];
    bio?: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    isVerified: boolean;
    verificationDocuments?: string[];
  };
}

export interface ListingTier {
  id: 'normal' | 'premium';
  name: string;
  price: number; // in GHS
  features: string[];
  duration: number; // days
  maxImages: number;
  maxVideos: number;
  searchRanking: number; // 1-10, 10 being highest
  homepageVisibility: boolean;
  diasporaBoost: boolean;
  analytics: boolean;
}

export interface InspectionRequest {
  id: string;
  propertyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestedDate: string;
  requestedTime: string;
  inspectorType: 'family' | 'representative' | 'self';
  inspectorContact?: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  insights: {
    averagePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    popularPropertyTypes: Property['type'][];
    averageDaysOnMarket: number;
    schools: Array<{
      name: string;
      type: 'primary' | 'secondary' | 'university';
      rating?: number;
    }>;
    amenities: Array<{
      name: string;
      type: 'hospital' | 'market' | 'bank' | 'restaurant' | 'transport';
      distance: number; // in km
    }>;
    transport: Array<{
      type: 'bus' | 'trotro' | 'taxi' | 'train';
      description: string;
    }>;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Form Types
export interface PropertyFormData extends Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'images' | 'videos'> {
  tier: ListingTier['id'];
  images: File[];
  videos?: File[];
  documents?: File[];
}

export interface SearchFormData {
  query: string;
  location?: string;
  type?: Property['type'];
  priceMin?: number;
  priceMax?: number;
  currency?: CurrencyCode;
  bedrooms?: number;
  bathrooms?: number;
}

// Component Props Types
export interface PropertyCardProps {
  property: Property;
  viewMode: 'grid' | 'list';
  showCurrency?: CurrencyCode;
  onSave?: (propertyId: string) => void;
  onContact?: (property: Property) => void;
  className?: string;
}

export interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  defaultValues?: Partial<SearchFormData>;
  showAdvancedFilters?: boolean;
  className?: string;
}

export interface MapProps {
  properties: Property[];
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}
