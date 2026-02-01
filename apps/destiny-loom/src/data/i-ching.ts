/**
 * I Ching data re-export and extended reference.
 * The core casting engine and 64 hexagram data live in @/lib/i-ching.ts
 * This file provides additional structured data for UI display.
 */

export { castHexagram, type CastResult, type HexagramData, type HexagramLine } from "@/lib/i-ching";

export const trigrams = [
  { name: "Heaven", nameZh: "乾", symbol: "☰", element: "Metal", attribute: "Creative" },
  { name: "Lake", nameZh: "兑", symbol: "☱", element: "Metal", attribute: "Joyous" },
  { name: "Fire", nameZh: "离", symbol: "☲", element: "Fire", attribute: "Clinging" },
  { name: "Thunder", nameZh: "震", symbol: "☳", element: "Wood", attribute: "Arousing" },
  { name: "Wind", nameZh: "巽", symbol: "☴", element: "Wood", attribute: "Gentle" },
  { name: "Water", nameZh: "坎", symbol: "☵", element: "Water", attribute: "Abysmal" },
  { name: "Mountain", nameZh: "艮", symbol: "☶", element: "Earth", attribute: "Keeping Still" },
  { name: "Earth", nameZh: "坤", symbol: "☷", element: "Earth", attribute: "Receptive" },
];
