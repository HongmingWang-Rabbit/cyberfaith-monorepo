import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "primary" | "accent" | "highlight";
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, variant = "primary", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", {
            "bg-gradient-to-r from-primary-dark to-primary shadow-[var(--glow-purple)]": variant === "primary",
            "bg-gradient-to-r from-accent/80 to-accent shadow-[var(--glow-cyan)]": variant === "accent",
            "bg-gradient-to-r from-highlight/80 to-highlight shadow-[var(--glow-pink)]": variant === "highlight",
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
