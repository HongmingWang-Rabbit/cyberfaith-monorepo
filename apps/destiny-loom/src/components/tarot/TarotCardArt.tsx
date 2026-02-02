"use client";

import { useState } from "react";

// Each card's unique cyberpunk SVG art data
const cardArtData: Record<number, { gradient: string; shapes: React.ReactNode; glow: string; symbol: string }> = {
  0: { // The Fool
    gradient: "from-cyan-400 via-purple-500 to-pink-500",
    glow: "#00ffff",
    symbol: "0",
    shapes: (
      <g>
        <circle cx="75" cy="60" r="25" fill="none" stroke="#00ffff" strokeWidth="1.5" opacity="0.8">
          <animate attributeName="r" values="25;28;25" dur="3s" repeatCount="indefinite"/>
        </circle>
        <path d="M75 35 L80 50 L95 55 L82 65 L87 80 L75 72 L63 80 L68 65 L55 55 L70 50 Z" fill="none" stroke="#ff00ff" strokeWidth="1" opacity="0.6"/>
        <line x1="75" y1="85" x2="75" y2="120" stroke="#00ffff" strokeWidth="1" strokeDasharray="3,3">
          <animate attributeName="strokeDashoffset" values="0;6" dur="1s" repeatCount="indefinite"/>
        </line>
        <circle cx="60" cy="100" r="3" fill="#ff00ff" opacity="0.5"/>
        <circle cx="90" cy="95" r="2" fill="#00ffff" opacity="0.7"/>
        <path d="M50 110 Q75 90 100 110" fill="none" stroke="#ffff00" strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
  },
  1: { // The Magician
    gradient: "from-yellow-400 via-red-500 to-purple-600",
    glow: "#ffdd00",
    symbol: "I",
    shapes: (
      <g>
        <text x="75" y="45" textAnchor="middle" fill="#ffdd00" fontSize="20" fontFamily="serif" opacity="0.9">∞</text>
        <rect x="55" y="70" width="40" height="2" fill="#ffdd00" opacity="0.6"/>
        <circle cx="60" cy="85" r="4" fill="none" stroke="#ff4444" strokeWidth="1"/>
        <polygon points="70,82 75,90 80,82" fill="none" stroke="#00ff88" strokeWidth="1"/>
        <rect x="84" y="82" width="7" height="7" fill="none" stroke="#4488ff" strokeWidth="1"/>
        <circle cx="98" cy="85" r="4" fill="none" stroke="#ffdd00" strokeWidth="1"/>
        <line x1="75" y1="52" x2="75" y2="68" stroke="#ffdd00" strokeWidth="1.5" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </line>
        <line x1="75" y1="100" x2="75" y2="120" stroke="#ffdd00" strokeWidth="1" strokeDasharray="2,2"/>
      </g>
    ),
  },
  2: { // High Priestess
    gradient: "from-indigo-600 via-blue-800 to-purple-900",
    glow: "#8888ff",
    symbol: "II",
    shapes: (
      <g>
        <circle cx="75" cy="50" r="15" fill="none" stroke="#8888ff" strokeWidth="1">
          <animate attributeName="opacity" values="1;0.4;1" dur="4s" repeatCount="indefinite"/>
        </circle>
        <path d="M60 50 Q75 35 90 50 Q75 65 60 50" fill="none" stroke="#cc88ff" strokeWidth="1"/>
        <rect x="62" y="72" width="4" height="40" fill="#4444aa" opacity="0.6"/>
        <rect x="84" y="72" width="4" height="40" fill="#222266" opacity="0.6"/>
        <text x="75" y="95" textAnchor="middle" fill="#8888ff" fontSize="8" fontFamily="serif" opacity="0.5">☽</text>
        <path d="M68 68 L82 68" stroke="#8888ff" strokeWidth="0.5" strokeDasharray="1,2"/>
      </g>
    ),
  },
  3: { // The Empress
    gradient: "from-emerald-400 via-teal-500 to-green-700",
    glow: "#00ff88",
    symbol: "III",
    shapes: (
      <g>
        <path d="M75 40 L85 60 L100 65 L88 78 L92 95 L75 85 L58 95 L62 78 L50 65 L65 60 Z" fill="none" stroke="#00ff88" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="75" cy="70" r="10" fill="none" stroke="#ffcc00" strokeWidth="0.8" opacity="0.5"/>
        <path d="M55 100 Q65 85 75 100 Q85 85 95 100" fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.6"/>
        <circle cx="75" cy="70" r="3" fill="#00ff88" opacity="0.4">
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    ),
  },
  4: { // The Emperor
    gradient: "from-red-600 via-orange-600 to-red-800",
    glow: "#ff4444",
    symbol: "IV",
    shapes: (
      <g>
        <rect x="55" y="45" width="40" height="55" fill="none" stroke="#ff4444" strokeWidth="1.5" opacity="0.6"/>
        <line x1="55" y1="60" x2="95" y2="60" stroke="#ff6644" strokeWidth="1" opacity="0.5"/>
        <polygon points="75,35 82,48 68,48" fill="none" stroke="#ffaa00" strokeWidth="1.2"/>
        <rect x="65" y="65" width="20" height="3" fill="#ff4444" opacity="0.4"/>
        <line x1="75" y1="48" x2="75" y2="100" stroke="#ff4444" strokeWidth="0.8" strokeDasharray="4,2" opacity="0.3"/>
        <rect x="60" y="80" width="30" height="15" fill="none" stroke="#ff6644" strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
  },
  5: { // The Hierophant
    gradient: "from-amber-500 via-yellow-600 to-orange-700",
    glow: "#ffaa00",
    symbol: "V",
    shapes: (
      <g>
        <path d="M75 35 L85 50 L75 65 L65 50 Z" fill="none" stroke="#ffaa00" strokeWidth="1.2"/>
        <line x1="75" y1="65" x2="75" y2="110" stroke="#ffaa00" strokeWidth="1" opacity="0.6"/>
        <line x1="60" y1="80" x2="90" y2="80" stroke="#ffaa00" strokeWidth="1" opacity="0.6"/>
        <circle cx="62" cy="100" r="5" fill="none" stroke="#ffcc44" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="88" cy="100" r="5" fill="none" stroke="#ffcc44" strokeWidth="0.8" opacity="0.5"/>
        <path d="M65 50 Q75 42 85 50" fill="none" stroke="#ffdd66" strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
  },
  6: { // The Lovers
    gradient: "from-pink-400 via-rose-500 to-red-500",
    glow: "#ff66aa",
    symbol: "VI",
    shapes: (
      <g>
        <path d="M75 55 L65 45 Q55 35 55 50 Q55 65 75 80 Q95 65 95 50 Q95 35 85 45 Z" fill="none" stroke="#ff66aa" strokeWidth="1.5" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2.5s" repeatCount="indefinite"/>
        </path>
        <circle cx="65" cy="95" r="6" fill="none" stroke="#ff88cc" strokeWidth="0.8"/>
        <circle cx="85" cy="95" r="6" fill="none" stroke="#ff88cc" strokeWidth="0.8"/>
        <line x1="71" y1="95" x2="79" y2="95" stroke="#ff66aa" strokeWidth="0.5" strokeDasharray="1,1"/>
        <polygon points="75,35 78,42 72,42" fill="#ffcc00" opacity="0.6"/>
      </g>
    ),
  },
  7: { // The Chariot
    gradient: "from-blue-500 via-indigo-600 to-blue-800",
    glow: "#4488ff",
    symbol: "VII",
    shapes: (
      <g>
        <rect x="58" y="50" width="34" height="40" fill="none" stroke="#4488ff" strokeWidth="1.5" opacity="0.7"/>
        <polygon points="75,35 95,50 55,50" fill="none" stroke="#66aaff" strokeWidth="1"/>
        <circle cx="58" cy="95" r="6" fill="none" stroke="#4488ff" strokeWidth="1.2">
          <animate attributeName="stroke" values="#4488ff;#88ccff;#4488ff" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="92" cy="95" r="6" fill="none" stroke="#4488ff" strokeWidth="1.2">
          <animate attributeName="stroke" values="#4488ff;#88ccff;#4488ff" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <text x="75" y="73" textAnchor="middle" fill="#4488ff" fontSize="10" fontFamily="serif" opacity="0.6">☆</text>
      </g>
    ),
  },
  8: { // Strength
    gradient: "from-orange-400 via-amber-500 to-yellow-600",
    glow: "#ff8800",
    symbol: "VIII",
    shapes: (
      <g>
        <text x="75" y="45" textAnchor="middle" fill="#ff8800" fontSize="18" fontFamily="serif" opacity="0.8">∞</text>
        <ellipse cx="75" cy="75" rx="20" ry="15" fill="none" stroke="#ff8800" strokeWidth="1.2" opacity="0.6"/>
        <path d="M60 70 Q65 55 75 60 Q85 55 90 70" fill="none" stroke="#ffaa44" strokeWidth="1" opacity="0.7"/>
        <path d="M65 85 Q75 95 85 85" fill="none" stroke="#ff8800" strokeWidth="1" opacity="0.5"/>
        <circle cx="75" cy="75" r="5" fill="#ff8800" opacity="0.2">
          <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </g>
    ),
  },
  9: { // The Hermit
    gradient: "from-gray-500 via-slate-600 to-gray-800",
    glow: "#aaaacc",
    symbol: "IX",
    shapes: (
      <g>
        <polygon points="70,40 80,40 75,30" fill="#ffdd44" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
        </polygon>
        <line x1="75" y1="40" x2="75" y2="100" stroke="#aaaacc" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="75" cy="35" r="8" fill="none" stroke="#ffdd44" strokeWidth="0.8" opacity="0.4"/>
        <path d="M60 100 Q75 90 90 100" fill="none" stroke="#aaaacc" strokeWidth="1" opacity="0.3"/>
        <circle cx="75" cy="35" r="3" fill="#ffdd44" opacity="0.6"/>
      </g>
    ),
  },
  10: { // Wheel of Fortune
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    glow: "#aa66ff",
    symbol: "X",
    shapes: (
      <g>
        <circle cx="75" cy="70" r="30" fill="none" stroke="#aa66ff" strokeWidth="1.5" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" values="0 75 70;360 75 70" dur="10s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75" cy="70" r="20" fill="none" stroke="#cc88ff" strokeWidth="0.8" opacity="0.4"/>
        <line x1="75" y1="40" x2="75" y2="100" stroke="#aa66ff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="45" y1="70" x2="105" y2="70" stroke="#aa66ff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="54" y1="49" x2="96" y2="91" stroke="#aa66ff" strokeWidth="0.5" opacity="0.3"/>
        <line x1="96" y1="49" x2="54" y2="91" stroke="#aa66ff" strokeWidth="0.5" opacity="0.3"/>
        <circle cx="75" cy="70" r="5" fill="#aa66ff" opacity="0.3"/>
      </g>
    ),
  },
  11: { // Justice
    gradient: "from-yellow-500 via-amber-600 to-orange-600",
    glow: "#ffcc00",
    symbol: "XI",
    shapes: (
      <g>
        <line x1="75" y1="35" x2="75" y2="55" stroke="#ffcc00" strokeWidth="2" opacity="0.8"/>
        <line x1="50" y1="55" x2="100" y2="55" stroke="#ffcc00" strokeWidth="1.5" opacity="0.7"/>
        <path d="M50 55 L45 70 L60 70 Z" fill="none" stroke="#ffcc00" strokeWidth="1"/>
        <path d="M100 55 L95 70 L105 70 Z" fill="none" stroke="#ffcc00" strokeWidth="1"/>
        <rect x="72" y="75" width="6" height="30" fill="none" stroke="#ffcc00" strokeWidth="1" opacity="0.5"/>
        <line x1="65" y1="105" x2="85" y2="105" stroke="#ffcc00" strokeWidth="1" opacity="0.4"/>
      </g>
    ),
  },
  12: { // The Hanged Man
    gradient: "from-teal-500 via-cyan-600 to-blue-700",
    glow: "#00cccc",
    symbol: "XII",
    shapes: (
      <g>
        <line x1="60" y1="35" x2="90" y2="35" stroke="#00cccc" strokeWidth="1.5"/>
        <line x1="75" y1="35" x2="75" y2="55" stroke="#00cccc" strokeWidth="1"/>
        <circle cx="75" cy="90" r="8" fill="none" stroke="#00cccc" strokeWidth="1.2" opacity="0.7"/>
        <line x1="75" y1="55" x2="75" y2="82" stroke="#00cccc" strokeWidth="1" opacity="0.6"/>
        <line x1="75" y1="55" x2="60" y2="65" stroke="#00cccc" strokeWidth="0.8" opacity="0.5"/>
        <line x1="75" y1="55" x2="90" y2="65" stroke="#00cccc" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="75" cy="90" r="12" fill="none" stroke="#44dddd" strokeWidth="0.5" opacity="0.3">
          <animate attributeName="r" values="12;15;12" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    ),
  },
  13: { // Death
    gradient: "from-gray-800 via-gray-900 to-black",
    glow: "#ff2222",
    symbol: "XIII",
    shapes: (
      <g>
        <path d="M65 55 Q75 40 85 55 Q85 65 75 70 Q65 65 65 55" fill="none" stroke="#ff2222" strokeWidth="1.2" opacity="0.8"/>
        <circle cx="70" cy="55" r="2" fill="#ff2222" opacity="0.6"/>
        <circle cx="80" cy="55" r="2" fill="#ff2222" opacity="0.6"/>
        <path d="M68 62 Q75 66 82 62" fill="none" stroke="#ff2222" strokeWidth="0.8"/>
        <line x1="75" y1="70" x2="75" y2="100" stroke="#ff2222" strokeWidth="1" opacity="0.5"/>
        <line x1="60" y1="80" x2="90" y2="80" stroke="#ff2222" strokeWidth="0.8" opacity="0.4"/>
        <path d="M55 105 Q75 95 95 105" fill="none" stroke="#ff2222" strokeWidth="0.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
        </path>
      </g>
    ),
  },
  14: { // Temperance
    gradient: "from-sky-400 via-blue-400 to-indigo-500",
    glow: "#44aaff",
    symbol: "XIV",
    shapes: (
      <g>
        <path d="M60 50 L65 80 L70 50 Z" fill="none" stroke="#44aaff" strokeWidth="1" opacity="0.7"/>
        <path d="M80 50 L85 80 L90 50 Z" fill="none" stroke="#44aaff" strokeWidth="1" opacity="0.7"/>
        <path d="M67 65 Q75 55 83 65" fill="none" stroke="#88ccff" strokeWidth="1.5" opacity="0.6">
          <animate attributeName="d" values="M67 65 Q75 55 83 65;M67 65 Q75 60 83 65;M67 65 Q75 55 83 65" dur="2s" repeatCount="indefinite"/>
        </path>
        <polygon points="75,35 78,42 72,42" fill="none" stroke="#44aaff" strokeWidth="0.8"/>
        <path d="M60 90 Q75 85 90 90" fill="none" stroke="#44aaff" strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
  },
  15: { // The Devil
    gradient: "from-red-800 via-red-900 to-gray-900",
    glow: "#ff0044",
    symbol: "XV",
    shapes: (
      <g>
        <path d="M75 35 L60 55 L65 55 L55 75 L70 65 L75 80 L80 65 L95 75 L85 55 L90 55 Z" fill="none" stroke="#ff0044" strokeWidth="1.2" opacity="0.7"/>
        <circle cx="68" cy="48" r="3" fill="#ff0044" opacity="0.5"/>
        <circle cx="82" cy="48" r="3" fill="#ff0044" opacity="0.5"/>
        <path d="M60 95 L65 85 L70 95" fill="none" stroke="#ff4466" strokeWidth="0.8" opacity="0.4"/>
        <path d="M80 95 L85 85 L90 95" fill="none" stroke="#ff4466" strokeWidth="0.8" opacity="0.4"/>
        <line x1="65" y1="92" x2="85" y2="92" stroke="#ff0044" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3"/>
      </g>
    ),
  },
  16: { // The Tower
    gradient: "from-orange-600 via-red-700 to-gray-900",
    glow: "#ff6600",
    symbol: "XVI",
    shapes: (
      <g>
        <rect x="65" y="50" width="20" height="55" fill="none" stroke="#ff6600" strokeWidth="1.5" opacity="0.7"/>
        <polygon points="65,50 75,35 85,50" fill="none" stroke="#ffaa00" strokeWidth="1"/>
        <path d="M60 45 L75 25 L90 45" fill="none" stroke="#ff6600" strokeWidth="0.8" opacity="0.5"/>
        <line x1="70" y1="50" x2="55" y2="35" stroke="#ffdd00" strokeWidth="2" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" repeatCount="indefinite"/>
        </line>
        <circle cx="58" cy="40" r="3" fill="#ff6600" opacity="0.4"/>
        <circle cx="88" cy="60" r="2" fill="#ff6600" opacity="0.3"/>
        <rect x="70" y="65" width="10" height="12" fill="none" stroke="#ff6600" strokeWidth="0.5" opacity="0.4"/>
      </g>
    ),
  },
  17: { // The Star
    gradient: "from-cyan-300 via-blue-400 to-indigo-600",
    glow: "#66ddff",
    symbol: "XVII",
    shapes: (
      <g>
        <polygon points="75,30 78,42 90,42 80,50 84,62 75,54 66,62 70,50 60,42 72,42" fill="none" stroke="#66ddff" strokeWidth="1.2" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite"/>
        </polygon>
        <circle cx="55" cy="55" r="2" fill="#66ddff" opacity="0.4"/>
        <circle cx="95" cy="50" r="1.5" fill="#66ddff" opacity="0.3"/>
        <circle cx="60" cy="80" r="1" fill="#88eeff" opacity="0.5"/>
        <circle cx="90" cy="85" r="1.5" fill="#88eeff" opacity="0.4"/>
        <circle cx="50" cy="95" r="1" fill="#66ddff" opacity="0.3"/>
        <path d="M55 100 Q65 90 75 100 Q85 90 95 100" fill="none" stroke="#66ddff" strokeWidth="1" opacity="0.4"/>
        <path d="M60 108 Q70 100 80 108" fill="none" stroke="#44aacc" strokeWidth="0.8" opacity="0.3"/>
      </g>
    ),
  },
  18: { // The Moon
    gradient: "from-indigo-700 via-purple-800 to-blue-900",
    glow: "#aaaaff",
    symbol: "XVIII",
    shapes: (
      <g>
        <circle cx="75" cy="45" r="18" fill="none" stroke="#aaaaff" strokeWidth="1" opacity="0.6"/>
        <circle cx="82" cy="42" r="15" fill="url(#moonMask)" stroke="none"/>
        <path d="M55 85 Q60 75 65 85 Q70 75 75 85 Q80 75 85 85 Q90 75 95 85" fill="none" stroke="#6666aa" strokeWidth="1" opacity="0.5"/>
        <path d="M60 100 L65 90 L70 100" fill="none" stroke="#aaaaff" strokeWidth="0.8" opacity="0.4"/>
        <path d="M80 100 L85 90 L90 100" fill="none" stroke="#aaaaff" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="75" cy="45" r="22" fill="none" stroke="#8888cc" strokeWidth="0.5" opacity="0.3">
          <animate attributeName="r" values="22;25;22" dur="4s" repeatCount="indefinite"/>
        </circle>
      </g>
    ),
  },
  19: { // The Sun
    gradient: "from-yellow-300 via-orange-400 to-amber-500",
    glow: "#ffcc00",
    symbol: "XIX",
    shapes: (
      <g>
        <circle cx="75" cy="60" r="18" fill="none" stroke="#ffcc00" strokeWidth="2" opacity="0.8"/>
        <circle cx="75" cy="60" r="12" fill="#ffcc00" opacity="0.15"/>
        {[0,45,90,135,180,225,270,315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 75 + Math.cos(rad) * 22;
          const y1 = 60 + Math.sin(rad) * 22;
          const x2 = 75 + Math.cos(rad) * 30;
          const y2 = 60 + Math.sin(rad) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffcc00" strokeWidth="1.5" opacity="0.6"/>;
        })}
        <circle cx="75" cy="60" r="5" fill="#ffcc00" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <path d="M55 100 Q65 90 75 100 Q85 90 95 100" fill="none" stroke="#ffaa00" strokeWidth="0.8" opacity="0.4"/>
      </g>
    ),
  },
  20: { // Judgement
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    glow: "#ffaa44",
    symbol: "XX",
    shapes: (
      <g>
        <path d="M70 35 L80 35 L78 55 L72 55 Z" fill="none" stroke="#ffaa44" strokeWidth="1.2" opacity="0.7"/>
        <ellipse cx="75" cy="55" rx="12" ry="5" fill="none" stroke="#ffaa44" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="65" cy="85" r="6" fill="none" stroke="#ffcc66" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="75" cy="80" r="6" fill="none" stroke="#ffcc66" strokeWidth="0.8" opacity="0.5"/>
        <circle cx="85" cy="85" r="6" fill="none" stroke="#ffcc66" strokeWidth="0.8" opacity="0.5"/>
        <path d="M60 95 L65 85 M75 95 L75 80 M90 95 L85 85" stroke="#ffaa44" strokeWidth="0.5" opacity="0.4"/>
        {[0,1,2,3,4].map(i => (
          <line key={i} x1={75 + (i-2)*8} y1={60} x2={75 + (i-2)*6} y2={70} stroke="#ffaa44" strokeWidth="0.5" opacity={0.3}>
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur={`${1.5 + i*0.3}s`} repeatCount="indefinite"/>
          </line>
        ))}
      </g>
    ),
  },
  21: { // The World
    gradient: "from-green-400 via-teal-500 to-cyan-600",
    glow: "#00ddaa",
    symbol: "XXI",
    shapes: (
      <g>
        <ellipse cx="75" cy="70" rx="28" ry="35" fill="none" stroke="#00ddaa" strokeWidth="1.5" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" values="0 75 70;360 75 70" dur="20s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="75" cy="70" rx="35" ry="28" fill="none" stroke="#44eebb" strokeWidth="0.8" opacity="0.3"/>
        <circle cx="75" cy="70" r="8" fill="none" stroke="#00ddaa" strokeWidth="1" opacity="0.5"/>
        <circle cx="75" cy="70" r="3" fill="#00ddaa" opacity="0.3"/>
        <circle cx="55" cy="40" r="2" fill="#00ddaa" opacity="0.4"/>
        <circle cx="95" cy="40" r="2" fill="#00ddaa" opacity="0.4"/>
        <circle cx="55" cy="100" r="2" fill="#00ddaa" opacity="0.4"/>
        <circle cx="95" cy="100" r="2" fill="#00ddaa" opacity="0.4"/>
      </g>
    ),
  },
};

const cardNames: Record<number, { en: string; zh: string }> = {
  0: { en: "The Fool", zh: "愚者" },
  1: { en: "The Magician", zh: "魔术师" },
  2: { en: "The High Priestess", zh: "女祭司" },
  3: { en: "The Empress", zh: "女皇" },
  4: { en: "The Emperor", zh: "皇帝" },
  5: { en: "The Hierophant", zh: "教皇" },
  6: { en: "The Lovers", zh: "恋人" },
  7: { en: "The Chariot", zh: "战车" },
  8: { en: "Strength", zh: "力量" },
  9: { en: "The Hermit", zh: "隐者" },
  10: { en: "Wheel of Fortune", zh: "命运之轮" },
  11: { en: "Justice", zh: "正义" },
  12: { en: "The Hanged Man", zh: "倒吊人" },
  13: { en: "Death", zh: "死神" },
  14: { en: "Temperance", zh: "节制" },
  15: { en: "The Devil", zh: "恶魔" },
  16: { en: "The Tower", zh: "塔" },
  17: { en: "The Star", zh: "星星" },
  18: { en: "The Moon", zh: "月亮" },
  19: { en: "The Sun", zh: "太阳" },
  20: { en: "Judgement", zh: "审判" },
  21: { en: "The World", zh: "世界" },
};

interface TarotCardArtProps {
  cardId: number;
  locale?: "en" | "zh";
  interpretation?: string;
  reversed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TarotCardArt({
  cardId,
  locale = "en",
  interpretation,
  reversed = false,
  size = "md",
  className = "",
}: TarotCardArtProps) {
  const [flipped, setFlipped] = useState(false);
  const art = cardArtData[cardId];
  const name = cardNames[cardId];

  if (!art || !name) return null;

  const sizeClasses = {
    sm: "w-36 h-56",
    md: "w-48 h-72",
    lg: "w-64 h-96",
  };

  return (
    <div
      className={`group cursor-pointer perspective-1000 ${sizeClasses[size]} ${className}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped ? "rotate-y-180" : ""}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden border border-white/10"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className={`w-full h-full bg-gradient-to-br ${art.gradient} relative`}>
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              }}
            />

            {/* Glow */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${art.glow}44, transparent 70%)`,
              }}
            />

            {/* SVG Art */}
            <svg
              viewBox="0 0 150 140"
              className={`w-full h-3/5 mt-2 ${reversed ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {art.shapes}
            </svg>

            {/* Card number */}
            <div
              className="absolute top-2 left-3 text-xs font-mono opacity-60"
              style={{ color: art.glow }}
            >
              {art.symbol}
            </div>

            {/* Name */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-center">
              <div
                className="text-xs font-mono tracking-widest uppercase opacity-80"
                style={{ color: art.glow, textShadow: `0 0 8px ${art.glow}66` }}
              >
                {locale === "zh" ? name.zh : name.en}
              </div>
              {reversed && (
                <div className="text-[10px] text-red-400 opacity-60 mt-0.5 font-mono">
                  {locale === "zh" ? "逆位" : "REVERSED"}
                </div>
              )}
            </div>

            {/* Corner decorations */}
            <div className="absolute top-1 right-1 w-4 h-4 border-t border-r opacity-20" style={{ borderColor: art.glow }} />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l opacity-20" style={{ borderColor: art.glow }} />
          </div>
        </div>

        {/* Back (interpretation) */}
        <div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden border border-white/10 rotate-y-180 bg-gray-900"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full p-4 flex flex-col justify-center">
            <div
              className="text-sm font-mono tracking-wider uppercase mb-3 text-center"
              style={{ color: art.glow }}
            >
              {locale === "zh" ? name.zh : name.en}
            </div>
            <div className="text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-full">
              {interpretation || (locale === "zh" ? "点击卡牌查看解读" : "Tap card to view interpretation")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { cardNames, cardArtData };
export default TarotCardArt;
