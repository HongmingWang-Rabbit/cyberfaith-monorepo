"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, Badge } from "@cyberfaith/ui";
import { useParams } from "next/navigation";
import { zodiacSigns, getZodiacSign } from "@/data/zodiac-signs";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useZodiacReading } from "@/hooks/useAiAnalysis";
import { AiAnalysisCard, ReadingContent } from "@/components/ui/ai-analysis";
import { MintReadingButton } from "@/components/wallet";

type Period = "daily" | "weekly" | "monthly";

export default function ZodiacSignPage() {
  const t = useTranslations("zodiac");
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const sign = getZodiacSign(params.sign as string);
  const [period, setPeriod] = useState<Period>("daily");
  const { data: readingData, isLoading: readingLoading, error: readingError, fetchReading } = useZodiacReading();

  useEffect(() => {
    if (sign) {
      fetchReading(sign.id, period, locale);
    }
  }, [sign, period, locale, fetchReading]);

  if (!sign) {
    notFound();
  }

  const isZh = locale === "zh";
  const compatSigns = sign.compatible
    .map((id) => zodiacSigns.find((s) => s.id === id))
    .filter(Boolean);

  const handleShare = async () => {
    const text = `${sign.symbol} ${isZh ? sign.nameZh : sign.name} — ${sign.dateRange}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      /* User cancelled share or clipboard unavailable */
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={`${sign.symbol} ${isZh ? sign.nameZh : sign.name}`} />
      {/* Hero Card */}
      <Card className="overflow-hidden border-primary/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <CardContent className="p-8 text-center space-y-4">
          <span className="text-7xl block">{sign.symbol}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isZh ? sign.nameZh : sign.name}
          </h1>
          <p className="text-muted-foreground">{sign.dateRange}</p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground">{t("element")}</p>
              <p className="font-semibold text-foreground">
                {isZh ? sign.elementZh : t(`elements.${sign.element}`)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground">{t("rulingPlanet")}</p>
              <p className="font-semibold text-foreground">
                {isZh ? sign.rulingPlanetZh : sign.rulingPlanet}
              </p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-2">{t("traits")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(isZh ? sign.traitsZh : sign.traits).map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readings Tabs */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2 justify-center">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {t(`readings.${p}`)}
              </button>
            ))}
          </div>
          {readingLoading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
              <span className="text-muted-foreground text-sm animate-pulse">
                {t("readingPlaceholder", { period: t(`readings.${period}`) })}
              </span>
            </div>
          ) : readingError ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground text-sm italic">{readingError}</p>
              <button
                onClick={() => fetchReading(sign.id, period, locale)}
                className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {tc("ai.retry")}
              </button>
            </div>
          ) : readingData ? (
            <>
              {(readingData as Record<string, unknown>)?.aiTier === "pro" && (
                <div className="flex items-center gap-1 mb-3">
                  <Badge variant="highlight">⚡ PRO</Badge>
                </div>
              )}
              <ReadingContent data={readingData as Record<string, unknown>} />
              {(readingData as Record<string, unknown>)?.aiTier !== "pro" && (
                <div className="mt-6 p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-purple-950/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔮</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{tc("ai.upsellTitle")}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tc("ai.upsellDescription")}</p>
                    </div>
                    <a href={`/${locale}/pricing`} className="text-xs px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all whitespace-nowrap">
                      {tc("ai.upsellCta")}
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground italic">
              {t("readingPlaceholder", { period: t(`readings.${period}`) })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compatibility */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">
            {t("compatibleWith")}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {compatSigns.map(
              (cs) =>
                cs && (
                  <Link key={cs.id} href={`/zodiac/${cs.id}`}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-primary/30">
                      <span className="text-2xl">{cs.symbol}</span>
                      <span className="text-sm font-medium">
                        {isZh ? cs.nameZh : cs.name}
                      </span>
                    </span>
                  </Link>
                )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share */}
      <ShareButtons
        title={`${sign.symbol} ${isZh ? sign.nameZh : sign.name} — ${sign.dateRange}`}
        description="Zodiac reading on Destiny Loom"
      />

      {/* Mint as NFT */}
      <div className="flex justify-center">
        <MintReadingButton
          type="zodiac"
          title={`${sign.symbol} ${isZh ? sign.nameZh : sign.name} — ${period} reading`}
          description={`Zodiac reading for ${sign.name} (${sign.dateRange})`}
          data={{
            sign: sign.id,
            element: sign.element,
            rulingPlanet: sign.rulingPlanet,
            period,
          }}
        />
      </div>
    </div>
  );
}
