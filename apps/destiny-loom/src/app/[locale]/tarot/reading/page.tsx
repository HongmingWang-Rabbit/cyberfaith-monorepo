"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TarotDeck } from "@/components/tarot/TarotDeck";
import type { SpreadType, DrawnCard } from "@/data/tarot-deck";

function ReadingContent() {
  const t = useTranslations("tarot");
  const searchParams = useSearchParams();
  const router = useRouter();
  const spread = (searchParams.get("spread") || "single") as SpreadType;

  const handleComplete = useCallback((cards: DrawnCard[]) => {
    const data = encodeURIComponent(JSON.stringify(cards.map(c => ({
      id: c.card.id,
      reversed: c.isReversed,
      position: c.position,
      positionZh: c.positionZh,
    }))));
    router.push(`/tarot/result?spread=${spread}&cards=${data}`);
  }, [spread, router]);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          {t("reading.title")}
        </h1>
        <p className="text-muted-foreground">{t("reading.instruction")}</p>
      </div>

      <TarotDeck spreadType={spread} onComplete={handleComplete} />
    </div>
  );
}

export default function TarotReadingPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 animate-pulse text-muted-foreground">Loading...</div>}>
      <ReadingContent />
    </Suspense>
  );
}
