"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { AiAnalysisCard, ReadingContent } from "@/components/ui/ai-analysis";
import {
  calculateFourPillars,
  type FourPillarsResult,
  type Pillar,
} from "@/lib/four-pillars";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageSkeleton } from "@/components/ui/skeleton";

const ELEMENT_COLORS: Record<string, string> = {
  Wood: "text-green-400 border-green-400/30 bg-green-400/10",
  Fire: "text-red-400 border-red-400/30 bg-red-400/10",
  Earth: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Metal: "text-slate-300 border-slate-300/30 bg-slate-300/10",
  Water: "text-blue-400 border-blue-400/30 bg-blue-400/10",
};

const ELEMENT_ZH: Record<string, string> = {
  Wood: "木",
  Fire: "火",
  Earth: "土",
  Metal: "金",
  Water: "水",
};

function PillarCard({
  label,
  pillar,
  isZh,
}: {
  label: string;
  pillar: Pillar;
  isZh: boolean;
}) {
  const stemColor = ELEMENT_COLORS[pillar.stem.element] ?? "";
  const branchColor = ELEMENT_COLORS[pillar.branch.element] ?? "";

  return (
    <div className="text-center space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-2">
        <div
          className={`rounded-lg border p-3 ${stemColor}`}
        >
          <p className="text-2xl font-bold">{pillar.stem.chinese}</p>
          <p className="text-xs">{pillar.stem.pinyin}</p>
          <p className="text-xs opacity-70">
            {isZh ? ELEMENT_ZH[pillar.stem.element] : pillar.stem.element}
          </p>
        </div>
        <div
          className={`rounded-lg border p-3 ${branchColor}`}
        >
          <p className="text-2xl font-bold">{pillar.branch.chinese}</p>
          <p className="text-xs">{pillar.branch.pinyin}</p>
          <p className="text-xs opacity-70">
            {pillar.branch.animal}
            {" · "}
            {isZh
              ? ELEMENT_ZH[pillar.branch.element]
              : pillar.branch.element}
          </p>
        </div>
      </div>
    </div>
  );
}

function FourPillarsResultContent() {
  const t = useTranslations("fourPillars");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isZh = locale === "zh";
  const searchParams = useSearchParams();

  const result: FourPillarsResult | null = useMemo(() => {
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));
    const day = Number(searchParams.get("day"));
    const hour = Number(searchParams.get("hour"));
    if (!year || !month || !day) return null;
    return calculateFourPillars(year, month, day, hour ?? 12);
  }, [searchParams]);

  const apiBody = useMemo(() => {
    if (!result) return null;
    return { pillars: result, locale };
  }, [result, locale]);

  const { data: aiData, isLoading: aiLoading, error: aiError, refetch: aiRetry } = useAiAnalysis<Record<string, unknown>>(
    apiBody ? "/api/four-pillars/analyze" : null,
    apiBody
  );

  if (!result) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-muted-foreground">{t("noData")}</p>
        <Link
          href="/four-pillars"
          className="text-primary hover:underline"
        >
          {tc("actions.back")}
        </Link>
      </div>
    );
  }

  const pillars = [
    { key: "year", label: t("pillars.year"), pillar: result.year },
    { key: "month", label: t("pillars.month"), pillar: result.month },
    { key: "day", label: t("pillars.day"), pillar: result.day },
    { key: "hour", label: t("pillars.hour"), pillar: result.hour },
  ];

  const maxElement = Object.entries(result.dominantElements).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0]
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={t("resultTitle")} />
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          {t("resultTitle")}
        </h1>
      </div>

      {/* Four Pillars Grid */}
      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {pillars.map(({ key, label, pillar }) => (
              <PillarCard
                key={key}
                label={label}
                pillar={pillar}
                isZh={isZh}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Five Elements Analysis */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">
            {t("elementsTitle")}
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {Object.entries(result.dominantElements).map(
              ([element, count]) => (
                <div
                  key={element}
                  className={`px-4 py-3 rounded-lg border text-center min-w-[70px] ${ELEMENT_COLORS[element] ?? ""}`}
                >
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs">
                    {isZh ? ELEMENT_ZH[element] : element}
                  </p>
                </div>
              )
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t("dominantElement")}:{" "}
            <span className="font-semibold text-foreground">
              {isZh ? ELEMENT_ZH[maxElement[0] as string] : maxElement[0]}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <AiAnalysisCard
        title={t("aiAnalysis")}
        isLoading={aiLoading}
        error={aiError}
        onRetry={aiRetry}
      >
        {aiData ? (
          <ReadingContent data={aiData} />
        ) : (
          <p className="text-muted-foreground italic">{t("aiPlaceholder")}</p>
        )}
      </AiAnalysisCard>

      <ShareButtons
        title="My Four Pillars of Destiny"
        description="Four Pillars (BaZi) analysis on Destiny Loom"
      />

      <div className="text-center">
        <Link
          href="/four-pillars"
          className="px-6 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium inline-block"
        >
          {tc("actions.back")}
        </Link>
      </div>
    </div>
  );
}

export default function FourPillarsResultPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FourPillarsResultContent />
    </Suspense>
  );
}
