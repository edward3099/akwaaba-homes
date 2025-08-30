import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid' | 'date';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean;
  sanitize?: boolean;
  transform?: (value: any) => any;
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationSchema;
}

export interface ValidationResult {
  isValid: boolean;
  data?: any;
  errors: string[];
  sanitizedData?: any;
}

export interface SanitizationOptions {
  removeScripts: boolean;
  removeStyles: boolean;
  removeComments: boolean;
  removeAttributes: string[];
  allowedTags: string[];
  allowedAttributes: Record<string, string[]>;
  allowedSchemes: string[];
}

/**
 * Comprehensive input validation and sanitization service
 * Provides protection against SQL injection, XSS, and other input-based attacks
 */
export class InputValidationService {
  private static instance: InputValidationService;
  private defaultSanitizationOptions: SanitizationOptions;

  private constructor() {
    this.defaultSanitizationOptions = {
      removeScripts: true,
      removeStyles: true,
      removeComments: true,
      removeAttributes: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'],
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      allowedAttributes: {
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'p': ['class'],
        'div': ['class'],
        'span': ['class']
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel']
    };
  }

  public static getInstance(): InputValidationService {
    if (!InputValidationService.instance) {
      InputValidationService.instance = new InputValidationService();
    }
    return InputValidationService.instance;
  }

  /**
   * Validate and sanitize input data against a schema
   */
  validateAndSanitize(
    data: any,
    schema: ValidationSchema,
    options: Partial<SanitizationOptions> = {}
  ): ValidationResult {
    try {
      // First validate the data
      const validationResult = this.validate(data, schema);
      
      if (!validationResult.isValid) {
        return validationResult;
      }

      // Then sanitize the validated data
      const sanitizedData = this.sanitizeData(validationResult.data, {
        ...this.defaultSanitizationOptions,
        ...options
      });

      return {
        isValid: true,
        data: validationResult.data,
        sanitizedData,
        errors: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Validate data against a schema
   */
  private validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const validatedData: any = {};

    for (const [key, rule] of Object.entries(schema)) {
      const value = data[key];
      const validationResult = this.validateField(value, rule, key);

      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);
      } else {
        validatedData[key] = validationResult.data;
      }
    }

    return {
      isValid: errors.length === 0,
      data: validatedData,
      errors
    };
  }

  /**
   * Validate a single field
   */
  private validateField(value: any, rule: ValidationRule | ValidationSchema, fieldName: string): ValidationResult {
    // Handle nested schemas
    if (this.isValidationSchema(rule)) {
      if (typeof value !== 'object' || value === null) {
        return {
          isValid: false,
          errors: [`${fieldName} must be an object`]
        };
      }
      return this.validate(value, rule);
    }

    const validationRule = rule as ValidationRule;
    const errors: string[] = [];

    // Check if required
    if (validationRule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors };
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      return { isValid: true, data: value, errors: [] };
    }

    // Type validation
    const typeValidation = this.validateType(value, validationRule.type, fieldName);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
    }

    // Length validation for strings and arrays
    if (validationRule.minLength !== undefined) {
      if (typeof value === 'string' && value.length < validationRule.minLength) {
        errors.push(`${fieldName} must be at least ${validationRule.minLength} characters long`);
      } else if (Array.isArray(value) && value.length < validationRule.minLength) {
        errors.push(`${fieldName} must have at least ${validationRule.minLength} items`);
      }
    }

    if (validationRule.maxLength !== undefined) {
      if (typeof value === 'string' && value.length > validationRule.maxLength) {
        errors.push(`${fieldName} must be no more than ${validationRule.maxLength} characters long`);
      } else if (Array.isArray(value) && value.length > validationRule.maxLength) {
        errors.push(`${fieldName} must have no more than ${validationRule.maxLength} items`);
      }
    }

    // Numeric range validation
    if (validationRule.min !== undefined && typeof value === 'number' && value < validationRule.min) {
      errors.push(`${fieldName} must be at least ${validationRule.min}`);
    }

