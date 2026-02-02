"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AiAnalysisCard, ReadingContent } from "@/components/ui/ai-analysis";

interface NumerologyData {
  numbers: { lifePathNumber: number; expressionNumber: number; soulUrgeNumber: number };
  interpretation: Record<string, unknown>;
  aiTier?: string;
}

function NumberDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold border-2 ${color}`}
        style={{
          textShadow: "0 0 20px currentColor, 0 0 40px currentColor",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        {value}
        <div className={`absolute inset-0 rounded-full ${color} opacity-20 animate-ping`} />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function NumerologyPage() {
  const t = useTranslations("numerology");
  const locale = useLocale();
  const [fullName, setFullName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [result, setResult] = useState<NumerologyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !birthdate) return;
    setIsLoading(true);
    setError(null);
    setRevealed(false);

    try {
      const res = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), birthdate, locale }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
      // Animated reveal
      setTimeout(() => setRevealed(true), 300);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate reading");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10 pb-24">
      <Breadcrumb current={t("title")} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Input Form */}
      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <span className="text-6xl block mb-4">🔢</span>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("fullNameLabel")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("birthdateLabel")}</label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !fullName.trim() || !birthdate}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                isLoading
                  ? "bg-primary/50 text-primary-foreground/70 animate-pulse"
                  : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              }`}
            >
              {isLoading ? t("calculating") : t("calculateButton")}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Number Reveal */}
      {result && (
        <div
          className={`transition-all duration-700 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Card className="border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
                {t("yourNumbers")}
              </h2>
              <div className="flex justify-center gap-8 flex-wrap">
                <NumberDisplay
                  label={t("lifePathNumber")}
                  value={result.numbers.lifePathNumber}
                  color="border-cyan-400 text-cyan-400"
                />
                <NumberDisplay
                  label={t("expressionNumber")}
                  value={result.numbers.expressionNumber}
                  color="border-primary text-primary"
                />
                <NumberDisplay
                  label={t("soulUrgeNumber")}
                  value={result.numbers.soulUrgeNumber}
                  color="border-pink-500 text-pink-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Analysis */}
      {(result || isLoading) && (
        <AiAnalysisCard
          title={t("aiAnalysis")}
          isLoading={isLoading}
          error={error}
          onRetry={handleSubmit}
          aiTier={result?.aiTier}
        >
          {result?.interpretation && (
            <ReadingContent data={{ interpretation: result.interpretation }} />
          )}
        </AiAnalysisCard>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
