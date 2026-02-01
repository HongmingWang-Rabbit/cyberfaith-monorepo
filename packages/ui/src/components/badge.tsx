import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "accent" | "highlight";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-primary/20 text-primary border border-primary/30": variant === "default",
          "bg-secondary text-secondary-foreground border border-border": variant === "secondary",
          "bg-accent/20 text-accent border border-accent/30": variant === "accent",
          "bg-highlight/20 text-highlight border border-highlight/30": variant === "highlight",
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
