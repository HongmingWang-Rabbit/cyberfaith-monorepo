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
    <div className="flex justify-center gap-3 mt-6">
      {SKINS.map((skin) => {
        const isUnlocked = unlocked.includes(skin.id);
        const isActive = activeSkin === skin.id;

        return (
          <button
            key={skin.id}
            onClick={() => isUnlocked && onSkinChange(skin.id)}
            disabled={!isUnlocked}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              isActive
                ? "border-amber-200/60 scale-110"
                : isUnlocked
                  ? "border-neutral-700 hover:border-neutral-500"
                  : "border-neutral-800 opacity-30 cursor-not-allowed"
            }`}
            style={{ background: skin.bodyColor }}
            title={
              isUnlocked
                ? locale === "zh" ? skin.nameZh : skin.name
                : `${skin.meritRequired.toLocaleString()} ${locale === "zh" ? "功德" : "merit"}`
            }
          >
            {!isUnlocked && (
              <span className="text-[10px]">🔒</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
