/**
 * JWT Security Utilities
 * Implements comprehensive JWT validation and security measures
 * Based on Supabase security best practices
 */

export interface JWTPayload {
  iss: string;           // Issuer
  aud: string | string[]; // Audience
  exp: number;           // Expiration time
  iat: number;           // Issued at
  sub: string;           // Subject (user ID)
  role: string;          // User role
  aal?: string;          // Authenticator Assurance Level
  session_id?: string;   // Session ID
  email?: string;        // User email
  phone?: string;        // User phone
  is_anonymous?: boolean; // Anonymous flag
  jti?: string;          // JWT ID
  nbf?: number;          // Not before
  app_metadata?: Record<string, any>; // App metadata
  user_metadata?: Record<string, any>; // User metadata
  amr?: Array<{          // Authentication Methods Reference
    method: string;
    timestamp: number;
  }>;
  ref?: string;          // Project reference (anon/service role only)
}

export interface JWTValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  claims?: JWTPayload;
}

export interface JWTSecurityConfig {
  maxTokenAge: number;           // Maximum token age in seconds
  requireSecureTransport: boolean; // Require HTTPS
  validateIssuer: boolean;       // Validate issuer claim
  validateAudience: boolean;     // Validate audience claim
  validateExpiration: boolean;   // Validate expiration
  validateSignature: boolean;    // Validate cryptographic signature
  allowedRoles: string[];        // Allowed user roles
  allowedIssuers: string[];      // Allowed issuers
  allowedAudiences: string[];    // Allowed audiences
}

// Default security configuration
export const DEFAULT_JWT_SECURITY_CONFIG: JWTSecurityConfig = {
  maxTokenAge: 3600, // 1 hour
  requireSecureTransport: true,
  validateIssuer: true,
  validateAudience: true,
  validateExpiration: true,
  validateSignature: true,
  allowedRoles: ['authenticated', 'anon', 'service_role'],
  allowedIssuers: [],
  allowedAudiences: ['authenticated', 'anon'],
};

/**
 * Validate JWT payload according to security best practices
 */
