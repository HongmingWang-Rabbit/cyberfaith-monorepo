"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useEffect, useCallback, useRef } from "react";

const TYPE_ICONS: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  zodiac: "⭐",
  "i-ching": "☯️",
  "four-pillars": "🏛️",
};

const TYPE_LABELS: Record<string, string> = {
  mbti: "MBTI",
  tarot: "Tarot",
  zodiac: "Zodiac",
  "i-ching": "I Ching",
  "four-pillars": "Four Pillars",
};

const REACTION_EMOJIS = ["👍", "❤️", "🔮", "✨", "🌟"];

interface FeedReading {
  id: string;
  type: string;
  result: any;
  locale: string | null;
  createdAt: string;
  authorName: string;
  authorAvatar: string | null;
}

function getResultSnippet(type: string, result: any): string {
  if (!result) return "No result available";
  if (type === "mbti" && result.type) return `Type: ${result.type}`;
  if (type === "zodiac" && result.sign) return `Sign: ${result.sign}`;
  if (type === "tarot" && result.interpretation) {
    return result.interpretation.slice(0, 120) + (result.interpretation.length > 120 ? "…" : "");
  }
  if (result.analysis) {
    return result.analysis.slice(0, 120) + (result.analysis.length > 120 ? "…" : "");
  }
  if (result.interpretation) {
    return result.interpretation.slice(0, 120) + (result.interpretation.length > 120 ? "…" : "");
  }
  const str = JSON.stringify(result).slice(0, 120);
  return str.length >= 120 ? str + "…" : str;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function ReadingCard({
  reading,
  token,
}: {
  reading: FeedReading;
  token: string | null;
}) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const [loadingEmoji, setLoadingEmoji] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/readings/${reading.id}/reactions`)
      .then((r) => r.json())
      .then((d) => d.data && setReactions(d.data))
      .catch(() => {});
  }, [reading.id]);

  const handleReact = async (emoji: string) => {
    if (!token || loadingEmoji) return;
    setLoadingEmoji(emoji);
    try {
      const res = await fetch(`/api/readings/${reading.id}/react`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
        setMyReactions((prev) => new Set(prev).add(emoji));
      }
    } catch {
      // ignore
    } finally {
      setLoadingEmoji(null);
    }
  };

  return (
    <div className="group relative rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg border border-primary/20">
              {TYPE_ICONS[reading.type] || "🔮"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {reading.authorName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {TYPE_LABELS[reading.type] || reading.type}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {timeAgo(reading.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Result snippet */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {getResultSnippet(reading.type, reading.result)}
        </p>

        {/* Reactions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {REACTION_EMOJIS.map((emoji) => {
            const count = reactions[emoji] || 0;
            const isActive = myReactions.has(emoji);
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                disabled={!token || loadingEmoji === emoji || isActive}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all duration-200 border ${
                  isActive
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : count > 0
                    ? "bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    : "bg-transparent border-transparent text-muted-foreground/50 hover:bg-muted/30 hover:border-border hover:text-muted-foreground"
                } disabled:cursor-default`}
              >
                <span>{emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const t = useTranslations("community");
  const { session } = useAuth();
  const token = session?.tokens?.accessToken ?? null;
  const [readings, setReadings] = useState<FeedReading[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const url = new URL("/api/readings/feed", window.location.origin);
        url.searchParams.set("page", String(pageNum));
        url.searchParams.set("limit", "20");
        if (filter) url.searchParams.set("type", filter);

        const res = await fetch(url.toString());
        const json = await res.json();
        const items: FeedReading[] = json.data || [];

        if (items.length < 20) setHasMore(false);
        setReadings((prev) => (reset ? items : [...prev, ...items]));
        setPage(pageNum);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [filter, loading]
  );

  useEffect(() => {
    setReadings([]);
    setHasMore(true);
    setPage(1);
    fetchFeed(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Infinite scroll
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchFeed(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, page, fetchFeed]);

  const types = [null, "mbti", "tarot", "zodiac", "i-ching", "four-pillars"];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {types.map((type) => (
          <button
            key={type ?? "all"}
            onClick={() => setFilter(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 border ${
              filter === type
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-card/40 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            {type ? (
              <>
                <span>{TYPE_ICONS[type]}</span>
                <span>{TYPE_LABELS[type]}</span>
              </>
            ) : (
              t("allTypes")
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {readings.map((reading) => (
          <ReadingCard key={reading.id} reading={reading} token={token} />
        ))}
      </div>

      {/* Loading / sentinel */}
      <div ref={observerRef} className="py-8 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            {t("loading")}
          </div>
        )}
        {!loading && !hasMore && readings.length > 0 && (
          <p className="text-muted-foreground text-sm">{t("endOfFeed")}</p>
        )}
        {!loading && readings.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔮</span>
            <p className="text-muted-foreground">{t("empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
