"use client";

import { Link } from "@/i18n/navigation";

const games = [
  {
    id: "karma-slots",
    title: "Karma Slots",
    description: "Spin the spiritual reels and test your cosmic luck. Match sacred symbols for karmic rewards!",
    icon: "🎰",
    cost: 10,
    maxWin: 50,
    status: "live" as const,
  },
  {
    id: "chakra-match",
    title: "Chakra Match",
    description: "Match chakra energies in this memory game. Align your inner light!",
    icon: "🧘",
    cost: 15,
    maxWin: 75,
    status: "coming-soon" as const,
  },
  {
    id: "destiny-dice",
    title: "Destiny Dice",
    description: "Roll the sacred dice and discover your fate. Double or nothing!",
    icon: "🎲",
    cost: 5,
    maxWin: 30,
    status: "coming-soon" as const,
  },
];

export default function ArcadePage() {
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

        {/* Game Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`relative group rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                game.status === "live"
                  ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-purple-950/30 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                  : "border-gray-700/50 bg-gray-900/40 opacity-60"
              }`}
            >
              {/* Glow effect */}
              {game.status === "live" && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              {game.status === "coming-soon" && (
                <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-gray-700 text-gray-400">
                  COMING SOON
                </div>
              )}

              <div className="text-5xl mb-4">{game.icon}</div>
              <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
              <p className="text-gray-400 text-sm mb-4 flex-1">{game.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400">
                  💰 {game.cost} pts/play
                </span>
                <span className="text-purple-400">
                  🏆 Win up to {game.maxWin} pts
                </span>
              </div>

              {game.status === "live" && (
                <Link
                  href={`/arcade/${game.id}`}
                  className="mt-4 block w-full py-3 text-center rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25"
                >
                  Play Now ▶
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
