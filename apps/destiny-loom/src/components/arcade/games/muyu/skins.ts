export type MuyuSkin = "neon-purple" | "golden" | "jade" | "crystal";

export interface SkinConfig {
  id: MuyuSkin;
  name: string;
  nameZh: string;
  meritRequired: number;
  /** Primary glow color */
  glow: string;
  /** SVG fill gradient stops */
  gradientFrom: string;
  gradientTo: string;
  /** Border/stroke color */
  stroke: string;
  /** Inner detail color */
  detail: string;
}

export const SKINS: SkinConfig[] = [
  {
    id: "neon-purple",
    name: "Neon Purple",
    nameZh: "霓虹紫",
    meritRequired: 0,
    glow: "rgba(168, 85, 247, 0.6)",
    gradientFrom: "#7c3aed",
    gradientTo: "#a855f7",
    stroke: "#c084fc",
    detail: "#ddd6fe",
  },
  {
    id: "golden",
    name: "Golden",
    nameZh: "金色",
    meritRequired: 1000,
    glow: "rgba(251, 191, 36, 0.6)",
    gradientFrom: "#b45309",
    gradientTo: "#fbbf24",
    stroke: "#fcd34d",
    detail: "#fef3c7",
  },
  {
    id: "jade",
    name: "Jade",
    nameZh: "翡翠",
    meritRequired: 5000,
    glow: "rgba(52, 211, 153, 0.6)",
    gradientFrom: "#065f46",
    gradientTo: "#34d399",
    stroke: "#6ee7b7",
    detail: "#d1fae5",
  },
  {
    id: "crystal",
    name: "Crystal",
    nameZh: "水晶",
    meritRequired: 10000,
    glow: "rgba(96, 165, 250, 0.6)",
    gradientFrom: "#1e3a5f",
    gradientTo: "#60a5fa",
    stroke: "#93c5fd",
    detail: "#dbeafe",
  },
];

export function getSkin(id: MuyuSkin): SkinConfig {
  return SKINS.find((s) => s.id === id) || SKINS[0]!;
}

export function getUnlockedSkins(totalMerit: number): MuyuSkin[] {
  return SKINS.filter((s) => totalMerit >= s.meritRequired).map((s) => s.id);
}
