'use client';

import { useState, useCallback } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import { MintReadingButton } from "@/components/wallet";
import type { ArcadeGameProps } from "../types";

interface Rune {
  symbol: string;
  name: string;
  meaning: string;
  keywords: string[];
  reversed?: boolean;
}

const ELDER_FUTHARK: Rune[] = [
  { symbol: 'ᚠ', name: 'Fehu', meaning: 'Wealth flows to you. Material abundance and prosperity await.', keywords: ['wealth', 'abundance', 'luck'] },
  { symbol: 'ᚢ', name: 'Uruz', meaning: 'Raw strength awakens. Vitality and physical power surge through you.', keywords: ['strength', 'health', 'vitality'] },
  { symbol: 'ᚦ', name: 'Thurisaz', meaning: 'Protection surrounds you. The giants guard your path.', keywords: ['protection', 'defense', 'boundaries'] },
  { symbol: 'ᚨ', name: 'Ansuz', meaning: 'Divine wisdom speaks. Messages from the gods arrive.', keywords: ['wisdom', 'communication', 'signals'] },
  { symbol: 'ᚱ', name: 'Raidho', meaning: 'The journey begins. Travel and movement bring transformation.', keywords: ['journey', 'travel', 'progress'] },
  { symbol: 'ᚲ', name: 'Kenaz', meaning: 'The torch illuminates. Knowledge and creativity ignite.', keywords: ['knowledge', 'creativity', 'passion'] },
  { symbol: 'ᚷ', name: 'Gebo', meaning: 'Gifts are exchanged. Partnerships and generosity flourish.', keywords: ['gifts', 'partnership', 'balance'] },
  { symbol: 'ᚹ', name: 'Wunjo', meaning: 'Joy overflows. Happiness and harmony manifest.', keywords: ['joy', 'happiness', 'harmony'] },
  { symbol: 'ᚺ', name: 'Hagalaz', meaning: 'The storm clears. Disruption leads to transformation.', keywords: ['change', 'disruption', 'awakening'] },
  { symbol: 'ᚾ', name: 'Nauthiz', meaning: 'Necessity teaches. Constraints reveal hidden strength.', keywords: ['need', 'constraint', 'resistance'] },
  { symbol: 'ᛁ', name: 'Isa', meaning: 'Stillness descends. Patience and reflection are required.', keywords: ['ice', 'stillness', 'patience'] },
  { symbol: 'ᛃ', name: 'Jera', meaning: 'The harvest comes. Cycles complete and rewards manifest.', keywords: ['harvest', 'cycles', 'reward'] },
  { symbol: 'ᛇ', name: 'Eihwaz', meaning: 'The yew stands eternal. Endurance and reliability prevail.', keywords: ['endurance', 'reliability', 'defense'] },
  { symbol: 'ᛈ', name: 'Perthro', meaning: 'Fate reveals itself. Hidden things come to light.', keywords: ['fate', 'mystery', 'secrets'] },
  { symbol: 'ᛉ', name: 'Algiz', meaning: 'The elk sedge protects. Divine protection shields you.', keywords: ['protection', 'guardian', 'sanctuary'] },
  { symbol: 'ᛊ', name: 'Sowilo', meaning: 'The sun rises. Success, honor, and life force strengthen.', keywords: ['sun', 'success', 'vitality'] },
  { symbol: 'ᛏ', name: 'Tiwaz', meaning: 'Victory beckons. Justice and honor guide your actions.', keywords: ['victory', 'justice', 'honor'] },
  { symbol: 'ᛒ', name: 'Berkano', meaning: 'New life stirs. Birth, growth, and fertility bless you.', keywords: ['birth', 'growth', 'fertility'] },
  { symbol: 'ᛖ', name: 'Ehwaz', meaning: 'The horse carries you. Trust and partnership advance.', keywords: ['horse', 'partnership', 'trust'] },
  { symbol: 'ᛗ', name: 'Mannaz', meaning: 'Humanity unites. Self-knowledge and cooperation emerge.', keywords: ['humanity', 'self', 'cooperation'] },
  { symbol: 'ᛚ', name: 'Laguz', meaning: 'Waters flow deep. Intuition and the unconscious guide.', keywords: ['water', 'intuition', 'flow'] },
  { symbol: 'ᛜ', name: 'Ingwaz', meaning: 'The seed germinates. Internal growth precedes external.', keywords: ['seed', 'potential', 'gestation'] },
  { symbol: 'ᛟ', name: 'Othala', meaning: 'Ancestral wisdom calls. Heritage and inheritance support.', keywords: ['heritage', 'ancestry', 'home'] },
  { symbol: 'ᛞ', name: 'Dagaz', meaning: 'Dawn breaks. Breakthrough and clarity illuminate.', keywords: ['dawn', 'breakthrough', 'clarity'] },
];

