"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";

const TYPE_ICONS: Record<string, string> = {
  tarot_stranger: "🃏",
  meditation: "🧘",
  journaling: "📓",
  share_reading: "📤",
  kindness: "💝",
  divination: "🔮",
  reflection: "🌙",
  community: "👥",
};

interface DailyChallengeProps {
  token?: string | null;
}

interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  karmaReward: number;
  date: string;
}

export function DailyChallenge({ token }: DailyChallengeProps) {
  const t = useTranslations("challenges");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [karmaEarned, setKarmaEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch("/api/challenges/today", { headers });
        if (res.ok) {
          const json = await res.json();
          setChallenge(json.data?.challenge || null);
          setCompleted(json.data?.completed || false);
        }
      } catch (e) {
        console.error("Failed to fetch challenge:", e);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [token]);

  async function handleComplete() {
    if (!token || !challenge || completed || completing) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const json = await res.json();
        setCompleted(true);
        setKarmaEarned(json.data?.karmaAwarded || challenge.karmaReward);
      }
    } catch (e) {
      console.error("Failed to complete challenge:", e);
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return null;
  if (!challenge) return null;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TYPE_ICONS[challenge.type] || "⚡"}</span>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("dailyChallenge")}
              </h3>
              <p className="text-xs text-muted-foreground">{t("earnKarma", { amount: challenge.karmaReward })}</p>
            </div>
          </div>
          {completed && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
              ✓ {t("completed")}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-medium text-foreground">{challenge.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
        </div>

        {!completed && token && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {completing ? t("completing") : t("markComplete")}
          </button>
        )}

        {completed && karmaEarned > 0 && (
          <div className="text-center text-sm text-amber-400 animate-pulse">
            +{karmaEarned} {t("karma")} ✨
          </div>
        )}
      </CardContent>
    </Card>
  );
}
