"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

interface PublicToggleProps {
  readingId: string;
  initialPublic?: boolean;
  onToggle?: (isPublic: boolean) => void;
}

export function PublicToggle({ readingId, initialPublic = false, onToggle }: PublicToggleProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleToggle = async () => {
    const newValue = !isPublic;
    setLoading(true);
    try {
      const token = localStorage.getItem("cyberfaith-token");
      const res = await fetch(`/api/readings/${readingId}/public`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isPublic: newValue }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setIsPublic(newValue);
      onToggle?.(newValue);
      showToast(newValue ? "Reading is now public 🌐" : "Reading is now private 🔒");
    } catch {
      showToast("Failed to update sharing setting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isPublic
          ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30"
          : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/30"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isPublic ? "Make reading private" : "Make reading public"}
    >
      {loading ? "⏳" : isPublic ? "🌐" : "🔒"}{" "}
      {isPublic ? "Public" : "Private"}
    </button>
  );
}
