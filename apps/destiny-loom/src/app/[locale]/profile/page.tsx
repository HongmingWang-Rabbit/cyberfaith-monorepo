"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  type: "mbti" | "tarot" | "zodiac" | "fourPillars" | "iching";
  date: string;
  summary: string;
  link?: string;
}

const TYPE_ICONS: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  zodiac: "⭐",
  fourPillars: "🏛️",
  iching: "☯️",
};

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cyberfaith-history") || "[]");
  } catch {
    return [];
  }
}

function getStats(history: HistoryEntry[]) {
  const tests = history.filter((h) => h.type === "mbti").length;
  const readings = history.filter(
    (h) => h.type !== "mbti"
  ).length;
  const signs = new Set(
    history.filter((h) => h.type === "zodiac").map((h) => h.summary)
  ).size;
  return { tests, readings, signs };
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const stats = getStats(history);

  const grouped = history.reduce<Record<string, HistoryEntry[]>>(
    (acc, entry) => {
      (acc[entry.type] ??= []).push(entry);
      return acc;
    },
    {}
  );

  const clearHistory = () => {
    localStorage.removeItem("cyberfaith-history");
    setHistory([]);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      {/* Profile Card */}
      <Card className="border-primary/20 shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden">
        <CardContent className="p-8 text-center space-y-4">
          {/* Avatar */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-highlight flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("guest")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("guestSub")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {t("stats.title")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t("stats.testsCompleted"), value: stats.tests },
            { label: t("stats.readingsDone"), value: stats.readings },
            { label: t("stats.signsExplored"), value: stats.signs },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("history.title")}
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              {t("history.clearAll")}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground italic">
                {t("history.empty")}
              </p>
              <Link
                href="/"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                {tc("actions.start")}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([type, entries]) => (
              <div key={type}>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <span>{TYPE_ICONS[type] ?? "📋"}</span>
                  {t(`history.${type}` as Parameters<typeof t>[0])}
                </p>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <Card key={entry.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <span className="text-2xl">
                          {TYPE_ICONS[entry.type] ?? "📋"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {entry.summary}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        {entry.link && (
                          <Link
                            href={entry.link}
                            className="text-xs text-primary hover:underline shrink-0"
                          >
                            →
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
