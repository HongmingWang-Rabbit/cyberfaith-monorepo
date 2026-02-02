"use client";

import { motion } from "framer-motion";
import type { TarotCard as TarotCardType } from "@/data/tarot-deck";
import { useLocale } from "next-intl";
import { useHaptic } from "@/hooks/useHaptic";

interface TarotCardProps {
  card?: TarotCardType;
  isReversed?: boolean;
  isFlipped: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function TarotCard({ card, isReversed, isFlipped, isSelected, onClick, size = "md" }: TarotCardProps) {
  const locale = useLocale();
  const { vibrate } = useHaptic();
  const sizeClasses = {
    sm: "w-20 h-32",
    md: "w-28 h-44",
    lg: "w-36 h-56",
  };

  return (
    <div className={`perspective-1000 ${sizeClasses[size]} cursor-pointer`} onClick={() => { vibrate("medium"); onClick?.(); }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Back of card */}
        <div
          className={`absolute inset-0 rounded-xl border-2 backface-hidden flex items-center justify-center ${
            isSelected
              ? "border-accent shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              : "border-primary/40 hover:border-primary hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          } bg-gradient-to-br from-card via-card to-primary/10 transition-all duration-300`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <div className="text-3xl mb-1">🔮</div>
            <div className="w-8 h-8 mx-auto border border-primary/30 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border border-accent/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-xl border-2 border-accent/60 bg-gradient-to-br from-card via-card to-accent/5 p-2 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(34,211,238,0.3)]`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {card && (
            <div className={`text-center flex flex-col h-full justify-between ${isReversed ? "rotate-180" : ""}`}>
              <p className="text-[10px] text-accent/80 font-medium truncate w-full">
                {locale === "zh" ? card.nameZh : card.name}
              </p>
              <div className="text-2xl my-1">
                {card.arcana === "major" ? "✨" : getSuitEmoji(card.suit)}
              </div>
              <div className="text-[8px] text-muted-foreground leading-tight line-clamp-3 px-0.5">
                {isReversed
                  ? locale === "zh" ? card.reversedMeaningZh : card.reversedMeaning
                  : locale === "zh" ? card.uprightMeaningZh : card.uprightMeaning}
              </div>
              {isReversed && (
                <span className="text-[8px] text-highlight font-bold">↓ {locale === "zh" ? "逆位" : "Reversed"}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function getSuitEmoji(suit?: string): string {
  switch (suit) {
    case "wands": return "🪄";
    case "cups": return "🏆";
    case "swords": return "⚔️";
    case "pentacles": return "⭐";
    default: return "✨";
  }
}
