"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@cyberfaith/auth-client";

/* ── Types ─────────────────────────────────────────────── */

type ReadingType = "mbti" | "tarot" | "zodiac" | "i-ching" | "four-pillars";

interface Reading {
  id: string;
  type: ReadingType;
  input?: Record<string, unknown>;
  result: Record<string, unknown>;
  createdAt: string;
}

interface LocalHistoryEntry {
  id: string;
  type: "mbti" | "tarot" | "zodiac" | "fourPillars" | "iching";
  date: string;
  summary: string;
  link?: string;
}

/* ── Constants ─────────────────────────────────────────── */

const TYPE_ICONS: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  zodiac: "⭐",
  "four-pillars": "🏛️",
  "i-ching": "☯️",
  fourPillars: "🏛️",
  iching: "☯️",
};

const FILTER_TYPES: Array<{ key: string; value: ReadingType | "all" }> = [
  { key: "all", value: "all" },
  { key: "mbti", value: "mbti" },
  { key: "tarot", value: "tarot" },
  { key: "iching", value: "i-ching" },
  { key: "fourPillars", value: "four-pillars" },
  { key: "zodiac", value: "zodiac" },
];

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_reading: "🌟",
  five_readings: "⚡",
  ten_readings: "🔥",
  all_types: "🌈",
  streak_3: "💫",
  streak_7: "🏆",
  streak_30: "👑",
};

/* ── Helpers ───────────────────────────────────────────── */

function getLocalHistory(): LocalHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cyberfaith-history") || "[]");
  } catch {
    return [];
  }
}

function normalizeType(t: string): ReadingType {
  if (t === "fourPillars") return "four-pillars";
  if (t === "iching") return "i-ching";
  return t as ReadingType;
}

function getPreview(reading: Reading): string {
  const r = reading.result;
  switch (reading.type) {
    case "mbti":
      return (r.type as string) || "MBTI";
    case "tarot": {
      const cards = r.cards as Array<{ name?: string }> | undefined;
      if (cards?.length) return cards.map((c) => c.name).filter(Boolean).join(", ");
      return "Tarot";
    }
    case "zodiac":
      return (r.sign as string) || "Zodiac";
    case "i-ching":
      return (r.hexagramName as string) || (r.hexagram as string) || "I Ching";
    case "four-pillars":
      return (r.dayMaster as string) || "Four Pillars";
    default:
      return reading.type;
  }
}

function localToReading(e: LocalHistoryEntry): Reading {
  return {
    id: e.id,
    type: normalizeType(e.type),
    result: { summary: e.summary },
    createdAt: e.date,
  };
}

function computeStreak(readings: Reading[]): number {
  if (!readings.length) return 0;
  const dates = [...new Set(
    readings.map((r) => new Date(r.createdAt).toISOString().slice(0, 10))
  )].sort().reverse();

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]!);
    const curr = new Date(dates[i]!);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff <= 1.5) streak++;
    else break;
  }
  return streak;
}

function computeAchievements(readings: Reading[]): string[] {
  const achievements: string[] = [];
  if (readings.length >= 1) achievements.push("first_reading");
  if (readings.length >= 5) achievements.push("five_readings");
  if (readings.length >= 10) achievements.push("ten_readings");
  const types = new Set(readings.map((r) => r.type));
  if (types.size >= 5) achievements.push("all_types");
  const streak = computeStreak(readings);
  if (streak >= 3) achievements.push("streak_3");
  if (streak >= 7) achievements.push("streak_7");
  if (streak >= 30) achievements.push("streak_30");
  return achievements;
}

/* ── Component ─────────────────────────────────────────── */

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const { user, session, isAuthenticated, loginWithGoogle } = useAuth();

  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReadingType | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    if (isAuthenticated && session?.tokens?.accessToken) {
      try {
        const res = await fetch("/api/readings", {
          headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.readings || data.history || data;
          if (Array.isArray(list)) {
            setReadings(list);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fall through to localStorage
      }
    }
    // Fallback: localStorage
    setReadings(getLocalHistory().map(localToReading));
    setLoading(false);
  }, [isAuthenticated, session]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleDelete = async (id: string) => {
    if (isAuthenticated && session?.tokens?.accessToken) {
      try {
        await fetch(`/api/readings?id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
        });
      } catch {
        // ignore
      }
    } else {
      // Remove from localStorage
      const local = getLocalHistory().filter((e) => e.id !== id);
      localStorage.setItem("cyberfaith-history", JSON.stringify(local));
    }
    setReadings((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const filtered = filter === "all" ? readings : readings.filter((r) => r.type === filter);
  const streak = computeStreak(readings);
  const achievements = computeAchievements(readings);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      {/* Profile Card */}
      <Card className="border-primary/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          {isAuthenticated && user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="mx-auto w-20 h-20 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.3)] object-cover"
            />
          ) : (
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-highlight flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              {isAuthenticated && user ? (user.name || user.email || "U")[0].toUpperCase() : "👤"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isAuthenticated && user ? (user.name || user.email) : t("guest")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? t("loggedIn") : t("guestSub")}
            </p>
          </div>
          {!isAuthenticated && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{t("loginPrompt")}</p>
              <button
                onClick={loginWithGoogle}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {tc("auth.signIn")}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">{t("stats.title")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t("stats.totalReadings"), value: readings.length },
            { label: t("stats.streak"), value: streak },
            { label: t("stats.points"), value: readings.length * 10 },
            { label: t("stats.achievements"), value: achievements.length },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">{t("achievements.title")}</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.map((a) => (
              <div
                key={a}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-primary/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                title={t(`achievements.${a}` as Parameters<typeof t>[0])}
              >
                <span className="text-xl">{ACHIEVEMENT_ICONS[a] || "🏅"}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`achievements.${a}` as Parameters<typeof t>[0])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">{t("history.title")}</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_TYPES.map((ft) => (
            <button
              key={ft.key}
              onClick={() => setFilter(ft.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === ft.value
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {TYPE_ICONS[ft.value] || "📋"} {t(`history.filterTypes.${ft.key}` as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-12 bg-muted/20 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-4xl mb-3">🔮</p>
              <p className="text-muted-foreground italic">{t("history.empty")}</p>
              <Link
                href="/"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                {tc("actions.start")}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((reading) => (
              <Card
                key={reading.id}
                className="hover:border-primary/30 transition-colors group"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{TYPE_ICONS[reading.type] || "📋"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getPreview(reading)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(`history.filterTypes.${reading.type === "four-pillars" ? "fourPillars" : reading.type === "i-ching" ? "iching" : reading.type}` as Parameters<typeof t>[0])}{" "}
                      · {new Date(reading.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Delete */}
                    {deleteConfirm === reading.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(reading.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          {t("history.confirmDelete")}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-foreground hover:bg-muted/30 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(reading.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-red-400 transition-all"
                        title={t("history.delete")}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
