"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useParams } from "next/navigation";
import { zodiacSigns, getZodiacSign } from "@/data/zodiac-signs";
import { useState } from "react";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type Period = "daily" | "weekly" | "monthly";

export default function ZodiacSignPage() {
  const t = useTranslations("zodiac");
  const tc = useTranslations("common");
  const locale = useLocale();
  const params = useParams();
  const sign = getZodiacSign(params.sign as string);
  const [period, setPeriod] = useState<Period>("daily");

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
          <div className="text-center py-8 text-muted-foreground italic">
            {t("readingPlaceholder", { period: t(`readings.${period}`) })}
          </div>
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
    </div>
  );
}