export function RuneCastGame({ config }: ArcadeGameProps) {
  const [runes, setRunes] = useState<(Rune & { reversed: boolean })[] | null>(null);
  const [casting, setCasting] = useState(false);
  const [castCount, setCastCount] = useState<1 | 3>(1);
  const haptic = useHaptic();
  const locale = (config?.locale as string) || 'en';

  const castRunes = useCallback(() => {
    setCasting(true);
    haptic.vibrate('heavy');

    // Animate for 1.5 seconds
    setTimeout(() => {
      const drawn: (Rune & { reversed: boolean })[] = [];
      const available = [...ELDER_FUTHARK];
      
      for (let i = 0; i < castCount; i++) {
        const idx = Math.floor(Math.random() * available.length);
        const rune = available.splice(idx, 1)[0];
        const reversed = Math.random() < 0.3; // 30% chance reversed
        drawn.push({ ...rune, reversed });
      }

      setRunes(drawn);
      setCasting(false);
      haptic.vibrate('success');
    }, 1500);
  }, [castCount, haptic]);

  const reset = () => {
    setRunes(null);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Rune bag */}
      <div className="relative">
        <div 
          className={`
            w-32 h-40 rounded-2xl bg-gradient-to-b from-amber-900 to-amber-950
            border-2 border-amber-700 shadow-2xl flex items-center justify-center
            ${casting ? 'animate-shake' : ''}
          `}
        >
          <span className="text-6xl text-amber-200/30">ᚱ</span>
        </div>
        {casting && (
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-amber-400/50 rounded-2xl animate-pulse" />
        )}
      </div>

      {/* Cast count selector */}
      {!runes && !casting && (
        <div className="flex gap-2">
          <button
            onClick={() => setCastCount(1)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              castCount === 1 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/50'
            }`}
          >
            {locale === "zh" ? "单符文" : "Single Rune"}
          </button>
          <button
            onClick={() => setCastCount(3)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              castCount === 3 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-900/50 text-amber-300 hover:bg-amber-800/50'
            }`}
          >
            {locale === "zh" ? "三符文" : "Three Runes"}
          </button>
        </div>
      )}

      {/* Cast button */}
      {!runes && !casting && (
        <button
          onClick={castRunes}
          className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95"
        >
          {locale === "zh" ? "投掷符文" : "Cast Runes"} 🎲
        </button>
      )}

      {/* Casting animation */}
      {casting && (
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">🎲</div>
          <p className="text-amber-400 animate-pulse">
            {locale === "zh" ? "符文正在揭示..." : "The runes are revealing..."}
          </p>
        </div>
      )}

      {/* Results */}
      {runes && (
        <div className="w-full max-w-md space-y-4">
          {/* Rune display */}
          <div className={`flex justify-center gap-4 ${runes.length === 1 ? '' : 'flex-wrap'}`}>
            {runes.map((rune, idx) => (
              <div
                key={idx}
                className={`
                  w-24 h-32 rounded-xl bg-gradient-to-b from-stone-700 to-stone-800
                  border-2 border-stone-600 shadow-xl flex flex-col items-center justify-center
                  ${rune.reversed ? 'rotate-180' : ''}
                `}
              >
                <span className="text-5xl text-amber-300">{rune.symbol}</span>
              </div>
            ))}
          </div>

          {/* Meanings */}
          <div className="space-y-3">
            {runes.map((rune, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-stone-900/50 border border-stone-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl text-amber-400">{rune.symbol}</span>
                  <span className="font-bold text-amber-300">{rune.name}</span>
                  {rune.reversed && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-300">
                      Reversed
                    </span>
                  )}
                  {runes.length === 3 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-stone-700 text-stone-300 ml-auto">
                      {idx === 0 ? 'Past' : idx === 1 ? 'Present' : 'Future'}
                    </span>
                  )}
                </div>
                <p className="text-stone-300 text-sm">
                  {rune.reversed 
                    ? `(Reversed) The energy of ${rune.name} is blocked or internalized.`
                    : rune.meaning
                  }
                </p>
                <div className="flex gap-1 mt-2">
                  {rune.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={reset}
              className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
            >
              {locale === "zh" ? "再投一次" : "Cast Again"}
            </button>
            <MintReadingButton
              type="tarot"
              title={`Rune Cast: ${runes.map(r => r.name).join(', ')}`}
              description={runes.map(r => `${r.name}${r.reversed ? ' (R)' : ''}: ${r.meaning}`).join(' | ')}
              data={{ 
                runes: runes.map(r => ({ name: r.name, symbol: r.symbol, reversed: r.reversed })),
                game: "rune-cast",
                castCount,
              }}
              className="scale-90"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default RuneCastGame;
