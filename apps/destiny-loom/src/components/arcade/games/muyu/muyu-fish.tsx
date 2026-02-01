"use client";

import { getSkin, type MuyuSkin } from "./skins";

interface MuyuFishProps {
  skin: MuyuSkin;
  isTapping: boolean;
  onTap: (e?: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Traditional wooden fish (mokugyo) SVG.
 * Clean, minimal design faithful to the real instrument.
 */
export function MuyuFish({ skin, isTapping, onTap }: MuyuFishProps) {
  const s = getSkin(skin);

  return (
    <button
      onClick={onTap}
      onTouchStart={onTap}
      className="relative focus:outline-none active:outline-none"
      style={{
        transform: isTapping ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.08s ease-out",
      }}
      aria-label="Tap wooden fish"
    >
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`body-${skin}`} cx="45%" cy="40%">
            <stop offset="0%" stopColor={s.accent} />
            <stop offset="60%" stopColor={s.bodyColor} />
            <stop offset="100%" stopColor={s.bodyDark} />
          </radialGradient>
          <radialGradient id={`knob-${skin}`} cx="50%" cy="35%">
            <stop offset="0%" stopColor={s.bodyColor} />
            <stop offset="100%" stopColor={s.bodyDark} />
          </radialGradient>
        </defs>

        {/* Subtle shadow beneath */}
        <ellipse cx="110" cy="195" rx="60" ry="8" fill="rgba(0,0,0,0.3)" />

        {/* Main body — the round mokugyo shape */}
        <ellipse
          cx="110"
          cy="115"
          rx="85"
          ry="75"
          fill={`url(#body-${skin})`}
          stroke={s.bodyDark}
          strokeWidth="2"
        />

        {/* Top knob / crown */}
        <ellipse
          cx="110"
          cy="48"
          rx="20"
          ry="16"
          fill={`url(#knob-${skin})`}
          stroke={s.bodyDark}
          strokeWidth="1.5"
        />

        {/* Connecting ridge from knob to body */}
        <path
          d="M 98 58 Q 110 68 122 58"
          fill="none"
          stroke={s.bodyDark}
          strokeWidth="1.5"
        />

        {/* Left eye — traditional carved circle */}
        <circle cx="75" cy="98" r="12" fill={s.bodyDark} opacity="0.5" />
        <circle cx="75" cy="98" r="7" fill={s.bodyDark} opacity="0.3" />

        {/* Right eye */}
        <circle cx="145" cy="98" r="12" fill={s.bodyDark} opacity="0.5" />
        <circle cx="145" cy="98" r="7" fill={s.bodyDark} opacity="0.3" />

        {/* Mouth slit — the opening of the fish */}
        <path
          d="M 65 128 Q 110 155 155 128"
          fill="none"
          stroke={s.bodyDark}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Scale / ridge lines — carved wood texture */}
        <path
          d="M 45 108 Q 78 100 110 108 Q 142 116 175 108"
          fill="none"
          stroke={s.bodyDark}
          strokeWidth="1"
          opacity="0.2"
        />
        <path
          d="M 50 130 Q 80 124 110 130 Q 140 136 170 130"
          fill="none"
          stroke={s.bodyDark}
          strokeWidth="1"
          opacity="0.15"
        />

        {/* Subtle wood highlight */}
        <ellipse
          cx="90"
          cy="95"
          rx="30"
          ry="20"
          fill="white"
          opacity="0.06"
        />
      </svg>
    </button>
  );
}
