"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";

const SYMBOLS = ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"];
const SPIN_COST = 10;

interface SpinResultData {
  reels: string[];
  matches: number;
  pointsWon: number;
}

export default function KarmaSlotsPage() {
  const [reels, setReels] = useState(["🔮", "☯️", "🌟"]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResultData | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const particleTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Fetch balance on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/arcade/history?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      // Get points
      fetch(
        `${process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:4000"}/points/me`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBalance(d.data.total);
        })
        .catch(() => {});
    }
  }, []);

  const handleSpin = useCallback(async () => {
    if (spinning) return;
    setError(null);
    setLastResult(null);
    setShowParticles(false);
    setSpinning(true);
    setSpinKey((k) => k + 1);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in to play");
      setSpinning(false);
      return;
    }

    try {
      const res = await fetch("/api/arcade/play", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId: "karma-slots" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || data.error || "Spin failed");
        setSpinning(false);
        return;
      }

      const result: SpinResultData = data.data.result;

      // Animate reels for 1.5s then show result
      await new Promise((r) => setTimeout(r, 1500));

      setReels(result.reels);
      setLastResult(result);
      setSpinning(false);

      // Update balance
      if (balance !== null) {
        setBalance(balance - SPIN_COST + result.pointsWon);
      }

      // Particles on win
      if (result.pointsWon > 0) {
        setShowParticles(true);
        if (particleTimeout.current) clearTimeout(particleTimeout.current);
        particleTimeout.current = setTimeout(() => setShowParticles(false), 3000);
      }
    } catch {
      setError("Network error — try again");
      setSpinning(false);
    }
  }, [spinning, balance]);

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
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
              {SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/arcade"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          ← Back to Arcade
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            🎰 Karma Slots
          </h1>
          <p className="text-gray-400">
            Spin the cosmic reels • {SPIN_COST} pts per spin
          </p>
          {balance !== null && (
            <p className="text-cyan-400 mt-1 font-semibold">
              Balance: {balance} pts
            </p>
          )}
        </div>

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
                    spinning
                      ? "border-cyan-500/30 bg-gray-800/80"
                      : lastResult && lastResult.matches >= 2 && reels.filter((s) => s === symbol).length >= 2
                        ? "border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/30"
                        : "border-gray-600 bg-gray-800/60"
                  }`}
                >
                  {spinning ? (
                    <div
                      className="animate-reel-spin"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((s, j) => (
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

            {/* Payout info */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-6 px-2">
              <div className="flex justify-between">
                <span>3 Match</span>
                <span className="text-cyan-400 font-bold">+50 pts</span>
              </div>
              <div className="flex justify-between">
                <span>2 Match</span>
                <span className="text-purple-400 font-bold">+20 pts</span>
              </div>
            </div>

            {/* Spin button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 ${
                spinning
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 active:scale-[0.98]"
              }`}
            >
              {spinning ? "Spinning..." : `Spin • ${SPIN_COST} pts`}
            </button>
          </div>

          {/* Neon glow under machine */}
          <div className="absolute -bottom-2 left-8 right-8 h-4 bg-cyan-500/20 blur-xl rounded-full" />
        </div>

        {/* Result display */}
        {lastResult && !spinning && (
          <div
            className={`text-center p-4 rounded-xl border mb-6 animate-fade-in ${
              lastResult.pointsWon > 0
                ? "border-cyan-500/50 bg-cyan-950/30"
                : "border-gray-700 bg-gray-900/50"
            }`}
          >
            {lastResult.matches === 3 ? (
              <div>
                <p className="text-2xl font-bold text-cyan-400 mb-1">
                  ✨ COSMIC JACKPOT! ✨
                </p>
                <p className="text-cyan-300">
                  Triple match! You won <strong>+50 pts</strong>
                </p>
              </div>
            ) : lastResult.matches === 2 ? (
              <div>
                <p className="text-xl font-bold text-purple-400 mb-1">
                  🌟 Nice Match!
                </p>
                <p className="text-purple-300">
                  Double match! You won <strong>+20 pts</strong>
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

        {/* Error */}
        {error && (
          <div className="text-center p-3 rounded-xl border border-red-500/50 bg-red-950/30 text-red-400 mb-6">
            {error}
          </div>
        )}
      </div>

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
