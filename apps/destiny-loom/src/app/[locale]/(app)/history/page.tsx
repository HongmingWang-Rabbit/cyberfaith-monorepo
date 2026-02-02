"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, Button } from "@cyberfaith/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuth } from "@cyberfaith/auth-client";
import { TarotCardArt } from "@/components/tarot/TarotCardArt";

const READING_TYPE_ICONS: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  zodiac: "⭐",
  "i-ching": "☯️",
  "four-pillars": "🏛️",
  dream: "🌙",
};

const READING_TYPES = ["all", "tarot", "mbti", "zodiac", "i-ching", "four-pillars", "dream"] as const;

interface Reading {
  id: string;
  type: string;
  result: any;
  input: any;
  locale: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const t = useTranslations("history");
  const { session, isAuthenticated, isLoading } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [favoritedOnly, setFavoritedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchReadings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (favoritedOnly) params.set("favorited", "true");
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/readings?${params}`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      const json = await res.json();
      if (json.success) setReadings(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session, typeFilter, favoritedOnly, dateFrom, dateTo]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  const toggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/readings/${id}/favorite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setReadings((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isFavorite: json.data.isFavorite } : r))
        );
      }
    } catch {
      // ignore
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (favoritedOnly) params.set("favorited", "true");
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/history/export?${params}`, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reading-history-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  // Group readings by month for summary
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, Reading[]> = {};
    for (const r of readings) {
      const key = r.createdAt.slice(0, 7); // YYYY-MM
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [readings]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-gray-400 mt-20">
        <p>{t("signInRequired")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Breadcrumb current={t("title")} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={exportPdf}
          disabled={exporting || readings.length === 0}
        >
          {exporting ? t("exporting") : t("exportPdf")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {READING_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  typeFilter === type
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                }`}
              >
                {type === "all" ? t("filterAll") : `${READING_TYPE_ICONS[type] || ""} ${type}`}
              </button>
            ))}
            <button
              onClick={() => setFavoritedOnly(!favoritedOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                favoritedOnly
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
              }`}
            >
              ❤️ {t("favorites")}
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono"
              placeholder={t("from")}
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono"
              placeholder={t("to")}
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                {t("clearDates")}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Cards */}
      {Object.keys(monthlyGroups).length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(monthlyGroups)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 6)
            .map(([month, items]) => {
              const typeCounts: Record<string, number> = {};
              for (const r of items) {
                typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
              }
              const topType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0];
              return (
                <Card key={month}>
                  <CardContent className="p-3">
                    <div className="text-xs font-mono text-gray-500">{month}</div>
                    <div className="text-lg font-bold text-white">{items.length}</div>
                    <div className="text-[10px] text-gray-400">{t("readings")}</div>
                    <div className="text-xs text-cyan-400 mt-1">
                      {READING_TYPE_ICONS[topType[0]] || ""} {topType[0]} ({topType[1]})
                    </div>
                    <div className="text-[10px] text-pink-400">
                      ❤️ {items.filter((r) => r.isFavorite).length}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : readings.length === 0 ? (
        <div className="text-center text-gray-500 py-12">{t("noReadings")}</div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-purple-500/40 to-transparent" />

          <div className="space-y-4">
            {readings.map((reading, idx) => {
              const date = new Date(reading.createdAt);
              const tarotCards = reading.type === "tarot" && reading.result?.cards
                ? (Array.isArray(reading.result.cards) ? reading.result.cards : [])
                : [];

              return (
                <div key={reading.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-4 top-4 w-4 h-4 rounded-full border-2 border-cyan-500 bg-gray-900"
                    style={{
                      boxShadow: reading.isFavorite ? "0 0 8px #ff66aa" : "0 0 6px #00ffff44",
                      borderColor: reading.isFavorite ? "#ff66aa" : "#00cccc",
                    }}
                  />

                  <Card className="hover:border-cyan-500/30 transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{READING_TYPE_ICONS[reading.type] || "📖"}</span>
                            <span className="text-sm font-mono text-white capitalize">{reading.type}</span>
                            {reading.isPublic && (
                              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">
                                {t("public")}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-1">
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>

                          {/* Tarot card art preview */}
                          {tarotCards.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                              {tarotCards.slice(0, 3).map((card: any, i: number) => (
                                <TarotCardArt
                                  key={i}
                                  cardId={typeof card === "number" ? card : card.id ?? i}
                                  reversed={card.reversed}
                                  size="sm"
                                  interpretation={card.interpretation}
                                />
                              ))}
                            </div>
                          )}

                          {/* Result preview */}
                          {reading.result && (
                            <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                              {typeof reading.result === "string"
                                ? reading.result
                                : reading.result.summary || reading.result.interpretation || JSON.stringify(reading.result).slice(0, 120)}
                            </div>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(reading.id);
                          }}
                          className="p-2 hover:scale-110 transition-transform"
                          aria-label={reading.isFavorite ? t("unfavorite") : t("favorite")}
                        >
                          <span className={reading.isFavorite ? "text-pink-400" : "text-gray-600 group-hover:text-gray-400"}>
                            {reading.isFavorite ? "❤️" : "🤍"}
                          </span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
