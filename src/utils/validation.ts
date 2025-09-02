import { z } from 'zod';

// Validation schemas for API inputs
export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .transform(s => s.toLowerCase().trim()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
           'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  nickname: z.string()
    .min(1, 'Nickname is required')
    .max(50, 'Nickname must not exceed 50 characters')
    .trim()
});

export const signinSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(s => s.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
});

export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must not exceed 1000 characters')
    .trim(),
  character: z.object({
    id: z.string().uuid('Invalid character ID'),
    name: z.string().min(1).max(100),
    nickname: z.string().min(1).max(50),
    gender: z.enum(['boyfriend', 'girlfriend']),
    age: z.number().int().min(18).max(100),
    occupation: z.string().min(1).max(100),
    hobbies: z.array(z.string().max(50)).max(10),
    personality: z.object({
      kindness: z.number().int().min(0).max(100),
      humor: z.number().int().min(0).max(100),
      seriousness: z.number().int().min(0).max(100),
      activeness: z.number().int().min(0).max(100),
      empathy: z.number().int().min(0).max(100),
    })
  }),
  conversationHistory: z.array(z.object({
    isUser: z.boolean(),
    content: z.string().max(1000),
  })).max(50), // Limit conversation history
  user: z.object({
    id: z.string(),
    nickname: z.string().max(50),
  }).optional()
});

export const characterCreationSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  nickname: z.string()
    .min(1, 'Nickname is required')
    .max(50, 'Nickname must not exceed 50 characters')
    .trim(),
  gender: z.enum(['boyfriend', 'girlfriend'], {
    errorMap: () => ({ message: 'Gender must be either boyfriend or girlfriend' })
  }),
  age: z.number()
    .int('Age must be a whole number')
    .min(18, 'Age must be at least 18')
    .max(100, 'Age must not exceed 100'),
  occupation: z.string()
    .min(1, 'Occupation is required')
    .max(100, 'Occupation must not exceed 100 characters')
    .trim(),
  hobbies: z.array(z.string().trim().max(50))
    .min(1, 'At least one hobby is required')
    .max(10, 'Maximum 10 hobbies allowed'),
  personality: z.object({
    kindness: z.number().int().min(0).max(100),
    humor: z.number().int().min(0).max(100),
    seriousness: z.number().int().min(0).max(100),
    activeness: z.number().int().min(0).max(100),
    empathy: z.number().int().min(0).max(100),
  })
});

// Input sanitization functions
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[Extract<keyof T, string>];
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = (sanitized[key] as string[]).map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      ) as T[Extract<keyof T, string>];
    }
  }
  
  return sanitized;
}

// Validation result type
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details?: z.ZodError;
};

// Generic validation function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(input);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
        details: error
      };
    }
    return {
      success: false,
      error: 'Validation failed'
    };
  }
}

// Security-related validation
export function isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.' + allowed.replace(/^https?:\/\//, ''))
  );
}

export function isValidUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  // Block common bot patterns and suspicious user agents
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /bot/i,
    /spider/i,
    /crawler/i,
    /^$/,
    /null/i,
    /undefined/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
}