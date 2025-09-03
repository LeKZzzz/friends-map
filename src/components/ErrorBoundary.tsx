import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 这里可以添加错误报告服务
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content">
            <h2>🚨 出现了一些问题</h2>
            <p>应用程序遇到了意外错误</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>错误详情</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="error-retry-btn"
                aria-label="重试"
              >
                重试
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="error-reload-btn"
                aria-label="刷新页面"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;