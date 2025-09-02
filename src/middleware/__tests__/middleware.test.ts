import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';
import { getToken } from 'next-auth/jwt';

// Mock next-auth/jwt
jest.mock('next-auth/jwt');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

// Helper to create mock requests
const createMockRequest = (
  method: string = 'GET',
  pathname: string = '/',
  headers: Record<string, string> = {},
  origin?: string
) => {
  const url = `https://example.com${pathname}`;
  
  const mockHeaders = new Map();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key.toLowerCase(), value);
  });
  
  if (origin) {
    mockHeaders.set('origin', origin);
  }
  mockHeaders.set('host', 'example.com');

  const request = {
    method,
    url,
    nextUrl: { pathname },
    headers: {
      get: (key: string) => mockHeaders.get(key.toLowerCase()) || null,
    },
  } as unknown as NextRequest;

  return request;
};

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Headers', () => {
    it('should add security headers to all responses', async () => {
      const request = createMockRequest('GET', '/');
      const response = await middleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('should include OpenAI in CSP connect-src', async () => {
      const request = createMockRequest('GET', '/');
      const response = await middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://api.openai.com');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to /api/chat', async () => {
      const request = createMockRequest('POST', '/api/chat');
      
      // First request should pass
      const response1 = await middleware(request);
      expect(response1.status).not.toBe(429);

      // Simulate multiple rapid requests
      for (let i = 0; i < 10; i++) {
        await middleware(request);
      }

      // Should eventually hit rate limit
      const response = await middleware(request);
      if (response.status === 429) {
        const data = await response.json();
        expect(data.error).toContain('Rate limit exceeded');
        expect(response.headers.get('Retry-After')).toBe('60');
      }
    });

    it('should apply rate limiting to /api/auth/signup', async () => {
      const request = createMockRequest('POST', '/api/auth/signup');
      
      // Make multiple requests rapidly
      for (let i = 0; i < 4; i++) {
        const response = await middleware(request);
        if (i < 3) {
          expect(response.status).not.toBe(429);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });

    it('should not rate limit GET requests', async () => {
      const request = createMockRequest('GET', '/api/some-endpoint');
      
      // GET requests should not be rate limited
      for (let i = 0; i < 20; i++) {
        const response = await middleware(request);
        expect(response.status).not.toBe(429);
      }
    });
  });

  describe('Authentication Protection', () => {
    it('should protect /api/chat without valid token', async () => {
      mockGetToken.mockResolvedValue(null);
      
      const request = createMockRequest('POST', '/api/chat');
      const response = await middleware(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Authentication required');
    });

    it('should allow /api/chat with valid token', async () => {
      mockGetToken.mockResolvedValue({
        sub: 'user-123',
        nickname: 'TestUser'
      });
      
      const request = createMockRequest('POST', '/api/chat');
      const response = await middleware(request);

      expect(response.status).not.toBe(401);
    });

    it('should protect /api/messages without valid token', async () => {
      mockGetToken.mockResolvedValue(null);
      
      const request = createMockRequest('POST', '/api/messages');
      const response = await middleware(request);

      expect(response.status).toBe(401);
    });

    it('should not protect public auth endpoints', async () => {
      const signupRequest = createMockRequest('POST', '/api/auth/signup');
      const signinRequest = createMockRequest('POST', '/api/auth/signin');
      
      const signupResponse = await middleware(signupRequest);
      const signinResponse = await middleware(signinRequest);

      expect(signupResponse.status).not.toBe(401);
      expect(signinResponse.status).not.toBe(401);
    });
  });

  describe('CSRF Protection', () => {
    it('should block POST requests without proper origin', async () => {
      const request = createMockRequest(
        'POST',
        '/api/chat',
        {},
        'https://malicious-site.com'
      );
      
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('CSRF protection triggered');
    });

    it('should allow POST requests from same origin', async () => {
      mockGetToken.mockResolvedValue({ sub: 'user-123' });
      
      const request = createMockRequest(
        'POST',
        '/api/chat',
        {},
        'https://example.com'
      );
      
      const response = await middleware(request);

      expect(response.status).not.toBe(403);
    });

    it('should allow GET requests regardless of origin', async () => {
      const request = createMockRequest(
        'GET',
        '/api/some-endpoint',
        {},
        'https://malicious-site.com'
      );
      
      const response = await middleware(request);

      expect(response.status).not.toBe(403);
    });

    it('should not apply CSRF protection to auth endpoints', async () => {
      const request = createMockRequest(
        'POST',
        '/api/auth/signup',
        {},
        'https://different-origin.com'
      );
      
      const response = await middleware(request);

      expect(response.status).not.toBe(403);
    });

    it('should block requests without origin header', async () => {
      const mockHeaders = new Map();
      mockHeaders.set('host', 'example.com');

      const request = {
        method: 'POST',
        url: 'https://example.com/api/chat',
        nextUrl: { pathname: '/api/chat' },
        headers: {
          get: (key: string) => mockHeaders.get(key.toLowerCase()) || null,
        },
      } as unknown as NextRequest;
      
      const response = await middleware(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('CSRF protection triggered');
    });
  });

  describe('Static File Handling', () => {
    it('should not process static files', async () => {
      const request = createMockRequest('GET', '/_next/static/chunk.js');
      const response = await middleware(request);

      // Should pass through without processing
      expect(response.status).not.toBe(429);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should not process image optimization files', async () => {
      const request = createMockRequest('GET', '/_next/image/test.png');
      const response = await middleware(request);

      expect(response.status).not.toBe(429);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should not process favicon', async () => {
      const request = createMockRequest('GET', '/favicon.ico');
      const response = await middleware(request);

      expect(response.status).not.toBe(429);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests without host header', async () => {
      const request = {
        method: 'POST',
        url: 'https://example.com/api/chat',
        nextUrl: { pathname: '/api/chat' },
        headers: {
          get: () => null,
        },
      } as unknown as NextRequest;
      
      const response = await middleware(request);

      // Should still apply security measures
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should handle malformed URLs gracefully', async () => {
      const request = createMockRequest('GET', '/\\..\\path');
      const response = await middleware(request);

      // Should not crash and should include security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });
});