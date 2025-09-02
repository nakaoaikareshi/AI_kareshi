import { NextRequest } from 'next/server';
import { POST } from '../route';
import { MoodSystem } from '@/utils/moodSystem';
import { DailyEventGenerator } from '@/utils/dailyEvents';
import { RefusalSystem } from '@/utils/refusalSystem';

// Mock OpenAI
jest.mock('openai');
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});

// Mock utility modules
jest.mock('@/utils/moodSystem');
jest.mock('@/utils/dailyEvents');
jest.mock('@/utils/refusalSystem');

const mockMoodSystem = MoodSystem as jest.Mocked<typeof MoodSystem>;
const mockDailyEventGenerator = DailyEventGenerator as jest.Mocked<typeof DailyEventGenerator>;
const mockRefusalSystem = RefusalSystem as jest.Mocked<typeof RefusalSystem>;

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    OPENAI_API_KEY: 'test-api-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

const mockRequest = (body: unknown) => {
  const request = {
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn().mockReturnValue('127.0.0.1')
    }
  } as unknown as NextRequest;
  
  return request;
};

const mockCharacter = {
  id: 'char-123',
  name: 'テスト彼女',
  nickname: 'テストちゃん',
  gender: 'girlfriend' as const,
  age: 20,
  occupation: '学生',
  hobbies: ['読書', '映画鑑賞'],
  personality: {
    kindness: 80,
    humor: 60,
    seriousness: 70,
    activeness: 75,
    empathy: 85
  }
};

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockMoodSystem.calculateCurrentMood.mockReturnValue({
      currentMood: 50,
      lastMoodChange: new Date(),
      factors: []
    });
    mockDailyEventGenerator.getEventToShare.mockReturnValue(null);
    mockRefusalSystem.generateRefusalWithPersonality.mockReturnValue(null);
  });

  describe('Input Validation', () => {
    it('should reject invalid JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: jest.fn().mockReturnValue('127.0.0.1')
        }
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should reject missing message', async () => {
      const request = mockRequest({
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing character', async () => {
      const request = mockRequest({
        message: 'こんにちは',
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should reject messages that are too long', async () => {
      const request = mockRequest({
        message: 'A'.repeat(1001), // Exceeds 1000 character limit
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid character data', async () => {
      const invalidCharacter = {
        ...mockCharacter,
        age: 150, // Invalid age
        gender: 'invalid' // Invalid gender
      };

      const request = mockRequest({
        message: 'こんにちは',
        character: invalidCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('OpenAI API Integration', () => {
    it('should handle missing API key', async () => {
      const originalApiKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const request = mockRequest({
        message: 'こんにちは',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Service temporarily unavailable. Please try again later.');
      expect(data.code).toBe('SERVICE_ERROR');

      process.env.OPENAI_API_KEY = originalApiKey;
    });

    it('should generate successful AI response', async () => {
      const mockCompletion = {
        choices: [{
          message: {
            content: 'こんにちは！元気だよ〜😊'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const request = mockRequest({
        message: 'こんにちは',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.content).toBe('こんにちは！元気だよ〜😊');
      expect(data.data.timestamp).toBeDefined();
    });

    it('should handle OpenAI API failures', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const request = mockRequest({
        message: 'こんにちは',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Service temporarily unavailable. Please try again later.');
      expect(data.code).toBe('INTERNAL_ERROR');
    });

    it('should handle empty AI response', async () => {
      const mockCompletion = {
        choices: [{
          message: {
            content: null
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const request = mockRequest({
        message: 'こんにちは',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Service temporarily unavailable. Please try again later.');
      expect(data.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('System Features', () => {
    it('should handle refusal system responses', async () => {
      mockRefusalSystem.generateRefusalWithPersonality.mockReturnValue(
        'ごめん、それはちょっと...😅'
      );

      const request = mockRequest({
        message: '不適切な内容',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.content).toBe('ごめん、それはちょっと...😅');
    });

    it('should calculate mood state', async () => {
      const mockMoodState = {
        currentMood: 75,
        lastMoodChange: new Date(),
        factors: [{ type: 'weather' as const, influence: 10, description: 'Sunny day' }]
      };

      mockMoodSystem.calculateCurrentMood.mockReturnValue(mockMoodState);
      
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '今日はとっても気分がいいよ！' } }]
      });

      const request = mockRequest({
        message: '調子はどう？',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);

      expect(mockMoodSystem.calculateCurrentMood).toHaveBeenCalledWith(mockCharacter);
      expect(response.status).toBe(200);
    });

    it('should include daily events when available', async () => {
      mockDailyEventGenerator.getEventToShare.mockReturnValue(
        '今日は友達と映画を見に行ったよ！'
      );

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'そうそう、今日はね...' } }]
      });

      const request = mockRequest({
        message: '今日何した？',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      const response = await POST(request);

      expect(mockDailyEventGenerator.getEventToShare).toHaveBeenCalledWith(mockCharacter.occupation);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('今日の出来事: 今日は友達と映画を見に行ったよ！')
            })
          ])
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests rapidly
      const request = mockRequest({
        message: 'テスト',
        character: mockCharacter,
        conversationHistory: [],
        user: { id: 'user-123', nickname: 'ユーザー' }
      });

      // Mock OpenAI to avoid actual API calls
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'テスト返答' } }]
      });

      // Make requests within the rate limit first
      for (let i = 0; i < 10; i++) {
        const response = await POST(request);
        expect(response.status).not.toBe(429);
      }

      // The 11th request should be rate limited
      const rateLimitedResponse = await POST(request);
      expect(rateLimitedResponse.status).toBe(429);
      
      const data = await rateLimitedResponse.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit exceeded');
    });
  });
});