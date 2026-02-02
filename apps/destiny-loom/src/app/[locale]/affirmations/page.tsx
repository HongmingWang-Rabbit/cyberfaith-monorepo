"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useState, useEffect, useCallback } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface Affirmation {
  text: string;
  theme: string;
  emoji: string;
}

interface AffirmationData {
  affirmations: Affirmation[];
  dailyMantra: string;
  cosmicEnergy: string;
  date: string;
  zodiacSign: string | null;
}

export default function AffirmationsPage() {
  const t = useTranslations("affirmations");
  const locale = useLocale();
  const [data, setData] = useState<AffirmationData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const fetchAffirmations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/affirmations?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to load affirmations");
      const result = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchAffirmations();
  }, [fetchAffirmations]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("affirmation-favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const shareAffirmation = async (aff: Affirmation) => {
    const text = `✨ "${aff.text}" ${aff.emoji}\n\n— CyberFaith Daily Affirmation`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      localStorage.setItem("affirmation-favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const goNext = () => {
    if (data) setCurrentIndex((prev) => (prev + 1) % data.affirmations.length);
  };

  const goPrev = () => {
    if (data) setCurrentIndex((prev) => (prev - 1 + data.affirmations.length) % data.affirmations.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    setTouchStart(null);
  };

  const current = data?.affirmations[currentIndex];

  const themeColors: Record<string, string> = {
    abundance: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
    love: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    strength: "from-red-500/20 to-orange-500/20 border-red-500/30",
    wisdom: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
    healing: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    courage: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    transformation: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10 pb-24">
      <Breadcrumb current={t("title")} />

      {/* Daily Mantra */}
      {data?.dailyMantra && (
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("dailyMantra")}</p>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-pink-500 bg-clip-text text-transparent">
            {data.dailyMantra}
          </h1>
          {data.cosmicEnergy && (
            <p className="text-sm text-muted-foreground">✨ {data.cosmicEnergy}</p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">{t("loading")}</p>
        </div>
      )}

      {error && (
        <Card className="border-red-500/20">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchAffirmations}
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
            >
              {t("retry")}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Affirmation Display */}
      {current && (
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Card
            className={`border bg-gradient-to-br ${themeColors[current.theme] || themeColors.wisdom} transition-all duration-500`}
          >
            <CardContent className="p-10 md:p-16 text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
              <span className="text-6xl">{current.emoji}</span>
              <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
                &ldquo;{current.text}&rdquo;
              </p>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {current.theme}
              </span>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={goPrev}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={() => toggleFavorite(currentIndex)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                favorites.has(currentIndex)
                  ? "border-pink-500 text-pink-500 bg-pink-500/10"
                  : "border-border text-muted-foreground hover:text-pink-500 hover:border-pink-500"
              }`}
              aria-label="Favorite"
            >
              {favorites.has(currentIndex) ? "❤️" : "🤍"}
            </button>
            <button
              onClick={() => current && shareAffirmation(current)}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-cyan-400 hover:border-cyan-400 transition-colors"
              aria-label="Share"
            >
              📤
            </button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {data!.affirmations.length}
            </span>
            <button
              onClick={goNext}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              aria-label="Next"
            >
              →
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">{t("swipeHint")}</p>
        </div>
      )}

      {/* All Affirmations List */}
      {data && data.affirmations.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">{t("allAffirmations")}</h3>
          <div className="space-y-3">
            {data.affirmations.map((aff, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all ${
                  i === currentIndex ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20"
                }`}
                onClick={() => setCurrentIndex(i)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{aff.emoji}</span>
                  <p className="text-sm text-foreground flex-1">{aff.text}</p>
                  {favorites.has(i) && <span className="text-pink-500">❤️</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
