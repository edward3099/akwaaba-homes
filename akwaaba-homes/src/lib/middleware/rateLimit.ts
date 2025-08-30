import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, this should use Redis or a similar persistent store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return function rateLimit(request: NextRequest) {
    // Generate a unique key for this client
    const key = keyGenerator 
      ? keyGenerator(request) 
      : request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get current rate limit data for this key
    const current = rateLimitStore.get(key);

    if (!current || current.resetTime < now) {
      // First request or window has expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return null; // Allow request
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      );
    }

    // Increment request count
    current.count++;
    rateLimitStore.set(key, current);

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - current.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(current.resetTime).toISOString());

    return null; // Allow request
  };
}

// Pre-configured rate limiters for different endpoint types
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  keyGenerator: (request) => {
    // Use IP + user agent for auth endpoints to prevent brute force
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `auth:${ip}:${userAgent}`;
  }
});

export const formSubmissionRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 requests per minute
  keyGenerator: (request) => {
    // Use IP for form submissions
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    return `form:${ip}`;
  }
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (request) => {
    // Use IP for general API endpoints
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    return `api:${ip}`;
  }
});

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

