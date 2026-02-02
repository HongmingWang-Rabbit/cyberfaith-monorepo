"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────── */

interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  interpretation: string;
}

interface BirthChartData {
  input: { date: string; time: string; location: string };
  planets: PlanetPosition[];
  houses: number[];
  dominantElement: string;
  dominantModality: string;
}

/* ── Constants ─────────────────────────────────────────── */

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Rising: "↑",
};

const SIGN_ORDER = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const NEON_COLORS = {
  primary: "#a855f7",
  secondary: "#ec4899",
  accent: "#06b6d4",
  gold: "#f59e0b",
  ring: "#6d28d9",
  house: "#312e81",
  bg: "#0a0a1a",
};

/* ── Birth Chart Wheel SVG ─────────────────────────────── */

function BirthChartWheel({ data }: { data: BirthChartData }) {
  const size = 500;
  const cx = size / 2, cy = size / 2;
  const outerR = 220, signR = 195, innerR = 170, houseR = 80;

  // Sign positions on outer ring
  const signElements = SIGN_ORDER.map((sign, i) => {
    const startAngle = (i * 30 - 90) * Math.PI / 180;
    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;

    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle);
    const y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(startAngle);
    const y1i = cy + innerR * Math.sin(startAngle);

    const textX = cx + signR * Math.cos(midAngle);
    const textY = cy + signR * Math.sin(midAngle);

    return (
      <g key={sign}>
        {/* Divider line */}
        <line x1={x1i} y1={y1i} x2={x1o} y2={y1o} stroke={NEON_COLORS.ring} strokeWidth={0.5} opacity={0.5} />
        {/* Sign glyph */}
        <text x={textX} y={textY} textAnchor="middle" dominantBaseline="central" fontSize={16} fill={NEON_COLORS.primary}
          style={{ filter: `drop-shadow(0 0 4px ${NEON_COLORS.primary})` }}>
          {ZODIAC_GLYPHS[sign]}
        </text>
      </g>
    );
  });

  // House lines
  const houseElements = data.houses.map((deg, i) => {
    const angle = (deg - 90) * Math.PI / 180;
    const x1 = cx + houseR * Math.cos(angle);
    const y1 = cy + houseR * Math.sin(angle);
    const x2 = cx + innerR * Math.cos(angle);
    const y2 = cy + innerR * Math.sin(angle);
    const labelR = houseR - 14;
    const midAngle = ((deg + 15) - 90) * Math.PI / 180;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return (
      <g key={`house-${i}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={NEON_COLORS.house} strokeWidth={1} opacity={0.6} />
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="#6b7280">{i + 1}</text>
      </g>
    );
  });

  // Planet positions
  const planetElements = data.planets.map((p, i) => {
    const signIdx = SIGN_ORDER.indexOf(p.sign);
    const totalDeg = signIdx * 30 + p.degree;
    const angle = (totalDeg - 90) * Math.PI / 180;
    const planetR = innerR - 30 - (i % 2) * 20; // stagger to avoid overlap
    const px = cx + planetR * Math.cos(angle);
    const py = cy + planetR * Math.sin(angle);

    return (
      <g key={p.planet}>
        {/* Connection line */}
        <line x1={cx + (innerR - 5) * Math.cos(angle)} y1={cy + (innerR - 5) * Math.sin(angle)}
          x2={px} y2={py} stroke={NEON_COLORS.accent} strokeWidth={0.5} opacity={0.3} />
        {/* Planet glyph */}
        <circle cx={px} cy={py} r={12} fill={NEON_COLORS.bg} stroke={NEON_COLORS.accent} strokeWidth={1}
          style={{ filter: `drop-shadow(0 0 6px ${NEON_COLORS.accent}40)` }} />
        <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={NEON_COLORS.accent}
          style={{ filter: `drop-shadow(0 0 3px ${NEON_COLORS.accent})` }}>
          {PLANET_GLYPHS[p.planet] || "?"}
        </text>
      </g>
    );
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-lg mx-auto" id="birth-chart-svg">
      {/* Background glow */}
      <defs>
        <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={NEON_COLORS.primary} stopOpacity={0.05} />
          <stop offset="70%" stopColor={NEON_COLORS.primary} stopOpacity={0.02} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={outerR + 10} fill="url(#chartGlow)" />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={NEON_COLORS.primary} strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 8px ${NEON_COLORS.primary}60)` }} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={NEON_COLORS.ring} strokeWidth={1} opacity={0.6} />
      <circle cx={cx} cy={cy} r={houseR} fill="none" stroke={NEON_COLORS.ring} strokeWidth={0.5} opacity={0.4} />

      {signElements}
      {houseElements}
      {planetElements}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill={NEON_COLORS.secondary}
        style={{ filter: `drop-shadow(0 0 6px ${NEON_COLORS.secondary})` }} />
    </svg>
  );
}

