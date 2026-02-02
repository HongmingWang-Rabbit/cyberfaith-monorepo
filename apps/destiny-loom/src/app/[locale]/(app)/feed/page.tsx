"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { Link } from "@/i18n/navigation";
import { ReportButton } from "@/components/community/report-modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const typeIcons: Record<string, string> = {
  mbti: "🧠", tarot: "🃏", "i-ching": "☯️", "four-pillars": "🏛️", zodiac: "⭐", dream: "🌙", numerology: "🔢",
};

interface FeedItem {
  id: string;
  itemType: "reading" | "achievement";
  readingType?: string;
  result?: any;
  achievementName?: string;
  achievementIcon?: string;
  achievementDescription?: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorUsername: string | null;
  authorAvatar: string | null;
}

export default function FeedPage() {
  const t = useTranslations("feed");
  const { isAuthenticated, session, isLoading } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const token = session?.tokens?.accessToken;

  const loadPage = useCallback(async (pageNum: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/feed?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const newItems = json.data || [];
        if (pageNum === 1) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }
        setHasMore(newItems.length >= 20);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) loadPage(1);
  }, [isAuthenticated, token, loadPage]);

  // Real-time polling: refresh first page every 30s
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const interval = setInterval(() => {
      if (page === 1) loadPage(1);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, page, loadPage]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page, loadPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary animate-pulse text-xl">⚡ {t("loading")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-6xl">📡</span>
        <p className="text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          📡 {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="text-5xl">🌌</span>
          <p className="text-muted-foreground mt-4">{t("empty")}</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.itemType}-${item.id}`}
            className="relative overflow-hidden rounded-xl border border-primary/10 bg-card/60 backdrop-blur-sm p-4 hover:border-primary/30 transition"
          >
            <div className="flex items-start gap-3">
              {item.authorAvatar ? (
                <img src={item.authorAvatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
                  👤
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.authorUsername ? (
                    <Link href={`/user/${item.authorUsername}`} className="text-sm font-medium text-foreground hover:text-primary transition">
                      {item.authorName}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">{item.authorName}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {item.itemType === "reading" ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">
                      {typeIcons[item.readingType || ""] || "✨"}{" "}
                      {t("readingBy", { name: item.authorName, type: item.readingType || "reading" })}
                    </p>
                    <Link
                      href={`/share/${item.id}`}
                      className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                    >
                      View Reading →
                    </Link>
                  </>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg">{item.achievementIcon || "🏆"}</span>
                    <span className="text-sm text-accent font-medium">
                      {t("achievementBy", { name: item.authorName, achievement: item.achievementName || "" })}
                    </span>
                  </div>
                )}
              </div>
              {item.itemType === "reading" && (
                <ReportButton targetType="reading" targetId={item.id} className="text-xs" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={observerRef} className="h-8" />
      {loading && <p className="text-center text-muted-foreground animate-pulse">{t("loading")}</p>}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-sm">{t("noMore")}</p>
      )}
    </div>
  );
}
