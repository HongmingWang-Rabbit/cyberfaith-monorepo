"use client";

import { useState, useCallback, useRef } from "react";
import { t } from "@/lib/i18n";

interface Segment {
  label: string;
  color: string;
  reward: { type: string; amount?: number; description: string };
}

const DEFAULT_SEGMENTS: Segment[] = [
  { label: "5 Karma", color: "#8B5CF6", reward: { type: "karma", amount: 5, description: "+5 Karma Points" } },
  { label: "10 Karma", color: "#06B6D4", reward: { type: "karma", amount: 10, description: "+10 Karma Points" } },
  { label: "25 Karma", color: "#F59E0B", reward: { type: "karma", amount: 25, description: "+25 Karma Points" } },
  { label: "50 Karma", color: "#EF4444", reward: { type: "karma", amount: 50, description: "+50 Karma Points" } },
  { label: "Cosmic Blessing", color: "#EC4899", reward: { type: "badge", description: "Cosmic Blessing badge" } },
  { label: "Wisdom Boost", color: "#10B981", reward: { type: "karma", amount: 15, description: "+15 Karma" } },
  { label: "Lucky Star", color: "#3B82F6", reward: { type: "karma", amount: 8, description: "+8 Karma" } },
  { label: "Zen Master", color: "#6366F1", reward: { type: "karma", amount: 100, description: "+100 Karma JACKPOT!" } },
];

type WheelState = "idle" | "spinning" | "result" | "limit";

export function DestinyWheel() {
  const [state, setState] = useState<WheelState>("idle");
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ segment: string; reward: Segment["reward"]; pointsEarned: number } | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const segments = DEFAULT_SEGMENTS;
  const segCount = segments.length;
  const segAngle = 360 / segCount;

  const spin = useCallback(async () => {
    setState("spinning");
    try {
      const res = await fetch("/api/arcade/destiny-wheel/spin", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "DAILY_LIMIT_REACHED") {
          setState("limit");
          return;
        }
        throw new Error(json.message);
      }

      const { segmentIndex, segment, reward, pointsEarned } = json.data;

      // Calculate rotation to land on the correct segment
      // Spin 5+ full rotations + land on the segment
      const targetAngle = 360 - (segmentIndex * segAngle + segAngle / 2);
      const fullSpins = 5 * 360;
      const newRotation = rotation + fullSpins + targetAngle - (rotation % 360);

      setRotation(newRotation);
      setResult({ segment, reward, pointsEarned });

      // Wait for spin animation to complete
      setTimeout(() => {
        setState("result");
      }, 4000);
    } catch {
      setState("idle");
    }
  }, [rotation, segAngle]);

  // Build SVG pie segments
  const buildSegmentPath = (index: number) => {
    const startAngle = (index * segAngle * Math.PI) / 180;
    const endAngle = ((index + 1) * segAngle * Math.PI) / 180;
    const r = 150;
    const cx = 160, cy = 160;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = segAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getLabelPos = (index: number) => {
    const midAngle = ((index + 0.5) * segAngle * Math.PI) / 180;
    const r = 100;
    return {
      x: 160 + r * Math.cos(midAngle),
      y: 160 + r * Math.sin(midAngle),
    };
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <h2 className="text-3xl font-bold text-purple-400">{t("destinyWheel.title")}</h2>
      <p className="text-muted-foreground">{t("destinyWheel.subtitle")}</p>

      {/* Wheel */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl">▼</div>

        <svg
          ref={wheelRef}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: state === "spinning" ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          {segments.map((seg, i) => (
            <g key={i}>
              <path d={buildSegmentPath(i)} fill={seg.color} stroke="#1a1a2e" strokeWidth="2" />
              <text
                x={getLabelPos(i).x}
                y={getLabelPos(i).y}
                fill="white"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${(i + 0.5) * segAngle}, ${getLabelPos(i).x}, ${getLabelPos(i).y})`}
              >
                {seg.label}
              </text>
            </g>
          ))}
          {/* Center circle */}
          <circle cx="160" cy="160" r="20" fill="#1a1a2e" stroke="#8B5CF6" strokeWidth="3" />
          <text x="160" y="160" fill="#8B5CF6" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">☯</text>
        </svg>
      </div>

      {/* Actions */}
      {state === "idle" && (
        <button
          onClick={spin}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-full
            hover:from-purple-400 hover:to-indigo-400 transition-all shadow-lg hover:shadow-purple-500/25"
        >
          🎡 {t("destinyWheel.spin")}
        </button>
      )}

      {state === "spinning" && (
        <div className="text-purple-400 animate-pulse text-lg">{t("destinyWheel.spinning")}</div>
      )}

      {state === "result" && result && (
        <div className="text-center space-y-3 animate-fadeIn">
          <div className="text-2xl font-bold text-yellow-400">🎉 {result.segment}</div>
          <div className="text-lg">{result.reward.description}</div>
          {result.pointsEarned > 0 && (
            <div className="text-green-400 font-bold">{t("destinyWheel.earned", { points: result.pointsEarned })}</div>
          )}
          <p className="text-muted-foreground text-sm">{t("destinyWheel.comeBack")}</p>
        </div>
      )}

      {state === "limit" && (
        <div className="text-center space-y-2">
          <div className="text-yellow-400">{t("destinyWheel.alreadySpun")}</div>
          <p className="text-muted-foreground text-sm">{t("destinyWheel.comeBack")}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
