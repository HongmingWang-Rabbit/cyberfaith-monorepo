"use client";

/** Pure SVG chart components — no chart library */

interface LineChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
}

export function SvgLineChart({ data, width = 600, height = 200, color = "#8b5cf6", title }: LineChartProps) {
  if (!data.length) return <div className="text-muted-foreground text-sm">No data</div>;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * w,
    y: padding.top + h - (d.value / max) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + h} L ${points[0].x} ${padding.top + h} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => Math.round((max / (yTicks - 1)) * i));

  return (
    <div>
      {title && <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTickValues.map((v, i) => {
          const y = padding.top + h - (v / max) * h;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={padding.left + w} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="currentColor" fillOpacity="0.4" fontSize="10">
                {v}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${color.replace("#", "")})`} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}

        {/* X-axis labels (show every nth) */}
        {data.map((d, i) => {
          if (data.length > 15 && i % Math.ceil(data.length / 7) !== 0) return null;
          const x = padding.left + (i / Math.max(data.length - 1, 1)) * w;
          return (
            <text key={i} x={x} y={height - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="9">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  defaultColor?: string;
  title?: string;
}

export function SvgBarChart({ data, width = 600, height = 200, defaultColor = "#06b6d4", title }: BarChartProps) {
  if (!data.length) return <div className="text-muted-foreground text-sm">No data</div>;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(30, (w / data.length) * 0.7);
  const gap = (w - barWidth * data.length) / (data.length + 1);

  return (
    <div>
      {title && <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * h;
          const x = padding.left + gap + i * (barWidth + gap);
          const y = padding.top + h - barH;
          const fill = d.color || defaultColor;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} rx="2" fill={fill} fillOpacity="0.8" />
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="9">
                {d.value}
              </text>
              <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="9">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface HeatmapProps {
  data: { label: string; day1: number; day7: number; day30: number; cohortSize: number }[];
  title?: string;
}

export function SvgRetentionHeatmap({ data, title }: HeatmapProps) {
  if (!data.length) return <div className="text-muted-foreground text-sm">No data</div>;

  const cols = ["Day 1", "Day 7", "Day 30"];
  const cellW = 80;
  const cellH = 28;
  const labelW = 90;
  const headerH = 30;
  const width = labelW + cols.length * cellW + 60;
  const height = headerH + data.length * cellH + 10;

  function getColor(rate: number) {
    // Green scale
    const intensity = Math.min(1, rate);
    const r = Math.round(220 - intensity * 180);
    const g = Math.round(220 - intensity * 40);
    const b = Math.round(220 - intensity * 180);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div>
      {title && <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: Math.min(height, 400) }}>
        {/* Header */}
        <text x={labelW / 2} y={headerH - 8} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="10">Cohort</text>
        <text x={labelW + cols.length * cellW + 30} y={headerH - 8} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="10">Size</text>
        {cols.map((col, ci) => (
          <text key={ci} x={labelW + ci * cellW + cellW / 2} y={headerH - 8} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="10">
            {col}
          </text>
        ))}

        {data.slice(-14).map((row, ri) => {
          const y = headerH + ri * cellH;
          const rates = [
            row.cohortSize > 0 ? row.day1 / row.cohortSize : 0,
            row.cohortSize > 0 ? row.day7 / row.cohortSize : 0,
            row.cohortSize > 0 ? row.day30 / row.cohortSize : 0,
          ];

          return (
            <g key={ri}>
              <text x={labelW / 2} y={y + cellH / 2 + 4} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize="9">
                {row.label}
              </text>
              {rates.map((rate, ci) => (
                <g key={ci}>
                  <rect
                    x={labelW + ci * cellW + 2}
                    y={y + 2}
                    width={cellW - 4}
                    height={cellH - 4}
                    rx="3"
                    fill={getColor(rate)}
                    fillOpacity="0.7"
                  />
                  <text
                    x={labelW + ci * cellW + cellW / 2}
                    y={y + cellH / 2 + 4}
                    textAnchor="middle"
                    fill={rate > 0.4 ? "#fff" : "currentColor"}
                    fillOpacity={rate > 0.4 ? 1 : 0.6}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {(rate * 100).toFixed(0)}%
                  </text>
                </g>
              ))}
              <text x={labelW + cols.length * cellW + 30} y={y + cellH / 2 + 4} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="9">
                {row.cohortSize}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface FunnelProps {
  steps: { label: string; value: number }[];
  title?: string;
}

export function SvgFunnel({ steps, title }: FunnelProps) {
  if (!steps.length) return null;
  const max = steps[0].value || 1;
  const barH = 36;
  const gap = 4;
  const width = 500;
  const height = steps.length * (barH + gap) + 20;
  const maxBarW = width - 140;

  return (
    <div>
      {title && <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {steps.map((step, i) => {
          const barW = Math.max(4, (step.value / max) * maxBarW);
          const y = i * (barH + gap);
          const pct = i > 0 ? ((step.value / steps[i - 1].value) * 100).toFixed(0) : "100";
          const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
          const fill = colors[i % colors.length];

          return (
            <g key={i}>
              <rect x={0} y={y} width={barW} height={barH} rx="4" fill={fill} fillOpacity="0.75" />
              <text x={8} y={y + barH / 2 + 4} fill="#fff" fontSize="11" fontWeight="bold">
                {step.label}
              </text>
              <text x={barW + 8} y={y + barH / 2 + 4} fill="currentColor" fillOpacity="0.6" fontSize="11">
                {step.value.toLocaleString()} ({pct}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
