import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  enableCrossOriginEmbedderPolicy: boolean;
  enableCrossOriginOpenerPolicy: boolean;
  enableCrossOriginResourcePolicy: boolean;
  cspDirectives?: Record<string, string[]>;
  hstsMaxAge?: number;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableXSSProtection: true,
  enableContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  enableCrossOriginEmbedderPolicy: true,
  enableCrossOriginOpenerPolicy: true,
  enableCrossOriginResourcePolicy: true,
  hstsMaxAge: 31536000, // 1 year
  referrerPolicy: 'strict-origin-when-cross-origin',
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:'],
    'media-src': ["'self'", 'https:'],
    'object-src': ["'none'"],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'frame-ancestors': ["'self'"]
  },
  permissionsPolicy: {
    'camera': ["'self'"],
    'microphone': ["'self'"],
    'geolocation': ["'self'"],
    'payment': ["'self'"],
    'usb': ["'self'"],
    'magnetometer': ["'self'"],
    'gyroscope': ["'self'"],
    'accelerometer': ["'self'"],
    'ambient-light-sensor': ["'self'"],
    'autoplay': ["'self'"],
    'encrypted-media': ["'self'"],
    'picture-in-picture': ["'self'"],
    'publickey-credentials-get': ["'self'"],
    'screen-wake-lock': ["'self'"],
    'sync-xhr': ["'self'"],
    'web-share': ["'self'"],
    'xr-spatial-tracking': ["'self'"]
  }
};

/**
 * Security headers middleware for Next.js
 * Adds comprehensive security headers to protect against common web vulnerabilities
 */
export class SecurityHeadersMiddleware {
  private config: SecurityHeadersConfig;

  constructor(config: Partial<SecurityHeadersConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * Apply security headers to a response
   */
  applySecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.enableCSP) {
      response.headers.set('Content-Security-Policy', this.buildCSP());
    }

    // HTTP Strict Transport Security
    if (this.config.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        `max-age=${this.config.hstsMaxAge}; includeSubDomains; preload`
      );
    }

    // XSS Protection
    if (this.config.enableXSSProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    // Content Type Options
    if (this.config.enableContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', this.config.referrerPolicy!);
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      response.headers.set('Permissions-Policy', this.buildPermissionsPolicy());
    }

    // Cross-Origin Embedder Policy
    if (this.config.enableCrossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    // Cross-Origin Opener Policy
    if (this.config.enableCrossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    }

    // Cross-Origin Resource Policy
    if (this.config.enableCrossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    }

    // Additional security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
  }

  /**
   * Build Content Security Policy string
   */
  private buildCSP(): string {
    if (!this.config.cspDirectives) {
      return "default-src 'self'";
    }

    const directives: string[] = [];
    
    for (const [directive, sources] of Object.entries(this.config.cspDirectives)) {
      if (sources && sources.length > 0) {
        directives.push(`${directive} ${sources.join(' ')}`);
      }
    }

    return directives.join('; ');
  }

  /**
   * Build Permissions Policy string
   */
  private buildPermissionsPolicy(): string {
    if (!this.config.permissionsPolicy) {
      return '';
    }

    const policies: string[] = [];
    
    for (const [feature, origins] of Object.entries(this.config.permissionsPolicy)) {
      if (origins && origins.length > 0) {
        policies.push(`${feature}=${origins.join(' ')}`);
      }
    }

    return policies.join(', ');
  }

  /**
   * Create a middleware function for Next.js
   */
  createMiddleware() {
    return (request: NextRequest) => {
      // This will be called by Next.js middleware
      return NextResponse.next();
    };
  }

  /**
   * Apply security headers to an existing response
   */
  static applyToResponse(
    response: NextResponse,
    config: Partial<SecurityHeadersConfig> = {}
  ): NextResponse {
    const middleware = new SecurityHeadersMiddleware(config);
    return middleware.applySecurityHeaders(response);
  }
}

/**
 * Security headers middleware function for Next.js
 */
export function securityHeadersMiddleware(
  request: NextRequest,
  config: Partial<SecurityHeadersConfig> = {}
): NextResponse | null {
  // This function can be used in Next.js middleware.ts
  // For now, return null to allow the request to continue
  return null;
}

/**
 * Security headers decorator for API route handlers
 */
export function withSecurityHeaders(config: Partial<SecurityHeadersConfig> = {}) {
  return function <T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value;
    
    if (originalMethod) {
      descriptor.value = async function (...args: T): Promise<R> {
        const response = await originalMethod.apply(this, args);
        
        if (response instanceof NextResponse) {
          return SecurityHeadersMiddleware.applyToResponse(response, config) as any;
        }
        
        return response;
      };
    }
    
    return descriptor;
  };
}

/**
 * CORS configuration for API routes
 */
export interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export const DEFAULT_CORS_CONFIG: CORSConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://akwaabahomes.com', 'https://www.akwaabahomes.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * Apply CORS headers to a response
 */
export function applyCORSHeaders(
  response: NextResponse,
  config: Partial<CORSConfig> = {}
): NextResponse {
  const corsConfig = { ...DEFAULT_CORS_CONFIG, ...config };
  
  // Handle origin
  if (typeof corsConfig.origin === 'boolean') {
    if (corsConfig.origin) {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
  } else if (Array.isArray(corsConfig.origin)) {
    // For multiple origins, you'd typically check the request origin
    // and set the appropriate one. For now, we'll set the first one.
    response.headers.set('Access-Control-Allow-Origin', corsConfig.origin[0]);
  } else {
    response.headers.set('Access-Control-Allow-Origin', corsConfig.origin);
  }

  // Set other CORS headers
  response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
  response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());

  return response;
}

/**
 * CORS middleware for handling preflight requests
 */
export function corsMiddleware(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return applyCORSHeaders(response);
  }
  
  return null;
}

/**
 * Combined security and CORS middleware
 */
export function securityAndCORSMiddleware(
  request: NextRequest,
  securityConfig: Partial<SecurityHeadersConfig> = {},
  corsConfig: Partial<CORSConfig> = {}
): NextResponse | null {
  // Handle CORS preflight
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return SecurityHeadersMiddleware.applyToResponse(corsResponse, securityConfig);
  }
  
  return null;
}

