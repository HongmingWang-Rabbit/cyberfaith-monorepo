"use client";

import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef, useEffect } from "react";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      if (open) document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* biome-ignore lint: backdrop overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative z-50 w-full max-w-lg rounded-lg border border-primary/30 bg-card p-6 shadow-[var(--glow-purple)] backdrop-blur-md",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";
