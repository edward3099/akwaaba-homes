import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// Property validation schemas
export const propertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']),
  listing_type: z.enum(['sale', 'rent']),
  bedrooms: z.number().int().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().int().min(0, 'Bathrooms cannot be negative'),
  area: z.number().positive('Area must be positive'),
  status: z.enum(['pending', 'active', 'inactive', 'sold', 'rented']).default('pending')
});

export const propertyUpdateSchema = propertySchema.partial();

export const propertyFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  property_type: z.enum(['house', 'apartment', 'land', 'commercial']).optional(),
  listing_type: z.enum(['sale', 'rent']).optional(),
  location: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  status: z.enum(['active', 'pending', 'inactive']).default('active')
});

// User validation schemas
export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  user_role: z.enum(['user', 'seller', 'admin']).default('user')
});

export const userUpdateSchema = userProfileSchema.partial();

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

// Image validation
export const imageUploadSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  image_url: z.string().url('Invalid image URL'),
  caption: z.string().max(200, 'Caption too long').optional(),
  is_primary: z.boolean().default(false)
});

// Utility functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

