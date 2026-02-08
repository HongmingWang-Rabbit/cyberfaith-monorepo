'use client';

import { useState, useCallback } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { MintReadingButton } from "@/components/wallet";
import type { ArcadeGameProps } from "../types";

const VISIONS = [
  { category: 'love', visions: [
    "A heart opens where you least expect it",
    "Someone from your past returns with new intentions",
    "Love blooms in unexpected places",
    "A deep connection awaits across the distance",
    "The one who sees you clearly draws near",
  ]},
  { category: 'wealth', visions: [
    "Gold flows from a new source",
    "An opportunity multiplies your fortune",
    "Patience with investments brings reward",
    "A gift arrives when you release expectations",
    "Your skills attract abundance",
  ]},
  { category: 'career', visions: [
    "A door opens that cannot be closed",
    "Recognition comes from unexpected quarters",
    "Your true calling reveals itself",
    "Leadership awaits those who step forward",
    "A collaboration changes everything",
  ]},
  { category: 'health', visions: [
    "Vitality returns with the changing season",
    "A simple change brings profound healing",
    "Listen to the body's whispers",
    "Rest now to run faster later",
    "Nature holds the remedy you seek",
  ]},
  { category: 'spiritual', visions: [
    "The veil thins — pay attention to signs",
    "Your guides speak through synchronicity",
    "A spiritual teacher appears in disguise",
    "Trust the path even when it curves",
    "Your intuition sharpens to a fine point",
  ]},
  { category: 'mystery', visions: [
    "What is hidden will be revealed",
    "The answer comes in dreams",
    "Look beyond the obvious",
    "Time bends to show you truth",
    "The mists part for those who wait",
  ]},
];

const CATEGORY_ICONS: Record<string, string> = {
  love: '💕',
  wealth: '💰',
  career: '⭐',
  health: '🌿',
  spiritual: '🔮',
  mystery: '🌙',
};

export function CrystalBallGame({ config }: ArcadeGameProps) {
  const [vision, setVision] = useState<{ text: string; category: string } | null>(null);
  const [gazing, setGazing] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const haptic = useHaptic();
  const locale = (config?.locale as string) || 'en';

  const gaze = useCallback(() => {
    setGazing(true);
    setGlowIntensity(0);
    haptic.vibrate('medium');

    // Build up the glow
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        if (prev >= 100) {
          clearInterval(glowInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Reveal vision after 2 seconds
    setTimeout(() => {
      clearInterval(glowInterval);
      setGlowIntensity(100);

      const categoryIdx = Math.floor(Math.random() * VISIONS.length);
      const category = VISIONS[categoryIdx];
      const visionIdx = Math.floor(Math.random() * category.visions.length);
      
      setVision({
        text: category.visions[visionIdx],
        category: category.category,
      });
      setGazing(false);
      haptic.vibrate('success');
    }, 2000);
  }, [haptic]);

  const reset = () => {
    setVision(null);
    setGlowIntensity(0);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Crystal ball */}
      <div className="relative">
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full blur-xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, rgba(147, 51, 234, ${glowIntensity / 200}) 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Ball */}
        <div 
          className={`
            w-48 h-48 rounded-full relative overflow-hidden
            bg-gradient-to-br from-purple-900/80 via-indigo-800/60 to-purple-900/80
            border border-purple-400/30 shadow-2xl
            ${gazing ? 'animate-pulse' : ''}
          `}
          style={{
            boxShadow: `
              inset 0 0 60px rgba(147, 51, 234, 0.3),
              0 0 ${20 + glowIntensity / 2}px rgba(147, 51, 234, ${glowIntensity / 100})
            `,
          }}
        >
          {/* Inner mist */}
          <div 
            className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent"
            style={{
              animation: gazing ? 'swirl 2s ease-in-out infinite' : 'none',
            }}
          />
          
          {/* Highlight */}
          <div className="absolute top-4 left-8 w-12 h-8 rounded-full bg-white/20 blur-md" />
          
          {/* Vision text (when revealed) */}
          {vision && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-center text-purple-200 text-sm font-medium animate-fade-in">
                {vision.text}
              </p>
            </div>
          )}
        </div>

        {/* Base */}
        <div className="w-32 h-8 mx-auto -mt-2 rounded-b-full bg-gradient-to-b from-purple-900 to-purple-950 border-x border-b border-purple-700" />
      </div>

      {/* Gaze button */}
      {!vision && !gazing && (
        <button
          onClick={gaze}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95"
        >
          {locale === "zh" ? "凝视水晶球" : "Gaze Into the Crystal"} 👁️
        </button>
      )}

      {/* Gazing message */}
      {gazing && (
        <div className="text-center">
          <p className="text-purple-300 animate-pulse">
            {locale === "zh" ? "雾气凝聚..." : "The mists gather..."}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400"
                style={{
                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vision result */}
      {vision && (
        <div className="w-full max-w-sm space-y-4">
          {/* Category badge */}
          <div className="flex justify-center">
            <span className="px-4 py-1 rounded-full bg-purple-900/50 border border-purple-700 text-purple-300 text-sm">
              {CATEGORY_ICONS[vision.category]} {vision.category.charAt(0).toUpperCase() + vision.category.slice(1)}
            </span>
          </div>

          {/* Vision card */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-purple-900/50 to-indigo-900/50 border border-purple-700/50">
            <p className="text-center text-lg text-purple-100 font-medium italic">
              "{vision.text}"
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={reset}
              className="px-6 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {locale === "zh" ? "再看一次" : "Gaze Again"}
            </button>
            <MintReadingButton
              type="tarot"
              title={`Crystal Ball: ${vision.category}`}
              description={vision.text}
              data={{ 
                vision: vision.text,
                category: vision.category,
                game: "crystal-ball",
              }}
              className="scale-90"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes swirl {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default CrystalBallGame;