/* ── Planet Table ───────────────────────────────────────── */

function PlanetTable({ planets, t }: { planets: PlanetPosition[]; t: (key: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 px-3 text-muted-foreground font-medium">{t("table.planet")}</th>
            <th className="py-2 px-3 text-muted-foreground font-medium">{t("table.sign")}</th>
            <th className="py-2 px-3 text-muted-foreground font-medium">{t("table.degree")}</th>
            <th className="py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t("table.interpretation")}</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p) => (
            <tr key={p.planet} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 px-3 font-medium">
                <span className="mr-1.5">{PLANET_GLYPHS[p.planet]}</span>
                {p.planet}
              </td>
              <td className="py-2.5 px-3">
                <span className="mr-1">{ZODIAC_GLYPHS[p.sign]}</span>
                {p.sign}
              </td>
              <td className="py-2.5 px-3 text-muted-foreground">{p.degree}°</td>
              <td className="py-2.5 px-3 text-muted-foreground text-xs hidden md:table-cell">{p.interpretation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Share Button ───────────────────────────────────────── */

function ShareButton({ t }: { t: (key: string) => string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Try to convert SVG to image
    const svg = document.getElementById("birth-chart-svg");
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, 1000, 1000);

      const img = new Image();
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = async () => {
        ctx.drawImage(img, 0, 0, 1000, 1000);
        URL.revokeObjectURL(url);

        try {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = "birth-chart.png";
          link.href = dataUrl;
          link.click();
        } catch {
          // Fallback: copy URL
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      };
      img.src = url;
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <button
      onClick={handleShare}
      className="px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm"
    >
      {copied ? "✓ Copied!" : `📤 ${t("share")}`}
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────── */

export default function BirthChartPage() {
  const t = useTranslations("birthChart");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [chart, setChart] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ date, time, location });
      const res = await fetch(`/api/birth-chart?${params}`);
      if (!res.ok) throw new Error("Failed to calculate");
      const json = await res.json();
      setChart(json.data);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [date, time, location, t]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🌌</span>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("form.date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("form.time")}</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("form.location")}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("form.locationPlaceholder")}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !date}
            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? t("calculating") : t("calculate")}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </form>

      {/* Results */}
      {chart && (
        <>
          {/* Wheel */}
          <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">{t("wheel.title")}</h2>
              <ShareButton t={t} />
            </div>
            <BirthChartWheel data={chart} />
            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>🔥 {t("element")}: <strong className="text-foreground">{chart.dominantElement}</strong></span>
              <span>⚡ {t("modality")}: <strong className="text-foreground">{chart.dominantModality}</strong></span>
            </div>
          </div>

          {/* Planet Table */}
          <div className="bg-card/60 border border-border rounded-xl p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold mb-3">{t("table.title")}</h2>
            <PlanetTable planets={chart.planets} t={t} />
          </div>
        </>
      )}
    </div>
  );
}
