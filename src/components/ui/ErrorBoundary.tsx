'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary component.
 * Catches JavaScript errors anywhere in the child component tree.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[200px] flex items-center justify-center bg-[#f5f5f5] rounded-lg border border-[#e0e0e0] p-8">
          <div className="text-center">
            <p className="text-[#4a4a4a] mb-2">Something went wrong loading this section.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="text-sm text-[#1a1a1a] underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
