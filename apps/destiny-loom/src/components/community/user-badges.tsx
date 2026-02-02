"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Badge {
  badgeKey: string;
  title: string;
  icon: string;
  earnedAt: string;
}

interface UserBadgesProps {
  userId: string;
}

export function UserBadges({ userId }: UserBadgesProps) {
  const t = useTranslations("badges");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/badges/user/${userId}`);
        if (res.ok) {
          const json = await res.json();
          setBadges(json.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return null;
  if (badges.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
        🎖️ {t("title")}
      </h4>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <div
            key={badge.badgeKey}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-foreground"
            title={`${t("earned")} ${new Date(badge.earnedAt).toLocaleDateString()}`}
          >
            <span>{badge.icon}</span>
            <span>{badge.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
