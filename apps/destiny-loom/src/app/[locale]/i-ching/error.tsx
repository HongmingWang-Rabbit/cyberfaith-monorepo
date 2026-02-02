"use client";

import { ErrorFallback } from "@/components/ui/error-boundary";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorFallback error={error} onRetry={reset} />
    </div>
  );
}