export function validateJWTPayload(
  payload: any,
  config: JWTSecurityConfig = DEFAULT_JWT_SECURITY_CONFIG
): JWTValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic structure validation
    if (!payload || typeof payload !== 'object') {
      return {
        isValid: false,
        errors: ['Invalid JWT payload structure'],
        warnings: []
      };
    }

    // Required claims validation
    const requiredClaims = ['iss', 'aud', 'exp', 'iat', 'sub', 'role'];
    for (const claim of requiredClaims) {
      if (!(claim in payload)) {
        errors.push(`Missing required claim: ${claim}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Type validation
    if (typeof payload.exp !== 'number') {
      errors.push('Invalid expiration time type');
    }
    if (typeof payload.iat !== 'number') {
      errors.push('Invalid issued at time type');
    }
    if (typeof payload.sub !== 'string') {
      errors.push('Invalid subject type');
    }
    if (typeof payload.role !== 'string') {
      errors.push('Invalid role type');
    }
    if (typeof payload.iss !== 'string') {
      errors.push('Invalid issuer type');
    }

    // Expiration validation
    if (config.validateExpiration) {
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp <= now) {
        errors.push('Token has expired');
      }
      
      if (payload.iat > now) {
        errors.push('Token issued in the future');
      }
      
      if (payload.nbf && payload.nbf > now) {
        errors.push('Token not yet valid');
      }
      
      // Check token age
      if (payload.iat && (now - payload.iat) > config.maxTokenAge) {
        errors.push('Token exceeds maximum age');
      }
    }

    // Issuer validation
    if (config.validateIssuer && config.allowedIssuers.length > 0) {
      if (!config.allowedIssuers.includes(payload.iss)) {
        errors.push('Invalid issuer');
      }
    }

    // Audience validation
    if (config.validateAudience && config.allowedAudiences.length > 0) {
      if (Array.isArray(payload.aud)) {
        const hasValidAudience = payload.aud.some((aud: string) => 
          config.allowedAudiences.includes(aud)
        );
        if (!hasValidAudience) {
          errors.push('Invalid audience');
        }
      } else {
        if (!config.allowedAudiences.includes(payload.aud)) {
          errors.push('Invalid audience');
        }
      }
    }

    // Role validation
    if (config.allowedRoles.length > 0) {
      if (!config.allowedRoles.includes(payload.role)) {
        errors.push('Invalid user role');
      }
    }

    // Security warnings
    if (payload.role === 'service_role') {
      warnings.push('Service role token detected - ensure this is server-side only');
    }

    if (payload.is_anonymous === true) {
      warnings.push('Anonymous user token detected');
    }

    // Validate AAL (Authenticator Assurance Level)
    if (payload.aal && !['aal1', 'aal2'].includes(payload.aal)) {
      warnings.push('Invalid authenticator assurance level');
    }

    // Validate AMR (Authentication Methods Reference)
    if (payload.amr && Array.isArray(payload.amr)) {
      for (const method of payload.amr) {
        if (typeof method !== 'object' || !method.method || typeof method.timestamp !== 'number') {
          warnings.push('Invalid authentication method reference format');
          break;
        }
      }
    }

    // Check for suspicious patterns
    if (payload.sub === payload.iss) {
      warnings.push('Subject and issuer are identical - potential security issue');
    }

    if (payload.exp - payload.iat > 86400) { // 24 hours
      warnings.push('Token has unusually long lifetime');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      claims: payload as JWTPayload
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`JWT validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

/**
 * Extract and validate user information from JWT
 */
export function extractUserFromJWT(payload: any): {
  userId: string;
  email?: string;
  role: string;
  isAnonymous: boolean;
  metadata: Record<string, any>;
} | null {
  try {
    if (!payload || !payload.sub || !payload.role) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isAnonymous: payload.is_anonymous === true,
      metadata: {
        ...payload.app_metadata,
        ...payload.user_metadata
      }
    };
  } catch (error) {
    console.error('Error extracting user from JWT:', error);
    return null;
  }
}

/**
 * Check if JWT has expired
 */
export function isJWTExpired(payload: any): boolean {
  try {
    if (!payload || !payload.exp) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  } catch (error) {
    return true;
  }
}

/**
 * Check if JWT is about to expire (within threshold)
 */
export function isJWTExpiringSoon(payload: any, thresholdSeconds: number = 300): boolean {
  try {
    if (!payload || !payload.exp) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return (payload.exp - now) <= thresholdSeconds;
  } catch (error) {
    return true;
  }
}

/**
 * Get JWT age in seconds
 */
export function getJWTAge(payload: any): number | null {
  try {
    if (!payload || !payload.iat) {
      return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return now - payload.iat;
  } catch (error) {
    return null;
  }
}

/**
 * Validate JWT for specific use case (e.g., API access, admin operations)
 */
export function validateJWTForUseCase(
  payload: any,
  useCase: 'api_access' | 'admin_operations' | 'user_profile' | 'general'
): JWTValidationResult {
  const baseConfig = { ...DEFAULT_JWT_SECURITY_CONFIG };
  
  switch (useCase) {
    case 'api_access':
      baseConfig.allowedRoles = ['authenticated', 'service_role'];
      baseConfig.maxTokenAge = 1800; // 30 minutes for API access
      break;
      
    case 'admin_operations':
      baseConfig.allowedRoles = ['service_role'];
      baseConfig.maxTokenAge = 900; // 15 minutes for admin operations
      break;
      
    case 'user_profile':
      baseConfig.allowedRoles = ['authenticated'];
      baseConfig.maxTokenAge = 3600; // 1 hour for user profile
      break;
      
    case 'general':
    default:
      // Use default configuration
      break;
  }
  
  return validateJWTPayload(payload, baseConfig);
}

/**
 * Generate security headers for JWT-based authentication
 */
export function generateJWTSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

