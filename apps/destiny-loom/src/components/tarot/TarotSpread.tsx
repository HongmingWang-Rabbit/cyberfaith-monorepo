"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { TarotCard } from "./TarotCard";
import type { DrawnCard, SpreadType } from "@/data/tarot-deck";

interface TarotSpreadProps {
  cards: DrawnCard[];
  spreadType: SpreadType;
}

export function TarotSpread({ cards, spreadType }: TarotSpreadProps) {
  const locale = useLocale();

  if (spreadType === "single") {
    return (
      <div className="flex justify-center">
        <CardWithLabel card={cards[0]} locale={locale} index={0} />
      </div>
    );
  }

  if (spreadType === "three-card") {
    return (
      <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
        {cards.map((c, i) => (
          <CardWithLabel key={i} card={c} locale={locale} index={i} />
        ))}
      </div>
    );
  }

  // Celtic cross - simplified 2-row layout
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3 flex-wrap">
        {cards.slice(0, 6).map((c, i) => (
          <CardWithLabel key={i} card={c} locale={locale} index={i} />
        ))}
      </div>
      <div className="flex justify-center gap-3 flex-wrap">
        {cards.slice(6).map((c, i) => (
          <CardWithLabel key={i + 6} card={c} locale={locale} index={i + 6} />
        ))}
      </div>
    </div>
  );
}

function CardWithLabel({ card, locale, index }: { card: DrawnCard; locale: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-xs text-accent font-medium">
        {locale === "zh" ? card.positionZh : card.position}
      </span>
      <TarotCard
        card={card.card}
        isReversed={card.isReversed}
        isFlipped={true}
        size="md"
      />
      <div className="text-center max-w-28">
        <p className="text-xs font-semibold text-foreground">
          {locale === "zh" ? card.card.nameZh : card.card.name}
        </p>
        {card.isReversed && (
          <span className="text-[10px] text-highlight">
            {locale === "zh" ? "逆位" : "Reversed"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
