"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@cyberfaith/ui";
import { TarotCard } from "./TarotCard";
import { tarotDeck, spreadConfigs, type SpreadType, type DrawnCard, type TarotCard as TarotCardType } from "@/data/tarot-deck";

interface TarotDeckProps {
  spreadType: SpreadType;
  onComplete: (cards: DrawnCard[]) => void;
}

export const TarotDeck = memo(function TarotDeck({ spreadType, onComplete }: TarotDeckProps) {
  const t = useTranslations("tarot");
  const config = spreadConfigs[spreadType];
  const [shuffledDeck] = useState(() => [...tarotDeck].sort(() => Math.random() - 0.5));
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Show 12 cards from shuffled deck for selection
  const displayCards = useMemo(() => shuffledDeck.slice(0, 12), [shuffledDeck]);

  const handleCardClick = useCallback((index: number) => {
    if (isComplete) return;
    if (selectedIndices.includes(index)) return;
    if (selectedIndices.length >= config.count) return;

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);
    setFlippedIndices((prev) => new Set([...prev, index]));

    if (newSelected.length >= config.count) {
      setIsComplete(true);
    }
  }, [selectedIndices, config.count, isComplete]);

  const handleConfirm = useCallback(() => {
    const drawnCards: DrawnCard[] = selectedIndices.map((idx, i) => ({
      card: displayCards[idx],
      isReversed: Math.random() > 0.5,
      position: config.positions[i].en,
      positionZh: config.positions[i].zh,
    }));
    onComplete(drawnCards);
  }, [selectedIndices, displayCards, config, onComplete]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          {t("selectCards", { selected: selectedIndices.length, total: config.count })}
        </p>
        <div className="flex justify-center gap-1">
          {Array.from({ length: config.count }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < selectedIndices.length ? "bg-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 justify-items-center">
        <AnimatePresence>
          {displayCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <TarotCard
                card={card}
                isFlipped={flippedIndices.has(idx)}
                isSelected={selectedIndices.includes(idx)}
                isReversed={false}
                onClick={() => handleCardClick(idx)}
                size="sm"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button variant="neon" onClick={handleConfirm}>
            {t("viewReading")}
          </Button>
        </motion.div>
      )}
    </div>
  );
});
