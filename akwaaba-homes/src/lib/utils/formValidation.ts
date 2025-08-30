import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Comprehensive validation schemas for AkwaabaHomes forms
 * Using Zod for type-safe validation with Ghana-specific patterns
 */

// Common validation patterns
export const validationPatterns = {
  // Ghana phone number patterns (supports various formats)
  phone: /^(\+233|0)?[235679][0-9]{8}$/,
  
  // Ghana postal codes (if applicable)
  postalCode: /^[0-9]{5}$/,
  
  // Ghana Plus Codes (location codes)
  plusCode: /^[23456789CFGHJMPQRVWX]{2,3}\+[23456789CFGHJMPQRVWX]+$/,
  
  // Ghana currency (GHS)
  currency: /^[0-9]+(\.[0-9]{1,2})?$/,
  
  // Ghana business registration numbers
  businessReg: /^[A-Z]{2}[0-9]{6,8}$/,
  
  // Ghana license numbers
  licenseNumber: /^[A-Z]{2,3}[0-9]{4,6}$/,
} as const;

// Base user validation schema
export const userValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(validationPatterns.phone, 'Please enter a valid Ghana phone number'),
  
  company_name: z
    .string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  business_type: z
    .string()
    .min(1, 'Business type is required'),
  
  license_number: z
    .string()
    .min(1, 'License number is required')
    .regex(validationPatterns.licenseNumber, 'Please enter a valid license number format'),
  
  experience_years: z
    .number()
    .min(0, 'Experience years cannot be negative')
    .max(50, 'Experience years cannot exceed 50'),
  
  bio: z
    .string()
    .min(1, 'Bio is required')
    .min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
});

// Property validation schema
export const propertyValidationSchema = z.object({
  title: z
    .string()
    .min(1, 'Property title is required')
    .min(5, 'Property title must be at least 5 characters')
    .max(100, 'Property title must be less than 100 characters'),
  
  description: z
    .string()
    .min(1, 'Property description is required')
    .min(20, 'Property description must be at least 20 characters')
    .max(2000, 'Property description must be less than 2000 characters'),
  
  price: z
    .number()
    .min(1000, 'Property price must be at least GHS 1,000')
    .max(10000000, 'Property price cannot exceed GHS 10,000,000'),
  
  currency: z
    .literal('GHS')
    .default('GHS'),
  
  property_type: z
    .string()
    .min(1, 'Property type is required'),
  
  location: z.object({
    address: z
      .string()
      .min(1, 'Address is required')
      .min(10, 'Address must be at least 10 characters'),
    
    coordinates: z
      .tuple([z.number(), z.number()])
      .refine(
        ([lat, lng]) => lat >= 4.5 && lat <= 11.2 && lng >= -3.3 && lng <= 1.3,
        'Coordinates must be within Ghana'
      ),
    
    plusCode: z
      .string()
      .regex(validationPatterns.plusCode, 'Please enter a valid Plus Code')
      .optional(),
    
    region: z
      .string()
      .min(1, 'Region is required'),
    
    city: z
      .string()
      .min(1, 'City is required'),
  }),
  
  features: z
    .array(z.string())
    .min(1, 'At least one feature must be selected')
    .max(20, 'Cannot select more than 20 features'),
  
  images: z
    .array(z.string())
    .min(1, 'At least one image is required')
    .max(10, 'Cannot upload more than 10 images'),
  
  verification: z.object({
    geoTagged: z.boolean().default(false),
    documentsVerified: z.boolean().default(false),
    sellerVerified: z.boolean().default(false),
  }),
});

// Admin validation schema
export const adminValidationSchema = userValidationSchema.extend({
  permissions: z
    .array(z.enum(['read', 'write', 'delete', 'admin']))
    .min(1, 'At least one permission must be selected'),
  
  role: z
    .enum(['admin', 'super_admin'])
    .default('admin'),
});

// Form validation helper functions
export const validateForm = {
  /**
   * Validate a form using a Zod schema
   */
  withSchema: <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
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
  },

  /**
   * Validate and show toast errors
   */
  withToast: <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
    const result = validateForm.withSchema(schema, data);
    
    if (!result.success && 'errors' in result) {
      // Show first error as toast
      toast.error('Validation Error', {
        description: result.errors[0],
        action: {
          label: 'View All',
          onClick: () => {
            // Show all errors in a detailed toast
            toast.error('All Validation Errors', {
              description: result.errors.join('\n'),
              duration: 8000,
            });
          }
        }
      });
      return null;
    }
    
    return result.data;
  },

  /**
   * Validate specific fields
   */
  field: {
    email: (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    phone: (phone: string): boolean => {
      return validationPatterns.phone.test(phone);
    },
    
    password: (password: string): string[] => {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      return errors;
    },
    
    price: (price: number): boolean => {
      return price >= 1000 && price <= 10000000;
    },
    
    coordinates: (lat: number, lng: number): boolean => {
      return lat >= 4.5 && lat <= 11.2 && lng >= -3.3 && lng <= 1.3;
    },
  },
};

// React Hook Form validation resolver
export const createValidationResolver = <T>(schema: z.ZodSchema<T>) => {
  return async (data: unknown) => {
    try {
      const validatedData = schema.parse(data);
      return {
        values: validatedData,
        errors: {},
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.reduce((acc, err) => {
          const path = err.path.join('.');
          acc[path] = {
            type: 'manual',
            message: err.message,
          };
          return acc;
        }, {} as Record<string, { type: string; message: string }>);
        
        return {
          values: {},
          errors,
        };
      }
      
      return {
        values: {},
        errors: {
          root: {
            type: 'manual',
            message: 'Validation failed',
          },
        },
      };
    }
  };
};

// Common validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid Ghana phone number',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be less than ${max} characters`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Cannot exceed ${max}`,
  coordinates: 'Coordinates must be within Ghana',
  plusCode: 'Please enter a valid Plus Code',
  licenseNumber: 'Please enter a valid license number format',
  businessReg: 'Please enter a valid business registration number',
} as const;

// Export types
export type UserFormData = z.infer<typeof userValidationSchema>;
export type PropertyFormData = z.infer<typeof propertyValidationSchema>;
export type AdminFormData = z.infer<typeof adminValidationSchema>;
