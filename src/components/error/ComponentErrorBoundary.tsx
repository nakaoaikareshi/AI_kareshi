'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });

    // Log component-specific error
    console.error(`Error in ${this.props.componentName || 'Component'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    });
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  public render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const componentName = this.props.componentName || 'コンポーネント';

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              {componentName}でエラーが発生しました
            </h3>
          </div>
          
          <p className="text-sm text-red-700 mb-3">
            この部分の表示に問題が発生しています。
            {canRetry && '再試行ボタンをクリックしてください。'}
          </p>

          {this.props.showDetails && this.state.error && (
            <details className="mb-3">
              <summary className="text-xs text-red-600 cursor-pointer">
                エラーの詳細
              </summary>
              <div className="mt-1 p-2 bg-red-100 rounded text-xs font-mono text-red-700">
                {this.state.error.message}
              </div>
            </details>
          )}

          {canRetry ? (
            <button
              onClick={this.handleRetry}
              className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              再試行 ({this.maxRetries - this.state.retryCount}回残り)
            </button>
          ) : (
            <p className="text-xs text-red-600">
              最大再試行回数に達しました。ページを再読み込みしてください。
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}