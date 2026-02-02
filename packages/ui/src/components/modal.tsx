"use client";

import { cn } from "@cyberfaith/utils";
import { type HTMLAttributes, forwardRef, useEffect, useRef, useCallback } from "react";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const dialogRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      if (open) document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    // Focus trap
    useEffect(() => {
      if (!open) return;
      const container = dialogRef.current ?? internalRef.current;
      if (!container) return;

      const previouslyFocused = document.activeElement as HTMLElement | null;
      const focusableSelector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length > 0) focusable[0].focus();

      function handleTab(e: KeyboardEvent) {
        if (e.key !== "Tab") return;
        const elements = Array.from(container!.querySelectorAll<HTMLElement>(focusableSelector)).filter(
          (el) => el.offsetParent !== null
        );
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      container.addEventListener("keydown", handleTab);
      return () => {
        container.removeEventListener("keydown", handleTab);
        previouslyFocused?.focus();
      };
    }, [open, dialogRef]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* biome-ignore lint: backdrop overlay */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div
          ref={dialogRef}
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
