"use client";

import { SKINS, getUnlockedSkins, type MuyuSkin } from "./skins";
import { useLocale } from "next-intl";

interface MuyuSkinPickerProps {
  activeSkin: MuyuSkin;
  onSkinChange: (skin: MuyuSkin) => void;
  totalMerit: number;
}

export function MuyuSkinPicker({ activeSkin, onSkinChange, totalMerit }: MuyuSkinPickerProps) {
  const locale = useLocale();
  const unlocked = getUnlockedSkins(totalMerit);

  return (
    <div className="mt-6">
      <h3 className="text-sm text-gray-500 mb-2 text-center">
        {locale === "zh" ? "皮肤" : "Skins"}
      </h3>
      <div className="flex justify-center gap-3">
        {SKINS.map((skin) => {
          const isUnlocked = unlocked.includes(skin.id);
          const isActive = activeSkin === skin.id;

          return (
            <button
              key={skin.id}
              onClick={() => isUnlocked && onSkinChange(skin.id)}
              disabled={!isUnlocked}
              className={`relative w-12 h-12 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-white shadow-lg"
                  : isUnlocked
                    ? "border-gray-700 hover:border-gray-500"
                    : "border-gray-800 opacity-40 cursor-not-allowed"
              }`}
              style={{
                background: `linear-gradient(135deg, ${skin.gradientFrom}, ${skin.gradientTo})`,
                boxShadow: isActive ? `0 0 12px ${skin.glow}` : undefined,
              }}
              title={
                isUnlocked
                  ? locale === "zh" ? skin.nameZh : skin.name
                  : `${locale === "zh" ? skin.nameZh : skin.name} (${skin.meritRequired.toLocaleString()} ${locale === "zh" ? "功德" : "merit"})`
              }
            >
              {!isUnlocked && (
                <span className="absolute inset-0 flex items-center justify-center text-xs">🔒</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
