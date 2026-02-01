"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="max-w-md mx-auto my-16 p-6 rounded-xl border border-destructive/30 bg-card text-center space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-destructive">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-[var(--glow-purple)] transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
