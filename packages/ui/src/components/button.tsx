import { cn } from "@cyberfaith/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "neon";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:shadow-[var(--glow-purple)]":
              variant === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border":
              variant === "secondary",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              variant === "destructive",
            "border border-border bg-transparent hover:bg-primary/10 hover:border-primary hover:text-primary":
              variant === "outline",
            "hover:bg-primary/10 hover:text-primary":
              variant === "ghost",
            "bg-gradient-to-r from-primary via-accent to-highlight text-white hover:shadow-[var(--glow-purple-lg)] border border-primary/30":
              variant === "neon",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
