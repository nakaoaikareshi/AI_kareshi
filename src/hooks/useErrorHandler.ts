/**
 * エラーハンドリング用カスタムフック
 * コンポーネント内でのエラー処理を簡潔に実装
 */

import { useState, useCallback, useEffect } from 'react';
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
  ErrorDisplay: () => JSX.Element | null;
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
    logger.error('Error handled by useErrorHandler', error);
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

  // エラー表示コンポーネント
  const ErrorDisplay = () => {
    if (!errorState.isError || !errorState.message) return null;

    const getErrorColor = () => {
      switch (errorState.type) {
        case ErrorType.VALIDATION:
          return 'bg-yellow-50 border-yellow-400 text-yellow-800';
        case ErrorType.AUTHENTICATION:
        case ErrorType.AUTHORIZATION:
          return 'bg-orange-50 border-orange-400 text-orange-800';
        case ErrorType.RATE_LIMIT:
          return 'bg-purple-50 border-purple-400 text-purple-800';
        case ErrorType.NOT_FOUND:
          return 'bg-gray-50 border-gray-400 text-gray-800';
        default:
          return 'bg-red-50 border-red-400 text-red-800';
      }
    };

    return (
      <div
        className={`fixed top-4 right-4 max-w-sm p-4 border rounded-lg shadow-lg z-50 ${getErrorColor()}`}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {sanitizeErrorMessage(errorState.message)}
            </p>
          </div>
          <button
            onClick={clearError}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

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
  const { setError, clearError, ErrorDisplay } = useErrorHandler();

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