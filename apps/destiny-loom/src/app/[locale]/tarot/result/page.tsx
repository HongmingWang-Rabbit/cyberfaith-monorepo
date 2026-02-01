"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle, Divider } from "@cyberfaith/ui";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { AiAnalysisCard, ReadingContent } from "@/components/ui/ai-analysis";
import { Link } from "@/i18n/navigation";
import { useToast } from "@/components/ui/toast";
import { TarotSpread } from "@/components/tarot/TarotSpread";
import { tarotDeck, type SpreadType, type DrawnCard } from "@/data/tarot-deck";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageSkeleton } from "@/components/ui/skeleton";

function ResultContent() {
  const t = useTranslations();
  const locale = useLocale();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const spread = (searchParams.get("spread") || "single") as SpreadType;
  const cardsRaw = searchParams.get("cards");

  const drawnCards: DrawnCard[] = useMemo(() => {
    if (!cardsRaw) return [];
    try {
      const parsed = JSON.parse(decodeURIComponent(cardsRaw));
      return parsed.map((c: { id: number; reversed: boolean; position: string; positionZh: string }) => {
        const card = tarotDeck.find((t) => t.id === c.id) || tarotDeck[0];
        return { card, isReversed: c.reversed, position: c.position, positionZh: c.positionZh };
      });
    } catch {
      return [];
    }
  }, [cardsRaw]);

  const apiBody = useMemo(() => {
    if (drawnCards.length === 0) return null;
    return {
      cards: drawnCards.map((c) => ({
        name: c.card.name,
        position: c.position,
        reversed: c.isReversed,
      })),
      spreadType: spread,
      locale,
    };
  }, [drawnCards, spread, locale]);

  const { data: aiData, isLoading: aiLoading, error: aiError, refetch: aiRetry } = useAiAnalysis<Record<string, unknown>>(
    apiBody ? "/api/tarot/analyze" : null,
    apiBody
  );

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    showToast(t("common.actions.copy") + " ✓");
  }

  function handleSave() {
    try {
      const history = JSON.parse(localStorage.getItem("cyberfaith-history") || "[]");
      history.unshift({
        type: "tarot",
        spread,
        cards: drawnCards.map(c => ({
          name: c.card.name,
          nameZh: c.card.nameZh,
          reversed: c.isReversed,
          position: c.position,
        })),
        date: new Date().toISOString(),
      });
      localStorage.setItem("cyberfaith-history", JSON.stringify(history.slice(0, 50)));
      showToast(t("tarot.result.saved"));
    } catch {
      showToast(t("tarot.result.saved"));
    }
  }

  if (drawnCards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t("tarot.result.noCards")}</p>
        <Link href="/tarot"><Button variant="neon" className="mt-4">{t("common.actions.back")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={t("tarot.result.title")} />
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {t("tarot.result.title")}
        </h1>
      </div>

      <TarotSpread cards={drawnCards} spreadType={spread} />

      <Divider />

      {/* Card details */}
      <div className="space-y-4">
        {drawnCards.map((drawn, i) => (
          <Card key={i} className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-accent">{locale === "zh" ? drawn.positionZh : drawn.position}</span>
                <span>—</span>
                <span>{locale === "zh" ? drawn.card.nameZh : drawn.card.name}</span>
                {drawn.isReversed && (
                  <span className="text-xs text-highlight font-normal">({locale === "zh" ? "逆位" : "Reversed"})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {drawn.isReversed
                  ? locale === "zh" ? drawn.card.reversedMeaningZh : drawn.card.reversedMeaning
                  : locale === "zh" ? drawn.card.uprightMeaningZh : drawn.card.uprightMeaning}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {(locale === "zh" ? drawn.card.keywordsZh : drawn.card.keywords).map((kw) => (
                  <span key={kw} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {kw}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis */}
      <AiAnalysisCard
        title={t("tarot.result.aiAnalysis")}
        isLoading={aiLoading}
        error={aiError}
        onRetry={aiRetry}
      >
        {aiData ? (
          <ReadingContent data={aiData} />
        ) : (
          <p className="text-muted-foreground italic">{t("tarot.result.aiPlaceholder")}</p>
        )}
      </AiAnalysisCard>

      <ShareButtons title="My Tarot Reading" description="Interactive Tarot reading on Destiny Loom" />

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" onClick={handleSave}>{t("common.actions.save")}</Button>
        <Link href="/tarot"><Button variant="ghost">{t("common.actions.back")}</Button></Link>
      </div>
    </div>
  );
}

export default function TarotResultPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResultContent />
    </Suspense>
  );
}
