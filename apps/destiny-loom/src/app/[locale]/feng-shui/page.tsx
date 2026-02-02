"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AiAnalysisCard } from "@/components/ui/ai-analysis";

const ELEMENTS_INFO: Record<string, { emoji: string; color: string }> = {
  Wood: { emoji: "🌳", color: "text-green-400 border-green-400" },
  Fire: { emoji: "🔥", color: "text-red-400 border-red-400" },
  Earth: { emoji: "🏔️", color: "text-amber-400 border-amber-400" },
  Metal: { emoji: "⚔️", color: "text-gray-300 border-gray-300" },
  Water: { emoji: "🌊", color: "text-blue-400 border-blue-400" },
};

const ROOM_OPTIONS = ["bedroom", "office", "living", "kitchen", "bathroom"] as const;
const DIRECTION_OPTIONS = [
  "north", "northeast", "east", "southeast",
  "south", "southwest", "west", "northwest",
] as const;

interface FengShuiData {
  chineseElement: string;
  interpretation: {
    elementProfile?: { element: string; personality: string; complementaryElements?: string[]; conflictingElements?: string[] };
    roomAnalysis?: { overview: string; energyFlow: string; rating: string };
    layoutTips?: Array<{ area: string; tip: string; reason: string }>;
    colorPalette?: Array<{ color: string; hex: string; reason: string }>;
    elementsToAdd?: Array<{ element: string; items: string[]; placement: string }>;
    thingsToAvoid?: string[];
    cosmicInsight?: string;
    [key: string]: unknown;
  };
  aiTier?: string;
}

export default function FengShuiPage() {
  const t = useTranslations("fengShui");
  const locale = useLocale();
  const [birthYear, setBirthYear] = useState("");
  const [roomType, setRoomType] = useState("");
  const [compassDirection, setCompassDirection] = useState("");
  const [result, setResult] = useState<FengShuiData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!birthYear || !roomType || !compassDirection) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feng-shui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthYear: parseInt(birthYear, 10), roomType, compassDirection, locale }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate reading");
    } finally {
      setIsLoading(false);
    }
  };

  const interp = result?.interpretation;
  const elemInfo = result ? ELEMENTS_INFO[result.chineseElement] || { emoji: "🌀", color: "text-primary border-primary" } : null;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10 pb-24">
      <Breadcrumb current={t("title")} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-primary to-red-400 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Input Form */}
      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <span className="text-6xl block mb-4">🏯</span>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("birthYearLabel")}</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="1990"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("roomTypeLabel")}</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
              >
                <option value="">{t("selectRoom")}</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>{t(`rooms.${r}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("directionLabel")}</label>
              <select
                value={compassDirection}
                onChange={(e) => setCompassDirection(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
              >
                <option value="">{t("selectDirection")}</option>
                {DIRECTION_OPTIONS.map((d) => (
                  <option key={d} value={d}>{t(`directions.${d}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !birthYear || !roomType || !compassDirection}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                isLoading
                  ? "bg-primary/50 text-primary-foreground/70 animate-pulse"
                  : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              }`}
            >
              {isLoading ? t("analyzing") : t("analyzeButton")}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Element Wheel */}
      {result && elemInfo && (
        <Card className={`border-2 ${elemInfo.color.split(" ")[1]}/30`}>
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-7xl">{elemInfo.emoji}</div>
            <h2 className={`text-3xl font-bold ${elemInfo.color.split(" ")[0]}`}>
              {result.chineseElement} {t("element")}
            </h2>
            {interp?.elementProfile?.personality && (
              <p className="text-muted-foreground max-w-lg mx-auto">{interp.elementProfile.personality}</p>
            )}
            {interp?.elementProfile?.complementaryElements && (
              <div className="flex justify-center gap-2 flex-wrap">
                {interp.elementProfile.complementaryElements.map((el) => (
                  <span key={el} className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    ✓ {el}
                  </span>
                ))}
                {interp?.elementProfile?.conflictingElements?.map((el) => (
                  <span key={el} className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    ✗ {el}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Room Tips */}
      {interp?.layoutTips && interp.layoutTips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">{t("layoutTips")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {interp.layoutTips.map((tip, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-5 space-y-2">
                  <p className="text-sm font-semibold text-primary">{tip.area}</p>
                  <p className="text-foreground text-sm">{tip.tip}</p>
                  <p className="text-xs text-muted-foreground italic">{tip.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {interp?.colorPalette && interp.colorPalette.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">{t("colorRecommendations")}</h3>
          <div className="flex gap-4 flex-wrap justify-center">
            {interp.colorPalette.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-28">
                <div
                  className="w-16 h-16 rounded-full border-2 border-border shadow-lg"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-sm font-medium text-foreground">{c.color}</span>
                <span className="text-xs text-muted-foreground text-center">{c.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Full Analysis */}
      {(result || isLoading) && (
        <AiAnalysisCard
          title={t("aiAnalysis")}
          isLoading={isLoading}
          error={error}
          onRetry={handleSubmit}
          aiTier={result?.aiTier}
        >
          {interp?.cosmicInsight && (
            <p className="text-accent italic border-l-2 border-accent/30 pl-3 mb-4">{interp.cosmicInsight}</p>
          )}
          {interp?.thingsToAvoid && interp.thingsToAvoid.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">⚠️ {t("thingsToAvoid")}</p>
              <ul className="space-y-1">
                {interp.thingsToAvoid.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </AiAnalysisCard>
      )}
    </div>
  );
}
