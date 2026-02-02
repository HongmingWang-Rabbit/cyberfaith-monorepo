"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const typeIcons: Record<string, string> = {
  mbti: "🧠", tarot: "🃏", "i-ching": "☯️", "four-pillars": "🏛️", zodiac: "⭐", dream: "🌙",
};

interface FeaturedReading {
  id: string;
  type: string;
  result: any;
  createdAt: string;
  authorName: string;
  authorUsername: string | null;
  authorAvatar: string | null;
  authorId: string;
}

function getSnippet(type: string, result: any): string {
  if (!result) return "";
  if (type === "mbti" && result.type) return `Type: ${result.type}`;
  if (type === "tarot" && result.interpretation) return result.interpretation.slice(0, 150) + "…";
  if (type === "zodiac" && result.sign) return `Sign: ${result.sign}`;
  if (result.summary) return result.summary.slice(0, 150) + "…";
  return "";
}

export function FeaturedReading() {
  const t = useTranslations("featured");
  const [reading, setReading] = useState<FeaturedReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/readings/featured`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setReading(json?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !reading) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-br from-card via-card to-yellow-500/5 p-6 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
      {/* Badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">
          ⭐ {t("badge")}
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Author avatar */}
        {reading.authorAvatar ? (
          <img src={reading.authorAvatar} alt="" className="w-12 h-12 rounded-full border-2 border-yellow-500/30" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl">
            {typeIcons[reading.type] || "✨"}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[reading.type] || "✨"}</span>
            <span className="text-sm font-medium text-muted-foreground capitalize">{reading.type.replace("-", " ")}</span>
          </div>

          <p className="text-sm text-foreground/80 line-clamp-3">
            {getSnippet(reading.type, reading.result)}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {t("by")}{" "}
              {reading.authorUsername ? (
                <Link href={`/user/${reading.authorUsername}`} className="text-primary hover:underline">
                  {reading.authorName}
                </Link>
              ) : (
                <span>{reading.authorName}</span>
              )}
            </div>
            <Link
              href={`/share/${reading.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 font-medium hover:bg-yellow-500/20 transition"
            >
              {t("view")} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
