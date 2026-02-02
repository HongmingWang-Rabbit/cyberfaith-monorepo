import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-muted/50",
        {
          "h-4 w-full rounded": variant === "text",
          "rounded-full": variant === "circular",
          "rounded-md": variant === "rectangular",
        },
        className,
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";
