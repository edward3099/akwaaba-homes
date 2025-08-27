// Application constants
export const APP_NAME = 'Akwaaba Homes';
export const APP_DESCRIPTION = 'Your trusted partner in real estate';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile'
  },
  PROPERTIES: {
    LIST: '/api/properties',
    DETAIL: (id: string) => `/api/properties/${id}`,
    CREATE: '/api/properties',
    UPDATE: (id: string) => `/api/properties/${id}`,
    DELETE: (id: string) => `/api/properties/${id}`,
    SEARCH: '/api/properties/search',
    FEATURED: '/api/properties/featured',
    IMAGES: (id: string) => `/api/properties/${id}/images`,
    UPLOAD_IMAGE: (id: string) => `/api/properties/${id}/images/upload`
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/profile',
    UPLOAD_AVATAR: '/api/users/avatar'
  }
} as const;

// Property types and categories
export const PROPERTY_TYPES = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  LAND: 'land',
  COMMERCIAL: 'commercial'
} as const;

export const LISTING_TYPES = {
  SALE: 'sale',
  RENT: 'rent'
} as const;

export const PROPERTY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SOLD: 'sold',
  RENTED: 'rented'
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Form validation limits
export const VALIDATION_LIMITS = {
  TITLE_MIN: 1,
  TITLE_MAX: 100,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
  BIO_MAX: 500,
  CAPTION_MAX: 200,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/
} as const;

// UI constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  LOADING_DELAY: 1000
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please use JPEG, PNG, or WebP.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters.`,
  MAX_LENGTH: (field: string, max: number) => `${field} cannot exceed ${max} characters.`
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROPERTY_CREATED: 'Property created successfully!',
  PROPERTY_UPDATED: 'Property updated successfully!',
  PROPERTY_DELETED: 'Property deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'akwaaba_auth_token',
  USER_PROFILE: 'akwaaba_user_profile',
  THEME: 'akwaaba_theme',
  LANGUAGE: 'akwaaba_language',
  RECENT_SEARCHES: 'akwaaba_recent_searches',
  FAVORITES: 'akwaaba_favorites'
} as const;

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Language options
export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
  ES: 'es'
} as const;

// Currency options
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  GHS: 'GHS'
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm'
} as const;

