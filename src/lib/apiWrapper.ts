/**
 * API ルートハンドラーのラッパー
 * エラーハンドリングとレスポンスフォーマットを統一
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  AppError, 
  handleError, 
  ValidationError,
  AuthenticationError,
  RateLimitError,
  asyncHandler
} from './errorHandler';
import { logger } from './logger';
import { z } from 'zod';

/**
 * APIレスポンスの型定義
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  type?: string;
  details?: any;
}

/**
 * APIハンドラーの型定義
 */
type ApiHandler<T = any> = (
  request: NextRequest,
  context?: any
) => Promise<ApiResponse<T>>;

/**
 * APIルートハンドラーのラッパー
 */
export const apiWrapper = <T = any>(
  handler: ApiHandler<T>,
  options?: {
    requireAuth?: boolean;
    rateLimit?: {
      maxRequests: number;
      windowMs: number;
    };
    validation?: {
      body?: z.ZodSchema;
      query?: z.ZodSchema;
      params?: z.ZodSchema;
    };
  }
) => {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    try {
      // リクエストログ
      logger.info(`API Request: ${request.method} ${request.url}`, {
        requestId,
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      });

      // 認証チェック
      if (options?.requireAuth) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AuthenticationError('認証トークンが必要です');
        }
        // TODO: トークン検証ロジック
      }

      // レート制限チェック
      if (options?.rateLimit) {
        const ip = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
        
        // 簡易的なメモリベースのレート制限
        const rateLimitKey = `${request.url}-${ip}`;
        if (!checkRateLimit(rateLimitKey, options.rateLimit)) {
          throw new RateLimitError();
        }
      }

      // バリデーション
      let body: any = null;
      let query: any = null;
      let params: any = null;

      // ボディのバリデーション
      if (options?.validation?.body && request.method !== 'GET') {
        try {
          const rawBody = await request.json();
          body = options.validation.body.parse(rawBody);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError('リクエストボディが不正です', error.errors);
          }
          throw error;
        }
      }

      // クエリパラメータのバリデーション
      if (options?.validation?.query) {
        const searchParams = new URL(request.url).searchParams;
        const queryObject = Object.fromEntries(searchParams.entries());
        try {
          query = options.validation.query.parse(queryObject);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError('クエリパラメータが不正です', error.errors);
          }
          throw error;
        }
      }

      // パスパラメータのバリデーション
      if (options?.validation?.params && context?.params) {
        try {
          params = options.validation.params.parse(context.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new ValidationError('パスパラメータが不正です', error.errors);
          }
          throw error;
        }
      }

      // メインハンドラーの実行
      const modifiedRequest = Object.assign(request, {
        body,
        query,
        params,
      });
      
      const result = await handler(modifiedRequest, context);

      // 成功レスポンスログ
      const duration = Date.now() - startTime;
      logger.info(`API Response: ${request.method} ${request.url}`, {
        requestId,
        duration,
        success: true,
      });

      return NextResponse.json(result, { status: 200 });

    } catch (error) {
      // エラーハンドリング
      const { statusCode, response } = handleError(
        error instanceof Error ? error : new Error('Unknown error')
      );

      // エラーレスポンスログ
      const duration = Date.now() - startTime;
      logger.error(`API Error: ${request.method} ${request.url}`, {
        requestId,
        duration,
        statusCode,
        error: response.error,
      });

      return NextResponse.json(response, { status: statusCode });
    }
  };
};

/**
 * レート制限チェック（簡易実装）
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number }
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return true;
  }

  if (record.count >= options.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * 成功レスポンスのヘルパー
 */
export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

/**
 * エラーレスポンスのヘルパー
 */
export const errorResponse = (
  error: string | Error | AppError,
  details?: any
): ApiResponse => {
  if (typeof error === 'string') {
    return {
      success: false,
      error,
      ...(details && { details }),
    };
  }

  const { response } = handleError(error);
  return response;
};

/**
 * ページネーションレスポンスのヘルパー
 */
export const paginatedResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<{ items: T[]; pagination: any }> => ({
  success: true,
  data: {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  },
});

/**
 * バリデーションスキーマのプリセット
 */
export const commonValidation = {
  // ID
  id: z.string().uuid('有効なUUID形式である必要があります'),
  
  // ページネーション
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.enum(['asc', 'desc']).optional(),
    sortBy: z.string().optional(),
  }),
  
  // 日付範囲
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  
  // 検索クエリ
  searchQuery: z.object({
    q: z.string().min(1).max(100),
    fields: z.array(z.string()).optional(),
  }),
};