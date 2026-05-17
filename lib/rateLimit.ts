// lib/rateLimit.ts
// In-memory rate limiter for API routes
// For production, use Redis-backed rate limiting (e.g., Upstash)

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
};

/**
 * Rate limit middleware
 * Returns null if OK, or a NextResponse with 429 if rate limited
 */
export function rateLimit(
  req: NextRequest,
  options: Partial<RateLimitOptions> = {}
): NextResponse | null {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  
  const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
  const endpoint = req.nextUrl.pathname;
  const key = `${ip}:${endpoint}`;
  
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        }
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Strict rate limit for auth endpoints
 */
export function authRateLimit(req: NextRequest): NextResponse | null {
  return rateLimit(req, { windowMs: 15 * 60 * 1000, maxRequests: 10 }); // 10 per 15 min
}

/**
 * Standard API rate limit
 */
export function apiRateLimit(req: NextRequest): NextResponse | null {
  return rateLimit(req, { windowMs: 60 * 1000, maxRequests: 60 }); // 60 per minute
}
