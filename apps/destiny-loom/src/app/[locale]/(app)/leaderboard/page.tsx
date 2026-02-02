"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { LevelBadge, getLevelFromKarma } from "@/components/levels/level-badge";

const CORE_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Period = "weekly" | "monthly" | "all";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  zodiacSign: string | null;
  karma: number;
}

const zodiacEmoji: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const rankGlow = [
  "", // rank 0 placeholder
  "shadow-[0_0_20px_rgba(255,215,0,0.4)] border-yellow-500/40", // gold
  "shadow-[0_0_20px_rgba(192,192,192,0.3)] border-gray-400/40", // silver
  "shadow-[0_0_20px_rgba(205,127,50,0.3)] border-orange-600/40", // bronze
];

const rankBadge = ["", "🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const { user, isAuthenticated, session } = useAuth();
  const [period, setPeriod] = useState<Period>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${CORE_API_URL}/leaderboard?period=${period}&limit=50`);
        if (res.ok) {
          const json = await res.json();
          setEntries(json.data || []);
        }

        const token = session?.tokens?.accessToken;
        if (isAuthenticated && token) {
          const meRes = await fetch(`${CORE_API_URL}/leaderboard/me?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meJson = await meRes.json();
            setMyRank(meJson.data || null);
          }
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, [period, isAuthenticated, session]);

  const periods: { key: Period; label: string }[] = [
    { key: "weekly", label: t("weekly") },
    { key: "monthly", label: t("monthly") },
    { key: "all", label: t("allTime") },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          🏆 {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Period tabs */}
      <div className="flex justify-center gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p.key
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[var(--glow-purple)]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Leaderboard list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("empty")}</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur-sm transition-all ${
                entry.rank <= 3
                  ? `${rankGlow[entry.rank]} border-2`
                  : "border-border/50"
              }`}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {entry.rank <= 3 ? (
                  <span className="text-2xl">{rankBadge[entry.rank]}</span>
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              {entry.avatarUrl ? (
                <img
                  src={entry.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full border border-primary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  👤
                </div>
              )}

              {/* Name + zodiac */}
              <div className="flex-1 min-w-0">
                {entry.username ? (
                  <Link
                    href={`/user/${entry.username}`}
                    className="font-semibold text-foreground hover:text-primary transition truncate block"
                  >
                    {entry.displayName}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground truncate block">
                    {entry.displayName}
                  </span>
                )}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <LevelBadge level={getLevelFromKarma(entry.karma)} size="xs" />
                  {entry.zodiacSign && (
                    <span className="text-xs text-muted-foreground">
                      {zodiacEmoji[entry.zodiacSign] || ""} {entry.zodiacSign}
                    </span>
                  )}
                </div>
              </div>

              {/* Karma */}
              <div className="text-right">
                <span className="font-bold text-primary text-lg">{entry.karma.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-1">{t("karma")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Your rank card */}
      {isAuthenticated && myRank && (
        <div className="sticky bottom-4 p-4 rounded-xl border-2 border-primary/30 bg-card/90 backdrop-blur-md shadow-[var(--glow-purple)] flex items-center gap-4">
          <div className="w-10 text-center">
            <span className="text-lg font-bold text-primary">#{myRank.rank}</span>
          </div>
          {myRank.avatarUrl ? (
            <img src={myRank.avatarUrl} alt="" className="w-10 h-10 rounded-full border border-primary/20" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">👤</div>
          )}
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground truncate block">{t("yourRank")}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-primary text-lg">{myRank.karma.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-1">{t("karma")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
