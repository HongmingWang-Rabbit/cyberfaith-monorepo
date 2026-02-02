"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useEffect, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────── */

interface InsightsData {
  totalReadings: number;
  readingsByType: { type: string; count: number }[];
  favoriteType: string | null;
  moodDistribution: { mood: string; count: number }[];
  weeklyActivity: { week: string; count: number }[];
  moodTrend: { week: string; mood: string; count: number }[];
  pointsOverTime: { week: string; total: number }[];
  totalKarma: number;
  currentStreak: number;
  bestStreak: number;
  mostActiveDay: string | null;
}

/* ── Color maps ────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  mbti: "#a855f7",
  tarot: "#ec4899",
  zodiac: "#f59e0b",
  "i-ching": "#10b981",
  "four-pillars": "#3b82f6",
  dream: "#8b5cf6",
};

const MOOD_COLORS: Record<string, string> = {
  happy: "#22c55e",
  neutral: "#a3a3a3",
  sad: "#3b82f6",
  anxious: "#f59e0b",
  hopeful: "#a855f7",
  confused: "#ec4899",
};

const MOOD_SCORE: Record<string, number> = {
  happy: 5, hopeful: 4, neutral: 3, confused: 2, anxious: 1, sad: 0,
};

/* ── SVG Charts ────────────────────────────────────────── */

function BarChart({ data, width = 500, height = 200 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  if (data.length === 0) return <div className="text-muted-foreground text-sm text-center py-8">No data yet</div>;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(12, (width - 60) / data.length - 4);
  const chartH = height - 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = 40 + i * (barW + 4);
        const y = chartH - barH + 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill="url(#barGrad)" opacity={0.9} />
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" fontSize={8} fill="#a3a3a3">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#d4d4d8">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LineChart({ data, width = 500, height = 180 }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  if (data.length === 0) return <div className="text-muted-foreground text-sm text-center py-8">No mood data yet</div>;
  const maxVal = Math.max(...data.map(d => d.value), 5);
  const chartH = height - 40;
  const chartW = width - 60;
  const points = data.map((d, i) => ({
    x: 40 + (i / Math.max(data.length - 1, 1)) * chartW,
    y: 10 + chartH - (d.value / maxVal) * chartH,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <path d={pathD} fill="none" stroke="#a855f7" strokeWidth={2} />
      <path d={`${pathD} L ${points[points.length - 1].x} ${10 + chartH} L ${points[0].x} ${10 + chartH} Z`} fill="url(#lineGrad)" opacity={0.15} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#a855f7" stroke="#1a1a2e" strokeWidth={1.5} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={height - 4} textAnchor="middle" fontSize={7} fill="#a3a3a3">
          {d.label}
        </text>
      ))}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DonutChart({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  if (data.length === 0) return <div className="text-muted-foreground text-sm text-center py-8">No data yet</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2, cy = size / 2, r = size * 0.35, strokeW = size * 0.12;
  let cumAngle = -90;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {data.map((d, i) => {
          const angle = (d.value / total) * 360;
          const startRad = (cumAngle * Math.PI) / 180;
          const endRad = ((cumAngle + angle) * Math.PI) / 180;
          cumAngle += angle;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const largeArc = angle > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${d.color}40)` }}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight="bold" fill="#e4e4e7">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#a3a3a3">total</text>
      </svg>
      <div className="flex flex-col gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="text-foreground font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Card ────────────────────────────────────────── */

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-card/60 border border-border rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {value}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */

export default function InsightsPage() {
  const t = useTranslations("insights");
  const { session, isAuthenticated, loginWithGoogle } = useAuth();
  const token = session?.tokens?.accessToken;
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch insights:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) fetchInsights();
    else setLoading(false);
  }, [isAuthenticated, fetchInsights]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <span className="text-6xl">📊</span>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground max-w-md">{t("signInPrompt")}</p>
        <button onClick={loginWithGoogle} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
          {t("signIn")}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-4xl">📊</span>
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  // Prepare chart data
  const weekLabels = data.weeklyActivity.map(w => {
    const d = new Date(w.week);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const barData = data.weeklyActivity.map((w, i) => ({ label: weekLabels[i], value: w.count }));

  const donutData = data.readingsByType.map(r => ({
    label: r.type,
    value: r.count,
    color: TYPE_COLORS[r.type] || "#6b7280",
  }));

  // Mood trend: average mood score per week
  const moodByWeek: Record<string, { total: number; count: number }> = {};
  for (const m of data.moodTrend) {
    if (!moodByWeek[m.week]) moodByWeek[m.week] = { total: 0, count: 0 };
    moodByWeek[m.week].total += (MOOD_SCORE[m.mood] ?? 3) * m.count;
    moodByWeek[m.week].count += m.count;
  }
  const moodLineData = Object.entries(moodByWeek).map(([week, v]) => {
    const d = new Date(week);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, value: Math.round((v.total / v.count) * 10) / 10 };
  });

  // Spiritual profile
  const readingTypes = data.readingsByType.map(r => r.type);
  const dominantMood = data.moodDistribution.length > 0
    ? data.moodDistribution.reduce((a, b) => a.count > b.count ? a : b).mood
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">📊</span>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon="📖" label={t("stats.totalReadings")} value={data.totalReadings} />
        <StatCard icon="🔥" label={t("stats.currentStreak")} value={`${data.currentStreak}d`} />
        <StatCard icon="🏆" label={t("stats.bestStreak")} value={`${data.bestStreak}d`} />
        <StatCard icon="✨" label={t("stats.totalKarma")} value={data.totalKarma} />
        <StatCard icon="⭐" label={t("stats.favoriteType")} value={data.favoriteType || "—"} />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-semibold mb-3 text-foreground">{t("charts.weeklyActivity")}</h2>
          <BarChart data={barData} />
        </div>

        {/* Reading Type Breakdown */}
        <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-semibold mb-3 text-foreground">{t("charts.readingTypes")}</h2>
          <DonutChart data={donutData} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Mood Trend */}
        <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-semibold mb-3 text-foreground">{t("charts.moodTrend")}</h2>
          <LineChart data={moodLineData} />
          {data.moodDistribution.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.moodDistribution.map((m) => (
                <span key={m.mood} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MOOD_COLORS[m.mood] || "#6b7280" }} />
                  {m.mood}: {m.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Spiritual Profile */}
        <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-semibold mb-3 text-foreground">{t("spiritualProfile.title")}</h2>
          <div className="space-y-3 text-sm">
            {data.mostActiveDay && (
              <div>
                <span className="text-muted-foreground">{t("spiritualProfile.activeDay")}: </span>
                <span className="text-foreground font-medium">{data.mostActiveDay}</span>
              </div>
            )}
            {dominantMood && (
              <div>
                <span className="text-muted-foreground">{t("spiritualProfile.dominantMood")}: </span>
                <span className="text-foreground font-medium capitalize">{dominantMood}</span>
              </div>
            )}
            {readingTypes.length > 0 && (
              <div>
                <span className="text-muted-foreground">{t("spiritualProfile.exploredTypes")}: </span>
                <span className="text-foreground font-medium">{readingTypes.join(", ")}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground italic">
              {data.totalReadings >= 10
                ? t("spiritualProfile.dedicated")
                : data.totalReadings >= 3
                  ? t("spiritualProfile.growing")
                  : t("spiritualProfile.beginning")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
