import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";

const zodiacEmoji: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  let profile: any = null;
  try {
    const res = await fetch(`${CORE_API_URL}/users/profile/${username}`);
    if (res.ok) {
      const json = await res.json();
      profile = json.data;
    }
  } catch {}

  const displayName = profile?.displayName || username;
  const zodiac = profile?.zodiacSign;
  const zodiacIcon = zodiac ? (zodiacEmoji[zodiac] || "") : "";
  const karma = profile?.karma ?? 0;
  const readingCount = profile?.readingCount ?? 0;
  const avatarUrl = profile?.avatarUrl;

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
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              border: "3px solid #a78bfa",
              marginBottom: "20px",
              boxShadow: "0 0 30px rgba(168,85,247,0.4)",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              marginBottom: "20px",
              boxShadow: "0 0 30px rgba(168,85,247,0.4)",
            }}
          >
            👤
          </div>
        )}

        {/* Name + zodiac */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#e9d5ff",
              display: "flex",
              textShadow: "0 0 20px rgba(168,85,247,0.4)",
            }}
          >
            {displayName}
          </span>
          {zodiacIcon && (
            <span style={{ fontSize: "40px", display: "flex" }}>{zodiacIcon}</span>
          )}
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "22px",
            color: "#8b5cf6",
            marginBottom: "32px",
            display: "flex",
          }}
        >
          @{username}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "42px", fontWeight: 700, color: "#c084fc", display: "flex" }}>
              {karma}
            </span>
            <span style={{ fontSize: "18px", color: "#a78bfa", display: "flex" }}>Karma</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "42px", fontWeight: 700, color: "#c084fc", display: "flex" }}>
              {readingCount}
            </span>
            <span style={{ fontSize: "18px", color: "#a78bfa", display: "flex" }}>Readings</span>
          </div>
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
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
