"use client";

import { getSkin, type MuyuSkin } from "./skins";

interface MuyuFishProps {
  skin: MuyuSkin;
  isTapping: boolean;
  onTap: (e?: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * Cyberpunk-styled wooden fish (mokugyo) SVG.
 * Rounded shape with inner details, neon glow, and tap animation.
 */
export function MuyuFish({ skin, isTapping, onTap }: MuyuFishProps) {
  const s = getSkin(skin);

  return (
    <button
      onClick={onTap}
      onTouchStart={onTap}
      className="relative focus:outline-none active:outline-none transition-transform duration-100"
      style={{
        transform: isTapping ? "scale(0.92)" : "scale(1)",
        filter: `drop-shadow(0 0 20px ${s.glow}) drop-shadow(0 0 40px ${s.glow})`,
      }}
      aria-label="Tap wooden fish"
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-[-16px] rounded-full opacity-30 animate-pulse"
        style={{
          background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
        }}
      />

      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <radialGradient id={`fish-grad-${skin}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={s.gradientTo} />
            <stop offset="100%" stopColor={s.gradientFrom} />
          </radialGradient>
          <filter id={`fish-glow-${skin}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main body — rounded mokugyo shape */}
        <ellipse
          cx="100"
          cy="105"
          rx="80"
          ry="72"
          fill={`url(#fish-grad-${skin})`}
          stroke={s.stroke}
          strokeWidth="2.5"
          filter={`url(#fish-glow-${skin})`}
        />

        {/* Top knob / handle */}
        <ellipse
          cx="100"
          cy="42"
          rx="18"
          ry="14"
          fill={s.gradientFrom}
          stroke={s.stroke}
          strokeWidth="2"
        />

        {/* Mouth slit */}
        <path
          d="M 60 115 Q 100 140 140 115"
          fill="none"
          stroke={s.detail}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Left eye */}
        <circle cx="72" cy="88" r="8" fill={s.gradientFrom} stroke={s.detail} strokeWidth="1.5" />
        <circle cx="72" cy="88" r="3" fill={s.detail} opacity="0.9" />

        {/* Right eye */}
        <circle cx="128" cy="88" r="8" fill={s.gradientFrom} stroke={s.detail} strokeWidth="1.5" />
        <circle cx="128" cy="88" r="3" fill={s.detail} opacity="0.9" />

        {/* Scale pattern lines — cyberpunk circuit-like */}
        <path
          d="M 50 100 Q 75 95 100 100 Q 125 105 150 100"
          fill="none"
          stroke={s.stroke}
          strokeWidth="1"
          opacity="0.3"
        />
        <path
          d="M 55 120 Q 80 115 100 120 Q 120 125 145 120"
          fill="none"
          stroke={s.stroke}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Center character 功 */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={s.detail}
          fontSize="20"
          fontWeight="bold"
          opacity="0.5"
          style={{ fontFamily: "serif" }}
        >
          功
        </text>
      </svg>
    </button>
  );
}
