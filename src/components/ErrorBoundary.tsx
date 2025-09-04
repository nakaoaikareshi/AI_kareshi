/**
 * エラーバウンダリコンポーネント
 * Reactコンポーネント内のエラーをキャッチして処理
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '@/lib/errorHandler';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // 次のレンダリングでフォールバックUIを表示するための状態更新
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーレポートサービスにエラー情報を送信
    reportError(error, errorInfo);

    // カスタムエラーハンドラがある場合は実行
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 状態を更新
    this.setState({
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h1 className="mt-4 text-xl font-semibold text-center text-gray-900">
              エラーが発生しました
            </h1>
            
            <p className="mt-2 text-sm text-center text-gray-600">
              申し訳ございません。予期しないエラーが発生しました。
            </p>

            {/* 開発環境の場合はエラー詳細を表示 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <p className="font-semibold text-gray-700">エラー詳細:</p>
                <p className="mt-1 text-red-600 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-700 font-semibold">
                      スタックトレース
                    </summary>
                    <pre className="mt-1 text-gray-600 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再試行
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                ホームへ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 特定のコンポーネント用のエラーバウンダリ
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
};