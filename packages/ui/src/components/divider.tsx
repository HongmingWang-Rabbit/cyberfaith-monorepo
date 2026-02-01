import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef } from "react";

export const Divider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-border to-transparent", className)}
      {...props}
    />
  )
);
Divider.displayName = "Divider";
