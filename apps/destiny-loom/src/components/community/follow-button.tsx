"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FollowButtonProps {
  userId: string;
  className?: string;
}

export function FollowButton({ userId, className = "" }: FollowButtonProps) {
  const t = useTranslations("follow");
  const { isAuthenticated, session, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = session?.tokens?.accessToken;

  useEffect(() => {
    if (!isAuthenticated || !token || (user as any)?.id === userId) return;
    fetch(`${API_URL}/users/${userId}/is-following`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setIsFollowing(d.data?.isFollowing ?? false))
      .catch(() => {});
  }, [isAuthenticated, token, userId, user]);

  if (!isAuthenticated || (user as any)?.id === userId) return null;

  const toggle = async () => {
    if (loading || !token) return;
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/users/${userId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setIsFollowing(!isFollowing);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isFollowing
          ? "bg-muted/50 text-muted-foreground border border-primary/20 hover:border-red-500/50 hover:text-red-400"
          : "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105"
      } ${className}`}
    >
      {loading ? "..." : isFollowing ? t("unfollow") : t("follow")}
    </button>
  );
}
