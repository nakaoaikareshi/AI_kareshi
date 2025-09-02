import { NextRequest } from 'next/server';
import { POST } from '../route';
import { DatabaseService } from '@/lib/database';

// Mock the database service
jest.mock('@/lib/database');
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

// Mock NextRequest
const mockRequest = (body: unknown) => {
  const request = {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
  
  return request;
};

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('should reject invalid JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should reject missing required fields', async () => {
      const request = mockRequest({
        email: 'test@example.com',
        // missing password, name, nickname
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email format', async () => {
      const request = mockRequest({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid email format');
    });

    it('should reject weak passwords', async () => {
      const request = mockRequest({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
        nickname: 'TestNick'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password must');
    });

    it('should reject passwords without required complexity', async () => {
      const request = mockRequest({
        email: 'test@example.com',
        password: 'simplelowercase',
        name: 'Test User',
        nickname: 'TestNick'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Password must contain');
    });

    it('should reject names that are too long', async () => {
      const request = mockRequest({
        email: 'test@example.com',
        password: 'Password123',
        name: 'A'.repeat(101), // Exceeds 100 character limit
        nickname: 'TestNick'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('User Creation', () => {
    it('should create user successfully with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        nickname: 'TestNick',
        createdAt: new Date(),
        characters: []
      };

      mockDatabaseService.createUser.mockResolvedValue(mockUser);

      const request = mockRequest(userData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('123');
      expect(data.data.email).toBe('test@example.com');
      expect(data.message).toBe('User created successfully');
      
      // Verify database service was called with sanitized data
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith({
        email: 'test@example.com', // Should be lowercased
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      });
    });

    it('should handle duplicate email error', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      };

      const duplicateError = new Error('Unique constraint violation');
      Object.assign(duplicateError, { code: 'P2002' });
      mockDatabaseService.createUser.mockRejectedValue(duplicateError);

      const request = mockRequest(userData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe('An account with this email already exists');
      expect(data.code).toBe('EMAIL_EXISTS');
    });

    it('should handle database errors gracefully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      };

      mockDatabaseService.createUser.mockRejectedValue(new Error('Database connection failed'));

      const request = mockRequest(userData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create user account. Please try again later.');
      expect(data.code).toBe('CREATE_USER_ERROR');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize email by lowercasing and trimming', async () => {
      const userData = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123',
        name: 'Test User',
        nickname: 'TestNick'
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        nickname: 'TestNick',
        createdAt: new Date(),
        characters: []
      };

      mockDatabaseService.createUser.mockResolvedValue(mockUser);

      const request = mockRequest(userData);
      const response = await POST(request);

      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com'
        })
      );
    });

    it('should trim whitespace from name and nickname', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: '  Test User  ',
        nickname: '  TestNick  '
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        nickname: 'TestNick',
        createdAt: new Date(),
        characters: []
      };

      mockDatabaseService.createUser.mockResolvedValue(mockUser);

      const request = mockRequest(userData);
      const response = await POST(request);

      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          nickname: 'TestNick'
        })
      );
    });
  });
});