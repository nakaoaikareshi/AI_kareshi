import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': 
    "default-src 'self' blob:; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' blob: data: https://api.openai.com; " +
    "media-src 'self' blob: data:; " +
    "worker-src 'self' blob:;",
};

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/chat': { requests: 10, window: 60 * 1000 }, // 10 requests per minute
  '/api/auth/signup': { requests: 3, window: 60 * 1000 }, // 3 signups per minute
  '/api/messages': { requests: 20, window: 60 * 1000 }, // 20 messages per minute
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest, endpoint: string): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  return `${ip}:${endpoint}`;
}

function isRateLimited(request: NextRequest, endpoint: string): boolean {
  const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
  if (!limit) return false;

  const key = getRateLimitKey(request, endpoint);
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + limit.window });
    return false;
  }
  
  if (record.count >= limit.requests) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const { pathname } = request.nextUrl;

  // Apply rate limiting to API endpoints
  if (pathname.startsWith('/api/')) {
    const endpoint = pathname;
    if (isRateLimited(request, endpoint)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before making another request.',
          retryAfter: 60 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }
  }

  // Protected API routes that require authentication
  const protectedApiRoutes = ['/api/messages', '/api/conversations'];
  
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    // Verify session for protected API routes
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication required. Please sign in to access this resource.' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  // CSRF protection for state-changing operations
  if (request.method !== 'GET' && pathname.startsWith('/api/') && 
      !pathname.includes('/auth/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Check if request is coming from same origin
    if (!origin || !host || !origin.includes(host)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid request origin. CSRF protection triggered.' 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};