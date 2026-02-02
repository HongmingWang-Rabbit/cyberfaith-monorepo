"use client";

import { useState, useRef, useCallback } from "react";
import { useHaptic } from "@/hooks/useHaptic";
import type { ArcadeGameProps } from "../types";

const DEFAULT_SYMBOLS = ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"];

export default function KarmaSlots({ config, balance, onBalanceChange, onPlay, isPlaying }: ArcadeGameProps) {
  const { vibrate } = useHaptic();
  const symbols: string[] = config.symbols || DEFAULT_SYMBOLS;
  const reelCount: number = config.reelCount || 3;
  const payoutRules = config.payoutRules || { threeMatch: 50, twoMatch: 20 };
  const cost = config.minBet;

  const [reels, setReels] = useState<string[]>(symbols.slice(0, reelCount));
  const [lastResult, setLastResult] = useState<{ reels: string[]; matches: number; pointsWon: number } | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const particleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpin = useCallback(async () => {
    vibrate("medium");
    if (isPlaying) return;
    setError(null);
    setLastResult(null);
    setShowParticles(false);

    const playResult = await onPlay(undefined);
    if (!playResult) {
      setError("Spin failed — try again");
      return;
    }

    const outcome = playResult.result;
    setReels(outcome.reels);
    setLastResult({ reels: outcome.reels, matches: outcome.matches, pointsWon: outcome.pointsWon });

    if (balance !== null) {
      onBalanceChange(balance + playResult.netPoints);
    }

    if (playResult.pointsWon > 0) {
      setShowParticles(true);
      if (particleTimeout.current) clearTimeout(particleTimeout.current);
      particleTimeout.current = setTimeout(() => setShowParticles(false), 3000);
    }
  }, [isPlaying, onPlay, balance, onBalanceChange]);

  return (
    <div className="relative">
      {/* Particle effects on win */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                fontSize: `${12 + Math.random() * 20}px`,
              }}
            >
              {symbols[Math.floor(Math.random() * symbols.length)]}
            </div>
          ))}
        </div>
      )}

      {/* Slot Machine */}
      <div className="relative mx-auto mb-8">
        {/* Machine frame */}
        <div className="relative rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-gray-900 to-gray-950 p-8 shadow-2xl shadow-cyan-500/10">
          {/* Neon top bar */}
          <div className="absolute -top-px left-4 right-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />

          {/* Reels container */}
          <div className="flex justify-center gap-4 mb-6">
            {reels.map((symbol, i) => (
              <div
                key={i}
                className={`relative w-24 h-28 rounded-xl border-2 flex items-center justify-center text-5xl overflow-hidden ${
                  isPlaying
                    ? "border-cyan-500/30 bg-gray-800/80"
                    : lastResult && lastResult.matches >= 2 && reels.filter((s) => s === symbol).length >= 2
                      ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/30"
                      : "border-gray-600 bg-gray-800/60"
                }`}
              >
                {isPlaying ? (
                  <div
                    className="animate-reel-spin"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      {[...symbols, ...symbols, ...symbols].map((s, j) => (
                        <span key={j} className="text-5xl leading-none block h-12">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span
                    className={`transition-all duration-300 ${
                      lastResult && lastResult.pointsWon > 0
                        ? "animate-symbol-glow scale-110"
                        : ""
                    }`}
                  >
                    {symbol}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Payout info — driven by config */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-6 px-2">
            <div className="flex justify-between">
              <span>{reelCount} Match</span>
              <span className="text-cyan-400 font-bold">+{payoutRules.threeMatch} pts</span>
            </div>
            <div className="flex justify-between">
              <span>2 Match</span>
              <span className="text-purple-400 font-bold">+{payoutRules.twoMatch} pts</span>
            </div>
          </div>

          {/* Spin button */}
          <button
            onClick={handleSpin}
            disabled={isPlaying}
            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 ${
              isPlaying
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-[0.98]"
            }`}
          >
            {isPlaying ? "Spinning..." : `Spin • ${cost} pts`}
          </button>
        </div>

        {/* Neon glow under machine */}
        <div className="absolute -bottom-2 left-8 right-8 h-4 bg-cyan-500/20 blur-xl rounded-full" />
      </div>

      {/* Result display */}
      {lastResult && !isPlaying && (
        <div
          className={`text-center p-4 rounded-xl border mb-6 animate-fade-in ${
            lastResult.pointsWon > 0
              ? "border-cyan-500/50 bg-cyan-950/30"
              : "border-gray-700 bg-gray-900/50"
          }`}
        >
          {lastResult.matches === reelCount ? (
            <div>
              <p className="text-2xl font-bold text-cyan-400 mb-1">✨ COSMIC JACKPOT! ✨</p>
              <p className="text-cyan-300">
                Triple match! You won <strong>+{payoutRules.threeMatch} pts</strong>
              </p>
            </div>
          ) : lastResult.matches === 2 ? (
            <div>
              <p className="text-xl font-bold text-purple-400 mb-1">🌟 Nice Match!</p>
              <p className="text-purple-300">
                Double match! You won <strong>+{payoutRules.twoMatch} pts</strong>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-400">
                No match this time. The cosmos will align next spin! 🌙
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-center p-3 rounded-xl border border-red-500/50 bg-red-950/30 text-red-400 mb-6">
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes reelSpin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-66.67%); }
        }
        .animate-reel-spin {
          animation: reelSpin 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        @keyframes symbolGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.4)); }
          50% { filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.8)); transform: scale(1.15); }
        }
        .animate-symbol-glow {
          animation: symbolGlow 1s ease-in-out infinite;
        }
        @keyframes particle {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-200px) scale(0.3) rotate(180deg); }
        }
        .animate-particle {
          animation: particle 2s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
