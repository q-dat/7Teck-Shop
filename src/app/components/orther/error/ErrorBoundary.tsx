'use client';
import React, { Component } from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../../types/type/error/error';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center overflow-x-hidden bg-black p-10 text-white">
          <div className="w-full text-center">
            <h1 className="mb-6 text-5xl font-bold">Đã có bugs 🐞!!!</h1>
            <div className="mb-6 rounded-md bg-gray-800 p-4 text-left text-sm">
              <p className="break-words font-mono text-red-500">{this.state.error?.toString()}</p>
              <pre className="mt-4 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </div>
            <button
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Thua luôn, hết cứu!!!
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
