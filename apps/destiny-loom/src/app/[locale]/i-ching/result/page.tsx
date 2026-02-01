"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useEffect, useState } from "react";
import type { CastResult, HexagramLine } from "@/lib/i-ching";

function HexagramDisplay({
  lines,
  animated,
}: {
  lines: HexagramLine[];
  animated: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(animated ? 0 : 6);

  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= 6) {
          clearInterval(timer);
          return 6;
        }
        return c + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, [animated]);

  // Display from top (line 6) to bottom (line 1)
  const sorted = [...lines].sort((a, b) => b.position - a.position);

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {sorted.map((line) => {
        const visible = line.position <= visibleCount;
        const isChanging = line.changing;
        const isYang =
          line.type === "yang" || line.type === "old-yang";

        return (
          <div
            key={line.position}
            className={`flex items-center gap-1 transition-all duration-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            } ${isChanging ? "animate-pulse" : ""}`}
          >
            {isYang ? (
              <div
                className={`w-32 h-3 rounded-sm ${
                  isChanging
                    ? "bg-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "bg-foreground"
                }`}
              />
            ) : (
              <>
                <div
                  className={`w-14 h-3 rounded-sm ${
                    isChanging
                      ? "bg-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "bg-foreground"
                  }`}
                />
                <div className="w-4" />
                <div
                  className={`w-14 h-3 rounded-sm ${
                    isChanging
                      ? "bg-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "bg-foreground"
                  }`}
                />
              </>
            )}
            {isChanging && (
              <span className="text-accent text-xs ml-2">○</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function IChingResultPage() {
  const t = useTranslations("iching");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isZh = locale === "zh";
  const [result, setResult] = useState<CastResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("iching-result");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-muted-foreground">{t("noData")}</p>
        <Link href="/i-ching" className="text-primary hover:underline">
          {tc("actions.back")}
        </Link>
      </div>
    );
  }

  const { hexagram, lines, changingLines, resultHexagram } = result;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {t("resultTitle")}
        </h1>
      </div>

      {/* Main Hexagram */}
      <Card className="border-primary/20 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("hexagram")} #{hexagram.number}
          </p>
          <h2 className="text-3xl font-bold text-foreground">
            {hexagram.chinese} · {hexagram.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hexagram.trigrams.upper} ☰ {hexagram.trigrams.lower}
          </p>

          <HexagramDisplay lines={lines} animated={true} />

          <p className="text-muted-foreground italic">
            {hexagram.description}
          </p>
        </CardContent>
      </Card>

      {/* Judgment & Image */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t("judgment")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {hexagram.description}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t("image")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("trigramAboveBelow", { upper: hexagram.trigrams.upper, lower: hexagram.trigrams.lower })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Changing Lines */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-foreground text-center">
            {t("changingLines")}
          </h3>
          {changingLines.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-2 flex-wrap">
                {changingLines.map((pos) => (
                  <span
                    key={pos}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20"
                  >
                    {t("line", { pos })}
                  </span>
                ))}
              </div>
              {resultHexagram && (
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">→</p>
                  <p className="text-lg font-semibold text-foreground">
                    {resultHexagram.chinese} · {resultHexagram.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("hexagram")} #{resultHexagram.number}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground italic">
              {t("noChangingLines")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Placeholder */}
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {t("aiAnalysis")}
          </h3>
          <p className="text-muted-foreground italic">{t("aiPlaceholder")}</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href="/i-ching"
          className="px-6 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium inline-block"
        >
          {tc("actions.back")}
        </Link>
      </div>
    </div>
  );
}
