"use client";

import { useCallback, useEffect, useState } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "selection";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [30, 50, 30, 50, 30],
  selection: 5,
};

export function useHaptic() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("haptic-enabled");
      if (stored !== null) setEnabled(stored === "true");
    } catch {}
  }, []);

  const vibrate = useCallback(
    (pattern: HapticPattern = "light") => {
      if (!enabled) return;
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(patterns[pattern]);
        }
      } catch {}
    },
    [enabled],
  );

  const toggle = useCallback((value: boolean) => {
    setEnabled(value);
    try {
      localStorage.setItem("haptic-enabled", String(value));
    } catch {}
  }, []);

  return { vibrate, enabled, toggle };
}
