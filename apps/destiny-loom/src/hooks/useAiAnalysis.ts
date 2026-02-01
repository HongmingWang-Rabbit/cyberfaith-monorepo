"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AiAnalysisState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAiAnalysis<T = unknown>(
  endpoint: string | null,
  body: Record<string, unknown> | null
): AiAnalysisState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bodyKey = body ? JSON.stringify(body) : null;

  const fetchAnalysis = useCallback(async () => {
    if (!endpoint || !body) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed (${res.status})`);
      }

      const result = await res.json();
      if (!controller.signal.aborted) {
        setData(result as T);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, bodyKey]);

  useEffect(() => {
    fetchAnalysis();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchAnalysis]);

  return { data, isLoading, error, refetch: fetchAnalysis };
}

/**
 * Cached version for zodiac readings - caches by key in component state
 */
export function useZodiacReading() {
  const [cache, setCache] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<unknown>(null);

  const fetchReading = useCallback(
    async (sign: string, period: string, locale: string) => {
      const cacheKey = `${sign}-${period}-${locale}`;

      if (cache[cacheKey]) {
        setCurrentData(cache[cacheKey]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/zodiac/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sign, period, locale }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed (${res.status})`);
        }

        const result = await res.json();
        setCache((prev) => ({ ...prev, [cacheKey]: result }));
        setCurrentData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load reading");
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  return { data: currentData, isLoading, error, fetchReading };
}
