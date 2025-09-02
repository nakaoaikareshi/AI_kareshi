'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details for debugging (in production, send to error tracking service)
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to error tracking service (e.g., Sentry)
    console.error('Error Boundary caught an error:', errorDetails);
    
    // Store error locally for potential retry
    try {
      localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorDetails));
    } catch {
      // Ignore localStorage errors
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const error = this.state.error;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              予期しないエラーが発生しました
            </h1>
            
            <p className="text-gray-600 mb-6">
              申し訳ございません。アプリケーションでエラーが発生しました。
              ページを再読み込みするか、ホームに戻ってお試しください。
            </p>

            {isDevelopment && error && (
              <details className="mb-4 text-left bg-gray-100 p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  エラーの詳細 (開発モード)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>メッセージ:</strong>
                    <p className="text-red-600 font-mono text-xs">{error.message}</p>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>スタックトレース:</strong>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再読み込み
                </button>
              </div>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                ホームに戻る
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                エラーID: {this.state.errorId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                問題が続く場合は、このIDと共にサポートにお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}