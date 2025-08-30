// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  user_role: 'user' | 'seller' | 'admin';
  is_verified: boolean;
  last_login?: string;
}

export interface UserProfile extends Omit<User, 'email'> {
  user_id: string;
}

// Property types - removed conflicting Property interface
export interface LegacyProperty extends BaseEntity {
  title: string;
  description: string;
  price: number;
  location: string;
  property_type: 'house' | 'apartment' | 'land' | 'commercial';
  listing_type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'pending' | 'active' | 'inactive' | 'sold' | 'rented';
  seller_id: string;
  views_count: number;
  featured: boolean;
}

export interface PropertyImage extends BaseEntity {
  property_id: string;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  order_index: number;
}

// Removed PropertyWithImages interface to avoid conflicts

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Form types
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  property_type: 'house' | 'apartment' | 'land' | 'commercial';
  listing_type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  area: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

// Search and sorting types
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
