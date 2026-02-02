"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { zodiacSigns } from "@/data/zodiac-signs";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CompatibilityResult } from "@/components/compatibility/compatibility-result";

// Pre-computed base compatibility scores using element relationships
function getBaseScore(sign1: string, sign2: string): number {
  const s1 = zodiacSigns.find((s) => s.id === sign1);
  const s2 = zodiacSigns.find((s) => s.id === sign2);
  if (!s1 || !s2) return 50;

  if (sign1 === sign2) return 75;

  // Same element = high
  if (s1.element === s2.element) return 85;

  // Complementary elements
  const complementary: Record<string, string> = { fire: "air", air: "fire", earth: "water", water: "earth" };
  if (complementary[s1.element] === s2.element) return 78;

  // Challenging elements
  const challenging: Record<string, string> = { fire: "water", water: "fire", earth: "air", air: "earth" };
  if (challenging[s1.element] === s2.element) return 45;

  // Check compatible array
  if (s1.compatible.includes(sign2)) return 82;

  return 60;
}

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-500/80 text-white";
  if (score >= 65) return "bg-emerald-500/60 text-white";
  if (score >= 50) return "bg-yellow-500/60 text-white";
  return "bg-red-500/50 text-white";
}

export default function CompatibilityMatrixPage() {
  const t = useTranslations("compatibility");
  const [selectedPair, setSelectedPair] = useState<{ s1: string; s2: string } | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCellClick = async (s1: string, s2: string) => {
    setSelectedPair({ s1, s2 });
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/zodiac/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign1: s1,
          sign2: s2,
          locale: document.documentElement.lang || "en",
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data.compatibility);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={t("matrix")} />
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {t("matrix")}
        </h1>
        <p className="text-muted-foreground">{t("matrixSubtitle")}</p>
      </div>

      {/* Matrix grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${zodiacSigns.length}, 1fr)` }}>
            {/* Header row */}
            <div className="h-14" />
            {zodiacSigns.map((s) => (
              <div key={s.id} className="h-14 flex items-center justify-center text-xs font-medium text-muted-foreground">
                <span className="text-lg" title={s.name}>{s.symbol}</span>
              </div>
            ))}

            {/* Data rows */}
            {zodiacSigns.map((row) => (
              <>
                <div key={`label-${row.id}`} className="h-12 flex items-center justify-center text-lg" title={row.name}>
                  {row.symbol}
                </div>
                {zodiacSigns.map((col) => {
                  const score = getBaseScore(row.id, col.id);
                  const isSelected = selectedPair?.s1 === row.id && selectedPair?.s2 === col.id;
                  return (
                    <button
                      key={`${row.id}-${col.id}`}
                      onClick={() => handleCellClick(row.id, col.id)}
                      className={`h-12 flex items-center justify-center text-xs font-bold rounded-sm m-0.5 transition-all duration-200 hover:scale-110 hover:z-10 ${scoreColor(score)} ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110 z-10" : ""}`}
                    >
                      {score}
                    </button>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500/80" /> 80+</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-500/60" /> 65-79</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-500/60" /> 50-64</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-500/50" /> &lt;50</span>
      </div>

      {/* Detail panel */}
      {selectedPair && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-2xl">
            <span>{zodiacSigns.find((s) => s.id === selectedPair.s1)?.symbol}</span>
            <span className="text-primary font-bold">×</span>
            <span>{zodiacSigns.find((s) => s.id === selectedPair.s2)?.symbol}</span>
          </div>
          {loading && (
            <div className="text-center text-muted-foreground animate-pulse py-8">
              {t("analyzing")}
            </div>
          )}
          {result && <CompatibilityResult data={result} sign1={selectedPair.s1} sign2={selectedPair.s2} />}
        </div>
      )}
    </div>
  );
}
