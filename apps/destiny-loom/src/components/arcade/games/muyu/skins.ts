export type MuyuSkin = "classic" | "dark-wood" | "golden" | "jade";

export interface SkinConfig {
  id: MuyuSkin;
  name: string;
  nameZh: string;
  meritRequired: number;
  /** Wood body color */
  bodyColor: string;
  /** Darker shade for depth */
  bodyDark: string;
  /** Highlight/accent */
  accent: string;
}

export const SKINS: SkinConfig[] = [
  {
    id: "classic",
    name: "Classic",
    nameZh: "经典",
    meritRequired: 0,
    bodyColor: "#8B5E3C",
    bodyDark: "#5C3A1E",
    accent: "#C4956A",
  },
  {
    id: "dark-wood",
    name: "Dark Wood",
    nameZh: "深木",
    meritRequired: 1000,
    bodyColor: "#4A2C17",
    bodyDark: "#2D1A0E",
    accent: "#7A5233",
  },
  {
    id: "golden",
    name: "Golden",
    nameZh: "金色",
    meritRequired: 5000,
    bodyColor: "#B8860B",
    bodyDark: "#8B6508",
    accent: "#DAA520",
  },
  {
    id: "jade",
    name: "Jade",
    nameZh: "翡翠",
    meritRequired: 10000,
    bodyColor: "#2E7D5B",
    bodyDark: "#1A4D38",
    accent: "#5CAE8B",
  },
];

export function getSkin(id: MuyuSkin): SkinConfig {
  return SKINS.find((s) => s.id === id) || SKINS[0]!;
}

export function getUnlockedSkins(totalMerit: number): MuyuSkin[] {
  return SKINS.filter((s) => totalMerit >= s.meritRequired).map((s) => s.id);
}
