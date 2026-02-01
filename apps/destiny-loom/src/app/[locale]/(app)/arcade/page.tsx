"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { hasGameComponent } from "@/components/arcade/registry";
import type { GameDefinition } from "@/components/arcade/types";

export default function ArcadePage() {
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arcade/games")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setGames(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🕹️ Spirit Arcade
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Test your cosmic luck with spiritual mini-games. Spend points, win big, and discover your karmic fortune.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-700/50 bg-gray-900/40 p-6 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Game Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const hasComponent = hasGameComponent(game.slug);
              const playable = game.status === "active" && hasComponent;

              return (
                <div
                  key={game.slug}
                  className={`relative group rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                    playable
                      ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-purple-950/30 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                      : "border-gray-700/50 bg-gray-900/40 opacity-60"
                  }`}
                >
                  {playable && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  {!playable && (
                    <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-gray-700 text-gray-400">
                      COMING SOON
                    </div>
                  )}

                  <div className="text-5xl mb-4">{game.thumbnail}</div>
                  <h2 className="text-xl font-bold text-white mb-2">{game.name}</h2>
                  <p className="text-gray-400 text-sm mb-4 flex-1">{game.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-400">
                      💰 {game.config.minBet} pts/play
                    </span>
                    <span className="text-purple-400">
                      🏆 Win up to {game.config.maxWin} pts
                    </span>
                  </div>

                  {playable && (
                    <Link
                      href={`/arcade/${game.slug}`}
                      className="mt-4 block w-full py-3 text-center rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25"
                    >
                      Play Now ▶
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {games.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <p className="text-2xl mb-2">🎮</p>
                <p>No games available yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
