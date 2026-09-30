import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('sb_cart');
      localStorage.removeItem('sb_wishlist');
      localStorage.removeItem('sb_lang');
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Sajilo Bazar encountered an unexpected issue while rendering. You can reload the page or reset the local cache.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Sajilo Bazar
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache & Restart
              </button>

              <a
                href="./"
                className="block text-xs text-neutral-500 hover:text-neutral-700 underline mt-2"
              >
                Return to Home
              </a>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left border-t border-neutral-100 pt-3">
                <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 font-mono">
                  Technical details
                </summary>
                <pre className="mt-2 text-[11px] bg-neutral-900 text-red-300 p-3 rounded-lg overflow-x-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