    if (validationRule.max !== undefined && typeof value === 'number' && value > validationRule.max) {
      errors.push(`${fieldName} must be no more than ${validationRule.max}`);
    }

    // Pattern validation
    if (validationRule.pattern && typeof value === 'string' && !validationRule.pattern.test(value)) {
      errors.push(`${fieldName} does not match the required pattern`);
    }

    // Enum validation
    if (validationRule.enum && !validationRule.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${validationRule.enum.join(', ')}`);
    }

    // Custom validation
    if (validationRule.custom && !validationRule.custom(value)) {
      errors.push(`${fieldName} failed custom validation`);
    }

    // Transform value if needed
    let finalValue = value;
    if (validationRule.transform) {
      try {
        finalValue = validationRule.transform(value);
      } catch (error) {
        errors.push(`${fieldName} transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      data: finalValue,
      errors
    };
  }

  /**
   * Validate data type
   */
  private validateType(value: any, type: string, fieldName: string): ValidationResult {
    const errors: string[] = [];

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} must be a string`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${fieldName} must be a valid number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName} must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${fieldName} must be an array`);
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`${fieldName} must be an object`);
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          errors.push(`${fieldName} must be a valid email address`);
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !this.isValidUrl(value)) {
          errors.push(`${fieldName} must be a valid URL`);
        }
        break;

      case 'uuid':
        if (typeof value !== 'string' || !this.isValidUUID(value)) {
          errors.push(`${fieldName} must be a valid UUID`);
        }
        break;

      case 'date':
        if (!(value instanceof Date) && (typeof value !== 'string' || isNaN(Date.parse(value)))) {
          errors.push(`${fieldName} must be a valid date`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      data: value,
      errors
    };
  }

  /**
   * Check if a value is a validation schema
   */
  private isValidationSchema(value: any): value is ValidationSchema {
    return typeof value === 'object' && value !== null && !('type' in value);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Sanitize data to prevent XSS and other attacks
   */
  private sanitizeData(data: any, options: SanitizationOptions): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data, options);
    } else if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, options));
    } else if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value, options);
      }
      return sanitized;
    }
    return data;
  }

  /**
   * Sanitize a string value
   */
  private sanitizeString(str: string, options: SanitizationOptions): string {
    // Remove potentially dangerous content
    let sanitized = str;

    if (options.removeScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (options.removeStyles) {
      sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }

    if (options.removeComments) {
      sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Use DOMPurify for comprehensive HTML sanitization
    try {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: options.allowedTags,
        ALLOWED_ATTR: Object.keys(options.allowedAttributes),
        ALLOWED_URI_REGEXP: new RegExp(`^(${options.allowedSchemes.join('|')}):`, 'i')
      });
    } catch (error) {
      console.warn('DOMPurify sanitization failed, falling back to basic sanitization:', error);
      // Fallback to basic sanitization
      sanitized = this.basicSanitize(sanitized);
    }

    return sanitized;
  }

  /**
   * Basic string sanitization fallback
   */
  private basicSanitize(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Create a Zod schema from validation rules
   */
  createZodSchema(schema: ValidationSchema): z.ZodObject<any> {
    const zodSchema: any = {};

    for (const [key, rule] of Object.entries(schema)) {
      if (this.isValidationSchema(rule)) {
        zodSchema[key] = this.createZodSchema(rule);
      } else {
        const validationRule = rule as ValidationRule;
        zodSchema[key] = this.createZodField(validationRule);
      }
    }

    return z.object(zodSchema);
  }

  /**
   * Create a Zod field from validation rules
   */
  private createZodField(rule: ValidationRule): z.ZodTypeAny {
    let zodField: z.ZodTypeAny;

    // Create base type
    switch (rule.type) {
      case 'string':
        zodField = z.string();
        break;
      case 'number':
        zodField = z.number();
        break;
      case 'boolean':
        zodField = z.boolean();
        break;
      case 'array':
        zodField = z.array(z.any());
        break;
      case 'object':
        zodField = z.record(z.string(), z.any());
        break;
      case 'email':
        zodField = z.string().email();
        break;
      case 'url':
        zodField = z.string().url();
        break;
      case 'uuid':
        zodField = z.string().uuid();
        break;
      case 'date':
        zodField = z.union([z.date(), z.string().datetime()]);
        break;
      default:
        zodField = z.any();
    }

    // Apply validations
    if (rule.minLength !== undefined && (rule.type === 'string' || rule.type === 'array')) {
      if (rule.type === 'string') {
        zodField = (zodField as any).min(rule.minLength);
      } else {
        zodField = (zodField as any).min(rule.minLength);
      }
    }

    if (rule.maxLength !== undefined && (rule.type === 'string' || rule.type === 'array')) {
      if (rule.type === 'string') {
        zodField = (zodField as any).max(rule.maxLength);
      } else {
        zodField = (zodField as any).max(rule.maxLength);
      }
    }

    if (rule.min !== undefined && rule.type === 'number') {
      zodField = (zodField as any).min(rule.min);
    }

    if (rule.max !== undefined && rule.type === 'number') {
      zodField = (zodField as any).max(rule.max);
    }

    if (rule.pattern && rule.type === 'string') {
      zodField = (zodField as any).regex(rule.pattern);
    }

    if (rule.enum) {
      zodField = zodField.refine(val => rule.enum!.includes(val), {
        message: `Must be one of: ${rule.enum.join(', ')}`
      });
    }

    if (rule.custom) {
      zodField = zodField.refine(rule.custom, {
        message: 'Failed custom validation'
      });
    }

    // Apply required/optional
    if (!rule.required) {
      zodField = zodField.optional();
    }

    return zodField;
  }

  /**
   * Validate data using Zod schema
   */
  validateWithZod(data: any, schema: ValidationSchema): ValidationResult {
    try {
      const zodSchema = this.createZodSchema(schema);
      const validatedData = zodSchema.parse(data);
      
      return {
        isValid: true,
        data: validatedData,
        errors: []
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }
}

/**
 * Predefined validation schemas for common use cases
 */
export const CommonValidationSchemas = {
  // User input validation
  userInput: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 100, sanitize: true },
    email: { type: 'email', required: true, sanitize: true },
    phone: { type: 'string', required: false, pattern: /^[\+]?[1-9][\d]{0,15}$/, sanitize: true },
    message: { type: 'string', required: true, minLength: 10, maxLength: 1000, sanitize: true }
  },

  // Property input validation
  propertyInput: {
    title: { type: 'string', required: true, minLength: 10, maxLength: 200, sanitize: true },
    description: { type: 'string', required: false, maxLength: 2000, sanitize: true },
    price: { type: 'number', required: true, min: 0, max: 1000000000 },
    address: { type: 'string', required: true, minLength: 10, maxLength: 500, sanitize: true },
    city: { type: 'string', required: true, minLength: 2, maxLength: 100, sanitize: true },
    region: { type: 'string', required: true, minLength: 2, maxLength: 100, sanitize: true },
    postalCode: { type: 'string', required: false, pattern: /^[A-Z0-9\s-]{3,10}$/i, sanitize: true },
    bedrooms: { type: 'number', required: false, min: 0, max: 20 },
    bathrooms: { type: 'number', required: false, min: 0, max: 20 },
    squareFeet: { type: 'number', required: false, min: 0, max: 100000 },
    features: { type: 'array', required: false, maxLength: 50 },
    amenities: { type: 'array', required: false, maxLength: 100 }
  },

  // Search query validation
  searchQuery: {
    query: { type: 'string', required: false, maxLength: 200, sanitize: true },
    city: { type: 'string', required: false, maxLength: 100, sanitize: true },
    minPrice: { type: 'number', required: false, min: 0 },
    maxPrice: { type: 'number', required: false, min: 0 },
    propertyType: { type: 'string', required: false, enum: ['house', 'apartment', 'land', 'commercial', 'office'] },
    listingType: { type: 'string', required: false, enum: ['sale', 'rent', 'lease'] }
  }
};

