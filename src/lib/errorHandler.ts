/**
 * 統一エラーハンドリングシステム
 * アプリケーション全体のエラー処理を一元管理
 */

import { logger } from './logger';

/**
 * エラータイプの定義
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * エラーの深刻度レベル
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * エラータイプ別のヘルパー関数
 */
export const ValidationError = (message: string, details?: any) =>
  new AppError(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, true, details);

export const AuthenticationError = (message: string = '認証が必要です') =>
  new AppError(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.MEDIUM);

export const AuthorizationError = (message: string = 'アクセス権限がありません') =>
  new AppError(message, ErrorType.AUTHORIZATION, 403, ErrorSeverity.MEDIUM);

export const NotFoundError = (resource: string = 'リソース') =>
  new AppError(`${resource}が見つかりません`, ErrorType.NOT_FOUND, 404, ErrorSeverity.LOW);

export const RateLimitError = (message: string = 'リクエスト数の上限に達しました') =>
  new AppError(message, ErrorType.RATE_LIMIT, 429, ErrorSeverity.LOW);

export const NetworkError = (message: string = 'ネットワークエラーが発生しました') =>
  new AppError(message, ErrorType.NETWORK, 503, ErrorSeverity.HIGH);

export const DatabaseError = (message: string, details?: any) =>
  new AppError(message, ErrorType.DATABASE, 500, ErrorSeverity.CRITICAL, false, details);

export const ExternalAPIError = (api: string, message: string, details?: any) =>
  new AppError(
    `${api} API エラー: ${message}`,
    ErrorType.EXTERNAL_API,
    502,
    ErrorSeverity.HIGH,
    true,
    details
  );

/**
 * エラーハンドリング関数
 */
export const handleError = (error: Error | AppError): {
  statusCode: number;
  response: {
    success: false;
    error: string;
    type?: ErrorType;
    details?: any;
  };
} => {
  // AppErrorの場合
  if (error instanceof AppError) {
    // ログ出力
    if (error.severity === ErrorSeverity.CRITICAL) {
      logger.error('Critical error occurred', { error });
    } else if (error.severity === ErrorSeverity.HIGH) {
      logger.error('High severity error', { error });
    } else if (error.severity === ErrorSeverity.MEDIUM) {
      logger.warn('Medium severity error', { error });
    } else {
      logger.info('Low severity error', { message: error.message });
    }

    // プロダクション環境では詳細を隠す
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      statusCode: error.statusCode,
      response: {
        success: false,
        error: error.message,
        type: error.type,
        details: isDevelopment ? error.details : undefined,
      },
    };
  }

  // 通常のエラーの場合
  logger.error('Unexpected error occurred', { error });

  // 既知のエラータイプを判定
  let statusCode = 500;
  let errorType = ErrorType.UNKNOWN;
  let message = 'エラーが発生しました';

  // ネットワークエラー
  if (error.message.includes('fetch') || error.message.includes('network')) {
    statusCode = 503;
    errorType = ErrorType.NETWORK;
    message = 'ネットワークエラーが発生しました';
  }
  // データベースエラー
  else if (error.message.includes('database') || error.message.includes('prisma')) {
    statusCode = 500;
    errorType = ErrorType.DATABASE;
    message = 'データベースエラーが発生しました';
  }
  // バリデーションエラー
  else if (error.message.includes('validation') || error.message.includes('invalid')) {
    statusCode = 400;
    errorType = ErrorType.VALIDATION;
    message = '入力データが正しくありません';
  }

  return {
    statusCode,
    response: {
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : message,
      type: errorType,
    },
  };
};

/**
 * 非同期エラーハンドラーラッパー
 */
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        ErrorType.UNKNOWN,
        500,
        ErrorSeverity.HIGH,
        false
      );
    }
  }) as T;
};

/**
 * エラーレスポンスのフォーマット
 */
export const formatErrorResponse = (error: Error | AppError) => {
  const { statusCode, response } = handleError(error);
  return {
    statusCode,
    body: response,
  };
};

/**
 * エラーバウンダリ用のエラー報告
 */
export const reportError = (error: Error, errorInfo?: any) => {
  logger.error('React Error Boundary caught an error', {
    error: {
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
  });

  // プロダクション環境では外部サービスに報告
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentryなどのエラー監視サービスに送信
  }
};

/**
 * APIエラーのリトライロジック
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // リトライ不可能なエラーの場合は即座に投げる
      if (error instanceof AppError) {
        if (
          error.type === ErrorType.AUTHENTICATION ||
          error.type === ErrorType.AUTHORIZATION ||
          error.type === ErrorType.VALIDATION
        ) {
          throw error;
        }
      }

      // 最後の試行の場合はエラーを投げる
      if (i === maxRetries - 1) {
        throw lastError;
      }

      // エクスポネンシャルバックオフ
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
};

/**
 * エラーメッセージのサニタイズ
 */
export const sanitizeErrorMessage = (message: string): string => {
  // 機密情報を除去
  const sanitized = message
    .replace(/api[_-]?key[\s:=]+[\w-]+/gi, 'API_KEY=[REDACTED]')
    .replace(/password[\s:=]+[\S]+/gi, 'password=[REDACTED]')
    .replace(/token[\s:=]+[\w-]+/gi, 'token=[REDACTED]')
    .replace(/secret[\s:=]+[\w-]+/gi, 'secret=[REDACTED]');

  return sanitized;
};