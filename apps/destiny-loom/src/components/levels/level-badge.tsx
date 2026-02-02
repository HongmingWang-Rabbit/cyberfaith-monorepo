"use client";

export interface LevelInfo {
  name: string;
  emoji: string;
  color: string;
}

const LEVEL_TIERS: LevelInfo[] = [
  { name: "Novice", emoji: "🌱", color: "#6b7280" },
  { name: "Seeker", emoji: "🔍", color: "#3b82f6" },
  { name: "Adept", emoji: "⚡", color: "#8b5cf6" },
  { name: "Mystic", emoji: "🔮", color: "#a855f7" },
  { name: "Oracle", emoji: "👁️", color: "#f59e0b" },
  { name: "Sage", emoji: "🧙", color: "#ef4444" },
  { name: "Enlightened", emoji: "✨", color: "#fbbf24" },
];

const LEVEL_THRESHOLDS = [0, 100, 500, 1500, 5000, 15000, 50000];

export function getLevelFromKarma(karma: number): LevelInfo {
  let idx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (karma >= LEVEL_THRESHOLDS[i]) { idx = i; break; }
  }
  return LEVEL_TIERS[idx];
}

export function LevelBadge({ level, size = "sm" }: { level?: LevelInfo | null; karma?: number; size?: "xs" | "sm" | "md" }) {
  if (!level) return null;

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClasses[size]}`}
      style={{ borderColor: level.color + "40", color: level.color, backgroundColor: level.color + "15" }}
    >
      <span>{level.emoji}</span>
      <span>{level.name}</span>
    </span>
  );
}

export function LevelProgressBar({ karma, progress, nextThreshold, color }: {
  karma: number;
  progress: number;
  nextThreshold: number | null;
  color: string;
}) {
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{karma.toLocaleString()} karma</span>
        {nextThreshold && <span>{nextThreshold.toLocaleString()}</span>}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
