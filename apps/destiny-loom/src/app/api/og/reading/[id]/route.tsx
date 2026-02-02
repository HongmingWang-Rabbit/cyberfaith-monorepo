import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

const typeIcons: Record<string, string> = {
  mbti: "🧠",
  tarot: "🃏",
  "i-ching": "☯️",
  "four-pillars": "🏛️",
  zodiac: "⭐",
  dream: "🌙",
};

const typeLabels: Record<string, string> = {
  mbti: "MBTI Personality",
  tarot: "Tarot Reading",
  "i-ching": "I Ching Reading",
  "four-pillars": "Four Pillars of Destiny",
  zodiac: "Zodiac Reading",
  dream: "Dream Interpretation",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let reading: any = null;
  try {
    const res = await fetch(`${CORE_API_URL}/readings/public/${id}`);
    if (res.ok) {
      const json = await res.json();
      reading = json.data;
    }
  } catch {}

  const type = reading?.type || "unknown";
  const result = reading?.result as any;
  const icon = typeIcons[type] || "✨";
  const label = typeLabels[type] || "Reading";

  let excerpt = "Discover your destiny on CyberFaith";
  if (result?.summary) excerpt = String(result.summary).slice(0, 120);
  else if (result?.interpretation) excerpt = String(result.interpretation).slice(0, 120);
  else if (result?.description) excerpt = String(result.description).slice(0, 120);
  else if (type === "mbti" && result?.type) excerpt = `Personality Type: ${result.type}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Icon */}
        <div style={{ fontSize: "80px", marginBottom: "16px", display: "flex" }}>
          {icon}
        </div>

        {/* Type label */}
        <div
          style={{
            fontSize: "24px",
            color: "#a78bfa",
            textTransform: "uppercase",
            letterSpacing: "4px",
            marginBottom: "12px",
            display: "flex",
          }}
        >
          {label}
        </div>

        {/* Main result */}
        {type === "mbti" && result?.type && (
          <div
            style={{
              fontSize: "96px",
              fontWeight: 900,
              color: "#e9d5ff",
              letterSpacing: "12px",
              marginBottom: "16px",
              display: "flex",
              textShadow: "0 0 40px rgba(168,85,247,0.5)",
            }}
          >
            {result.type}
          </div>
        )}

        {/* Excerpt */}
        <div
          style={{
            fontSize: "28px",
            color: "#c4b5fd",
            maxWidth: "900px",
            textAlign: "center",
            lineHeight: "1.4",
            display: "flex",
            opacity: 0.9,
          }}
        >
          {excerpt}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "32px", display: "flex" }}>🔮</span>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #a78bfa, #c084fc)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            Destiny Loom — CyberFaith
          </span>
        </div>

        {/* Border glow */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            border: "2px solid rgba(139,92,246,0.3)",
            borderRadius: "0",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
