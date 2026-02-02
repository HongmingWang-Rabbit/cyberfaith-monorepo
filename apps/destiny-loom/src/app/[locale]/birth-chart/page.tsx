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

interface Aspect {
  planet1: string;
  planet2: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  angle: number;
  orb: number;
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

/* ── Aspect utilities ──────────────────────────────────── */

const ASPECT_DEFS: { type: Aspect["type"]; angle: number; orb: number; color: string; dash?: string; symbol: string }[] = [
  { type: "conjunction", angle: 0, orb: 8, color: "#a855f7", symbol: "☌" },
  { type: "opposition", angle: 180, orb: 8, color: "#ef4444", dash: "6,3", symbol: "☍" },
  { type: "trine", angle: 120, orb: 8, color: "#22c55e", symbol: "△" },
  { type: "square", angle: 90, orb: 7, color: "#f59e0b", dash: "4,4", symbol: "□" },
  { type: "sextile", angle: 60, orb: 6, color: "#06b6d4", dash: "2,4", symbol: "⚹" },
];

function computeAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const deg1 = SIGN_ORDER.indexOf(planets[i].sign) * 30 + planets[i].degree;
      const deg2 = SIGN_ORDER.indexOf(planets[j].sign) * 30 + planets[j].degree;
      let diff = Math.abs(deg1 - deg2);
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          aspects.push({ planet1: planets[i].planet, planet2: planets[j].planet, type: def.type, angle: def.angle, orb });
          break;
        }
      }
    }
  }
  return aspects;
}

/* ── Tooltip component ─────────────────────────────────── */

function SvgTooltip({ x, y, text, visible }: { x: number; y: number; text: string; visible: boolean }) {
  if (!visible) return null;
  const lines = text.split("\n");
  const w = Math.max(...lines.map(l => l.length)) * 6.5 + 16;
  const h = lines.length * 14 + 12;
  // Clamp within viewBox
  const tx = Math.min(Math.max(x - w / 2, 4), 496 - w);
  const ty = y - h - 8;
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={tx} y={ty} width={w} height={h} rx={6} fill="#1a1a2eee" stroke="#6d28d9" strokeWidth={0.5} />
      {lines.map((line, i) => (
        <text key={i} x={tx + 8} y={ty + 14 + i * 14} fontSize={10} fill="#e4e4e7">{line}</text>
      ))}
    </g>
  );
}

/* ── Birth Chart Wheel SVG ─────────────────────────────── */

function BirthChartWheel({ data }: { data: BirthChartData }) {
  const size = 500;
  const cx = size / 2, cy = size / 2;
  const outerR = 220, signR = 195, innerR = 170, houseR = 80;

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Compute planet pixel positions for aspect lines & tooltips
  const planetPositions = data.planets.map((p, i) => {
    const signIdx = SIGN_ORDER.indexOf(p.sign);
    const totalDeg = signIdx * 30 + p.degree;
    const angle = (totalDeg - 90) * Math.PI / 180;
    const planetR = innerR - 30 - (i % 2) * 20;
    return { planet: p, px: cx + planetR * Math.cos(angle), py: cy + planetR * Math.sin(angle), angle };
  });

  const posMap = Object.fromEntries(planetPositions.map(p => [p.planet.planet, p]));

  // Compute aspects
  const aspects = computeAspects(data.planets);

  // Sign positions on outer ring
  const signElements = SIGN_ORDER.map((sign, i) => {
    const startAngle = (i * 30 - 90) * Math.PI / 180;
    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const x1i = cx + innerR * Math.cos(startAngle);
    const y1i = cy + innerR * Math.sin(startAngle);
    const x1o = cx + outerR * Math.cos(startAngle);
    const y1o = cy + outerR * Math.sin(startAngle);
    const textX = cx + signR * Math.cos(midAngle);
    const textY = cy + signR * Math.sin(midAngle);

    return (
      <g key={sign}>
        <line x1={x1i} y1={y1i} x2={x1o} y2={y1o} stroke={NEON_COLORS.ring} strokeWidth={0.5} opacity={0.5} />
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

  // Aspect lines between planets
  const aspectElements = aspects.map((a, i) => {
    const p1 = posMap[a.planet1];
    const p2 = posMap[a.planet2];
    if (!p1 || !p2) return null;
    const def = ASPECT_DEFS.find(d => d.type === a.type)!;
    return (
      <line key={`aspect-${i}`} x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
        stroke={def.color} strokeWidth={0.8} opacity={0.4}
        strokeDasharray={def.dash || "none"}
        onMouseEnter={() => setTooltip({ x: (p1.px + p2.px) / 2, y: (p1.py + p2.py) / 2, text: `${def.symbol} ${a.type}\n${a.planet1} – ${a.planet2}\norb: ${a.orb.toFixed(1)}°` })}
        onMouseLeave={() => setTooltip(null)}
        style={{ cursor: "pointer" }}
      />
    );
  });

  // Planet glyphs with tooltips
  const planetElements = planetPositions.map(({ planet: p, px, py, angle }) => (
    <g key={p.planet}
      onMouseEnter={() => setTooltip({ x: px, y: py, text: `${PLANET_GLYPHS[p.planet] || "?"} ${p.planet}\n${ZODIAC_GLYPHS[p.sign]} ${p.sign} ${p.degree}°\n${p.interpretation.slice(0, 60)}` })}
      onMouseLeave={() => setTooltip(null)}
      style={{ cursor: "pointer" }}
    >
      <line x1={cx + (innerR - 5) * Math.cos(angle)} y1={cy + (innerR - 5) * Math.sin(angle)}
        x2={px} y2={py} stroke={NEON_COLORS.accent} strokeWidth={0.5} opacity={0.3} />
      <circle cx={px} cy={py} r={12} fill={NEON_COLORS.bg} stroke={NEON_COLORS.accent} strokeWidth={1}
        style={{ filter: `drop-shadow(0 0 6px ${NEON_COLORS.accent}40)` }} />
      <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={NEON_COLORS.accent}
        style={{ filter: `drop-shadow(0 0 3px ${NEON_COLORS.accent})`, pointerEvents: "none" }}>
        {PLANET_GLYPHS[p.planet] || "?"}
      </text>
    </g>
  ));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-lg mx-auto" id="birth-chart-svg">
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

      {/* Rings */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={NEON_COLORS.primary} strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 8px ${NEON_COLORS.primary}60)` }} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={NEON_COLORS.ring} strokeWidth={1} opacity={0.6} />
      <circle cx={cx} cy={cy} r={houseR} fill="none" stroke={NEON_COLORS.ring} strokeWidth={0.5} opacity={0.4} />

      {signElements}
      {houseElements}
      {aspectElements}
      {planetElements}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill={NEON_COLORS.secondary}
        style={{ filter: `drop-shadow(0 0 6px ${NEON_COLORS.secondary})` }} />

      {/* Tooltip overlay */}
      {tooltip && <SvgTooltip x={tooltip.x} y={tooltip.y} text={tooltip.text} visible />}

      {/* Aspect legend */}
      {aspects.length > 0 && (
        <g>
          {ASPECT_DEFS.filter(d => aspects.some(a => a.type === d.type)).map((d, i) => (
            <g key={d.type}>
              <line x1={8} y1={size - 60 + i * 13} x2={20} y2={size - 60 + i * 13}
                stroke={d.color} strokeWidth={1.5} strokeDasharray={d.dash || "none"} />
              <text x={24} y={size - 57 + i * 13} fontSize={8} fill="#a3a3a3">
                {d.symbol} {d.type}
              </text>
            </g>
          ))}
        </g>
      )}
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
