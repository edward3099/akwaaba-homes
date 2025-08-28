'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showToast?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for catching JavaScript errors anywhere in the component tree
 * and displaying a fallback UI instead of crashing the entire app.
 * 
 * Features:
 * - Catches runtime errors in child components
 * - Displays user-friendly error messages
 * - Provides recovery options (retry, go back, go home)
 * - Optional toast notifications
 * - Customizable fallback UI
 * - Error logging for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error information
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show toast notification if enabled
    if (this.props.showToast !== false) {
      toast.error('Something went wrong', {
        description: 'An error occurred. Please try refreshing the page.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with Ghana theme
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ghana-gold/10 to-ghana-green/10 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl border-2 border-ghana-green p-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-ghana-red/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-ghana-red" />
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-semibold text-ghana-red mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-ghana-green hover:bg-ghana-green-dark text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={this.handleGoBack}
                variant="outline"
                className="w-full border-ghana-gold text-ghana-gold hover:bg-ghana-gold hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full border-ghana-red text-ghana-red hover:bg-ghana-red hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Support Information */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If this problem persists, please contact our support team.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Error ID: {this.state.error?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to handle errors
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    toast.error('An error occurred', {
      description: error.message || 'Something went wrong. Please try again.',
      action: {
        label: 'Report',
        onClick: () => {
          // You can implement error reporting logic here
          console.log('Error reported:', error);
        }
      }
    });
  }, []);

  return { handleError };
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
