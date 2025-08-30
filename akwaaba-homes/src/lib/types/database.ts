// Database Types for Akwaaba Homes - Matches Supabase Schema Exactly

// User Roles (only admin, seller, agent - no buyer accounts)
export type UserRole = 'admin' | 'seller' | 'agent';

// Verification Status
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// Subscription Tiers
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

// Property Types
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'office';

// Listing Types
export type ListingType = 'sale' | 'rent' | 'lease';

// Property Status
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'rented' | 'inactive';

// Image Types
export type ImageType = 'primary' | 'gallery' | 'floorplan' | 'exterior' | 'interior';

// Inquiry Types
export type InquiryType = 'general' | 'viewing' | 'offer' | 'question';

// Inquiry Status
export type InquiryStatus = 'pending' | 'responded' | 'closed' | 'spam';

// Verification Types
export type VerificationType = 'identity' | 'business' | 'property_ownership' | 'agent_license';

// Document Types
export type DocumentType = 'passport' | 'drivers_license' | 'national_id' | 'business_license' | 'property_deed';

// Analytics Event Types
export type AnalyticsEventType = 'property_view' | 'search' | 'inquiry' | 'favorite' | 'share';

// Database Table Types
export interface DatabaseUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  user_type: UserRole;
  profile_image_url?: string;
  is_verified: boolean;
  verification_status: VerificationStatus;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProperty {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  currency: 'GHS'; // Fixed: Use literal type instead of string
  address: string;
  city: string;
  region: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  land_size?: number;
  year_built?: number;
  features: string[];
  amenities: string[];
  status: PropertyStatus;
  is_featured: boolean;
  views_count: number;
  image_urls?: string[]; // Add missing field for image URLs
  created_at: string;
  updated_at: string;
}

export interface DatabasePropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  image_type: ImageType;
  is_primary: boolean;
  alt_text?: string;
  order_index: number;
  created_at: string;
}

export interface DatabaseInquiry {
  id: string;
  property_id: string;
  buyer_id?: string; // Nullable since buyers don't have accounts
  buyer_name?: string; // For anonymous inquiries
  buyer_email?: string; // For anonymous inquiries
  buyer_phone?: string; // For anonymous inquiries
  is_anonymous: boolean;
  message: string;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  agent_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseVerification {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  document_url?: string;
  document_type?: DocumentType;
  status: VerificationStatus;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAnalytics {
  id: string;
  user_id?: string; // Nullable for anonymous users
  property_id?: string; // Nullable for search events
  event_type: AnalyticsEventType;
  event_data?: any; // JSONB data
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Extended Types with Relationships
export interface PropertyWithDetails extends DatabaseProperty {
  seller: DatabaseUser;
  images: DatabasePropertyImage[];
  inquiries: DatabaseInquiry[];
}

export interface UserWithDetails extends DatabaseUser {
  properties: DatabaseProperty[];
  verifications: DatabaseVerification[];
}

export interface InquiryWithDetails extends DatabaseInquiry {
  property: DatabaseProperty;
  buyer?: DatabaseUser; // Only if buyer_id exists
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter Types
export interface PropertySearchFilters {
  property_type?: PropertyType[];
  listing_type?: ListingType[];
  price_min?: number;
  price_max?: number;
  city?: string;
  region?: string;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  features?: string[];
  amenities?: string[];
  is_featured?: boolean;
  status?: PropertyStatus;
}

export interface PropertySearchParams extends PropertySearchFilters {
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'created_at' | 'views_count';
  sort_order?: 'asc' | 'desc';
}

// Dashboard Stats Types
export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalViews: number;
  totalInquiries: number;
  responseRate: number;
  averageResponseTime: string;
  monthlyEarnings?: number;
  conversionRate: number;
}

// Form Types for Creating/Updating
export interface CreatePropertyForm {
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  currency: 'GHS'; // Fixed: Use literal type instead of string
  address: string;
  city: string;
  region: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  land_size?: number;
  year_built?: number;
  features: string[];
  amenities: string[];
}

export interface CreateInquiryForm {
  property_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  inquiry_type: InquiryType;
}

export interface UpdateUserForm {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  subscription_tier?: SubscriptionTier;
}
