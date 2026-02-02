"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ArcadeGameProps } from "../types";

interface Segment {
  label: string;
  labelZh: string;
  color: string;
  karma: number;
  special?: string;
}

const SEGMENTS: Segment[] = [
  { label: "+5 Karma", labelZh: "+5 业力", color: "#7c3aed", karma: 5 },
  { label: "+10 Karma", labelZh: "+10 业力", color: "#2563eb", karma: 10 },
  { label: "+20 Karma", labelZh: "+20 业力", color: "#059669", karma: 20 },
  { label: "+50 Karma", labelZh: "+50 业力", color: "#d97706", karma: 50 },
  { label: "2x Reading", labelZh: "双倍解读", color: "#dc2626", karma: 0, special: "double_reading" },
  { label: "Free Reading", labelZh: "免费解读", color: "#e11d48", karma: 0, special: "free_reading" },
  { label: "Mystery ✨", labelZh: "神秘祝福 ✨", color: "#8b5cf6", karma: 0, special: "mystery" },
  { label: "Try Again", labelZh: "再试一次", color: "#374151", karma: 0, special: "try_again" },
];

const SEGMENT_COUNT = SEGMENTS.length;
const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;

function hasFreeSpin(): boolean {
  if (typeof window === "undefined") return true;
  const last = localStorage.getItem("destiny-wheel-free-spin");
  return last !== new Date().toISOString().slice(0, 10);
}

function markFreeSpinUsed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("destiny-wheel-free-spin", new Date().toISOString().slice(0, 10));
}

export default function DestinyWheel({ config, balance, onBalanceChange, onPlay, isPlaying }: ArcadeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Segment | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [locale, setLocale] = useState<"en" | "zh">("en");
  const [error, setError] = useState<string | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    setLocale(window.location.pathname.includes("/zh") ? "zh" : "en");
    setIsFree(hasFreeSpin());
  }, []);

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const startAngle = i * SEGMENT_ANGLE - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;
      const seg = SEGMENTS[i];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      const label = locale === "zh" ? seg.labelZh : seg.label;
      ctx.fillText(label, radius * 0.6, 4);
      ctx.restore();
    }

    ctx.restore();

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer (top)
    ctx.beginPath();
    ctx.moveTo(center - 12, 5);
    ctx.lineTo(center + 12, 5);
    ctx.lineTo(center, 25);
    ctx.closePath();
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
  }, [rotation, locale]);

  const spinWheel = useCallback(async () => {
    if (spinning || isPlaying) return;
    setError(null);
    setResult(null);
    setShowConfetti(false);

    const cost = isFree ? 0 : (config.minBet || 10);
    if (!isFree && balance !== null && balance < cost) {
      setError(locale === "zh" ? "业力点数不足" : "Not enough karma");
      return;
    }

    const playResult = await onPlay({ free: isFree });
    let winIndex = Math.floor(Math.random() * SEGMENT_COUNT);

    if (playResult) {
      winIndex = playResult.result?.segmentIndex ?? winIndex;
      if (isFree) markFreeSpinUsed();
      setIsFree(false);
    }

    const winSegment = SEGMENTS[winIndex % SEGMENT_COUNT];
    setSpinning(true);

    // Animate spin
    const totalRotation = Math.PI * 2 * (5 + Math.random() * 3) - (winIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const duration = 4000;
    const startTime = performance.now();
    const startRot = rotation;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRot + totalRotation * eased;
      setRotation(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setResult(winSegment);

        if (playResult) {
          if (balance !== null) onBalanceChange(balance + playResult.netPoints);
        }

        // Confetti for big wins
        if (winSegment.karma >= 20 || winSegment.special === "free_reading" || winSegment.special === "mystery") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [spinning, isPlaying, isFree, config, balance, locale, rotation, onPlay, onBalanceChange]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const t = locale === "zh"
    ? { spin: "转动命运之轮", free: "🎁 免费", cost: `💰 ${config.minBet || 10} 业力`, spinning: "命运转动中..." }
    : { spin: "Spin the Wheel", free: "🎁 FREE", cost: `💰 ${config.minBet || 10} karma`, spinning: "Destiny spinning..." };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                fontSize: `${14 + Math.random() * 14}px`,
              }}
            >
              {["✨", "🌟", "💫", "⭐", "🎉", "🎊"][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Wheel */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur-xl animate-pulse" />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="relative rounded-full shadow-2xl shadow-purple-500/30"
        />
      </div>

      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={spinning || isPlaying}
        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
          spinning || isPlaying
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95"
        }`}
      >
        {spinning ? t.spinning : t.spin}
      </button>

      <p className="text-xs text-gray-500">
        {isFree ? t.free : t.cost}
      </p>

      {/* Result */}
      {result && (
        <div className="w-full max-w-sm animate-fade-in">
          <div className="p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-gray-950/60 text-center">
            <p className="text-2xl font-bold text-white mb-2">
              {locale === "zh" ? result.labelZh : result.label}
            </p>
            {result.karma > 0 && (
              <p className="text-purple-300">
                {locale === "zh" ? `获得 ${result.karma} 业力点数!` : `You won ${result.karma} karma points!`}
              </p>
            )}
            {result.special === "free_reading" && (
              <p className="text-pink-300">🎴 {locale === "zh" ? "获得免费高级解读!" : "You won a free premium reading!"}</p>
            )}
            {result.special === "double_reading" && (
              <p className="text-red-300">⚡ {locale === "zh" ? "下次解读双倍积分!" : "Double points on your next reading!"}</p>
            )}
            {result.special === "mystery" && (
              <p className="text-violet-300">🔮 {locale === "zh" ? "神秘祝福已降临..." : "A mystery blessing descends..."}</p>
            )}
            {result.special === "try_again" && (
              <p className="text-gray-400">{locale === "zh" ? "命运说：再试一次!" : "Destiny says: try again!"}</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
