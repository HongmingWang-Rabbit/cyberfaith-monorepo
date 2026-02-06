"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Divider } from "@cyberfaith/ui";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { AiAnalysisCard, MbtiAnalysisContent } from "@/components/ui/ai-analysis";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/ui/toast";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageSkeleton } from "@/components/ui/skeleton";
import { MintReadingButton } from "@/components/wallet";

const dimensionKeys = ["EI", "SN", "TF", "JP"] as const;
const dimensionLabels: Record<string, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

function MbtiResultContent() {
  const t = useTranslations();
  const locale = useLocale();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "INTJ";
  const scoresRaw = searchParams.get("scores");
  let scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  if (scoresRaw) {
    try {
      scores = JSON.parse(decodeURIComponent(scoresRaw));
    } catch {
      // Invalid scores param, use defaults
    }
  }

  // Build answers from scores for the API (reconstruct approximate answers)
  const apiBody = useMemo(() => {
    if (!type || type.length !== 4) return null;
    const answers = dimensionKeys.map((dim, i) => ({
      questionId: i + 1,
      dimension: dim,
      value: type[i],
    }));
    return { answers, locale };
  }, [type, locale]);

  const { data: aiData, isLoading: aiLoading, error: aiError, refetch: aiRetry } = useAiAnalysis<Record<string, unknown>>(
    apiBody ? "/api/mbti/analyze" : null,
    apiBody
  );

  const typeName = t(`results.typeNames.${type}`);
  const typeDesc = t(`results.typeDescriptions.${type}`);

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast(t("common.actions.copy") + " ✓");
  }

  function handleSave() {
    // Save to localStorage
    try {
      const history = JSON.parse(localStorage.getItem("cyberfaith-history") || "[]");
      history.unshift({
        type: "mbti",
        result: type,
        scores,
        date: new Date().toISOString(),
      });
      localStorage.setItem("cyberfaith-history", JSON.stringify(history.slice(0, 50)));
      showToast(t("results.saved"));
    } catch {
      showToast(t("results.saved"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={`MBTI — ${type}`} />
      {/* Type display */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-7xl font-black tracking-wider bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent drop-shadow-lg"
            style={{ textShadow: "0 0 40px rgba(168,85,247,0.3)" }}>
          {type}
        </h1>
        <p className="text-xl text-accent font-semibold">{typeName}</p>
        <Badge variant="accent">{t("results.title")}</Badge>
      </div>

      <Divider />

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed text-lg">{typeDesc}</p>
        </CardContent>
      </Card>

      {/* Dimension breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("results.breakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensionKeys.map((dim) => {
            const [left, right] = dimensionLabels[dim];
            const score = scores[dim] || 0;
            const maxScore = 10;
            const pct = Math.round(((score + maxScore) / (2 * maxScore)) * 100);
            return (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={score >= 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                    {left} ({pct}%)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`mbti.dimensions.${dim}`)}
                  </span>
                  <span className={score < 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                    {right} ({100 - pct}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <AiAnalysisCard
        title={t("results.aiAnalysis")}
        isLoading={aiLoading}
        error={aiError}
        onRetry={aiRetry}
        aiTier={(aiData as Record<string, unknown>)?.aiTier as string | undefined}
      >
        {aiData ? (
          <MbtiAnalysisContent data={aiData} />
        ) : (
          <p className="text-muted-foreground italic">{t("results.aiPlaceholder")}</p>
        )}
      </AiAnalysisCard>

      {/* Share */}
      <ShareButtons title={`My MBTI type is ${type} — ${typeName}`} description="Discover your personality type on Destiny Loom" />

      {/* Mint as NFT */}
      <div className="flex justify-center">
        <MintReadingButton
          type="mbti"
          title={`MBTI: ${type} — ${typeName}`}
          description={`Personality type assessment result: ${type}`}
          data={{
            type,
            scores,
          }}
          onSuccess={(sig) => showToast(`Minted! ${sig.slice(0, 8)}...`)}
          onError={(err) => showToast(`Error: ${err}`)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={handleSave}>
          {t("common.actions.save")}
        </Button>
        <Link href="/mbti">
          <Button variant="ghost">{t("common.actions.back")}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function MbtiResult() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MbtiResultContent />
    </Suspense>
  );
}
