"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getGameComponent } from "@/components/arcade/registry";
import type { GameDefinition, PlayResult } from "@/components/arcade/types";

export default function ArcadeGamePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [game, setGame] = useState<GameDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch game definition
  useEffect(() => {
    fetch("/api/arcade/games")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const found = d.data.find((g: GameDefinition) => g.slug === slug);
          if (found && found.status === "active") {
            setGame(found);
          } else {
            setError("Game not found or not active");
          }
        } else {
          setError("Failed to load games");
        }
      })
      .catch(() => setError("Failed to load games"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch balance
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    fetch("/api/points", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBalance(d.data.total);
      })
      .catch(() => {});
  }, []);

  const handlePlay = useCallback(
    async (input?: Record<string, any>): Promise<PlayResult | null> => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Please sign in to play");
        return null;
      }
      setIsPlaying(true);
      try {
        const res = await fetch("/api/arcade/play", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ gameSlug: slug, input }),
        });
        const d = await res.json();
        if (d.success) {
          return d.data as PlayResult;
        }
        setError(d.message || "Play failed");
        return null;
      } catch {
        setError("Play failed — try again");
        return null;
      } finally {
        setIsPlaying(false);
      }
    },
    [slug],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error || "Game not found"}</p>
        <Link href="/arcade" className="text-cyan-400 hover:underline">
          ← Back to Arcade
        </Link>
      </div>
    );
  }

  const GameComponent = getGameComponent(slug);
  if (!GameComponent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Game component not available yet</p>
        <Link href="/arcade" className="text-cyan-400 hover:underline">
          ← Back to Arcade
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/arcade" className="text-cyan-400 hover:underline text-sm">
            ← Back to Arcade
          </Link>
          {balance !== null && (
            <div className="text-sm text-gray-400">
              Balance: <span className="text-cyan-400 font-bold">{balance} pts</span>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {game.thumbnail} {game.name}
          </h1>
          <p className="text-gray-400">{game.description}</p>
        </div>

        {/* Game Component */}
        <GameComponent
          config={game.config}
          balance={balance}
          onBalanceChange={setBalance}
          onPlay={handlePlay}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
}
