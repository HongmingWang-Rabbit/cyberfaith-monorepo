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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to console for debugging
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);

    // Report to Sentry if available
    if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error, ctx?: unknown) => void } }).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  onRetry,
}: {
  error?: Error | null;
  onRetry?: () => void;
}) {
  return (
    <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-red-500/30 bg-gradient-to-b from-card to-card/80 text-center space-y-5 shadow-[0_0_40px_rgba(239,68,68,0.12),0_0_80px_rgba(124,58,237,0.08)]">
      <div className="relative inline-block">
        <span className="text-5xl">🔮</span>
        <span className="absolute -top-1 -right-2 text-2xl animate-pulse">⚡</span>
      </div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
        The Cosmic Signal Was Disrupted
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {error?.message || "A glitch in the astral matrix. The stars will realign shortly."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-medium hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          ✨ Retry the Connection
        </button>
      )}
    </div>
  );
}
