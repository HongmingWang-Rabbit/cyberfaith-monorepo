"use client";

import { useState } from "react";
import { FortuneCookie } from "@/components/fortune-cookie";
import { DestinyWheel } from "@/components/destiny-wheel";
import { MeditationTimer } from "@/components/meditation-timer";
import { t, setLocale, getLocale } from "@/lib/i18n";

type GameId = "home" | "fortune-cookie" | "destiny-wheel" | "meditation";

const GAMES = [
  {
    id: "fortune-cookie" as const,
    emoji: "🥠",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    id: "destiny-wheel" as const,
    emoji: "🎡",
    gradient: "from-purple-500 to-indigo-500",
    shadow: "shadow-purple-500/20",
  },
  {
    id: "meditation" as const,
    emoji: "🧘",
    gradient: "from-teal-500 to-cyan-500",
    shadow: "shadow-teal-500/20",
  },
];

export default function Home() {
  const [currentGame, setCurrentGame] = useState<GameId>("home");
  const [locale, setLoc] = useState(getLocale());

  const toggleLocale = () => {
    const next = locale === "en" ? "zh" as const : "en" as const;
    setLocale(next);
    setLoc(next);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer"
          onClick={() => setCurrentGame("home")}
        >
          ✦ {t("common.title")}
        </h1>
        <button
          onClick={toggleLocale}
          className="px-3 py-1 text-sm bg-white/5 rounded-full hover:bg-white/10 transition-all"
        >
          {locale === "en" ? "中文" : "EN"}
        </button>
      </header>

      {/* Game area */}
      {currentGame === "home" ? (
        <div className="flex flex-col items-center gap-8 px-6 py-16">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {t("common.title")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Earn karma, discover wisdom, and find your inner peace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
            {GAMES.map((game) => {
              const titleKey = game.id === "fortune-cookie" ? "fortuneCookie" : game.id === "destiny-wheel" ? "destinyWheel" : "meditation";
              return (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id)}
                  className={`
                    p-8 rounded-2xl bg-white/5 border border-white/10
                    hover:bg-white/10 hover:border-white/20 transition-all
                    shadow-lg ${game.shadow} hover:scale-105
                    flex flex-col items-center gap-4
                  `}
                >
                  <span className="text-5xl">{game.emoji}</span>
                  <span className={`text-lg font-bold bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`}>
                    {t(`${titleKey}.title`)}
                  </span>
                  <span className="text-sm text-muted-foreground">{t(`${titleKey}.subtitle`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="px-6">
          <button
            onClick={() => setCurrentGame("home")}
            className="mt-4 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            ← {t("common.backToArcade")}
          </button>

          {currentGame === "fortune-cookie" && <FortuneCookie />}
          {currentGame === "destiny-wheel" && <DestinyWheel />}
          {currentGame === "meditation" && <MeditationTimer />}
        </div>
      )}
    </main>
  );
}
