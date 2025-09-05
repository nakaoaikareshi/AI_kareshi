/**
 * エラーハンドリング用カスタムフック
 * コンポーネント内でのエラー処理を簡潔に実装
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  AppError, 
  ErrorType, 
  ErrorSeverity,
  handleError,
  sanitizeErrorMessage 
} from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

interface ErrorState {
  error: Error | AppError | null;
  message: string | null;
  isError: boolean;
  type: ErrorType | null;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  setError: (error: Error | AppError | string | null) => void;
  clearError: () => void;
  handleAsyncError: <T>(promise: Promise<T>) => Promise<T | undefined>;
  ErrorDisplay: () => null;
}

/**
 * エラーハンドリングカスタムフック
 */
export const useErrorHandler = (
  autoHideDelay: number = 5000
): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    message: null,
    isError: false,
    type: null,
  });

  // エラーを設定
  const setError = useCallback((error: Error | AppError | string | null) => {
    if (error === null) {
      setErrorState({
        error: null,
        message: null,
        isError: false,
        type: null,
      });
      return;
    }

    if (typeof error === 'string') {
      setErrorState({
        error: new Error(error),
        message: error,
        isError: true,
        type: ErrorType.UNKNOWN,
      });
    } else if (error instanceof AppError) {
      setErrorState({
        error,
        message: error.message,
        isError: true,
        type: error.type,
      });
    } else {
      const { response } = handleError(error);
      setErrorState({
        error,
        message: response.error,
        isError: true,
        type: response.type || ErrorType.UNKNOWN,
      });
    }

    // ロギング
    logger.error('Error handled by useErrorHandler', { error });
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      message: null,
      isError: false,
      type: null,
    });
  }, []);

  // 非同期エラーのハンドリング
  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>
  ): Promise<T | undefined> => {
    try {
      return await promise;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Unknown error'));
      return undefined;
    }
  }, [setError]);

  // 自動的にエラーを非表示
  useEffect(() => {
    if (errorState.isError && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        clearError();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [errorState.isError, autoHideDelay, clearError]);

  // エラー表示コンポーネント（プレースホルダー）
  // 実際のJSXコンポーネントは別ファイルで定義する必要がある
  const ErrorDisplay = useCallback(() => {
    return null; // JSXをhooksファイル内で返すことはできないため
  }, []);

  return {
    error: errorState,
    setError,
    clearError,
    handleAsyncError,
    ErrorDisplay,
  };
};

/**
 * APIコール用のエラーハンドリングフック
 */
export const useApiErrorHandler = () => {
  const { error, setError, clearError, handleAsyncError, ErrorDisplay } = useErrorHandler();

  const handleApiCall = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      showError?: boolean;
    }
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await apiCall();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : 'API呼び出しエラー',
            ErrorType.EXTERNAL_API,
            500,
            ErrorSeverity.HIGH
          );
      
      if (options?.showError !== false) {
        setError(appError);
      }
      
      if (options?.onError) {
        options.onError(appError);
      }
      
      return null;
    }
  }, [setError, clearError]);

  return {
    handleApiCall,
    setError,
    clearError,
    ErrorDisplay,
  };
};