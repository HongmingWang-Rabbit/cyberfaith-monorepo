import type { GameEngine, GameResult, GameConfig } from "./types";

export interface KarmaSlotsConfig extends GameConfig {
  symbols: string[];
  reelCount: number;
  payoutRules: {
    threeMatch: number;
    twoMatch: number;
  };
}

export const karmaSlotsEngine: GameEngine = (config: GameConfig, _input?: Record<string, any>): GameResult => {
  const c = config as KarmaSlotsConfig;
  const symbols = c.symbols || ["🔮", "✨", "🌟", "☯️", "🧿", "💫", "🪬", "🌙"];
  const reelCount = c.reelCount || 3;
  const payoutRules = c.payoutRules || { threeMatch: 50, twoMatch: 20 };

  // Spin reels
  const reels: string[] = [];
  for (let i = 0; i < reelCount; i++) {
    reels.push(symbols[Math.floor(Math.random() * symbols.length)]!);
  }

  // Calculate matches
  const unique = new Set(reels);
  let matches = 0;
  let pointsWon = 0;

  if (unique.size === 1) {
    matches = reelCount;
    pointsWon = payoutRules.threeMatch;
  } else if (unique.size === reelCount - 1) {
    matches = 2;
    pointsWon = payoutRules.twoMatch;
  }

  return {
    pointsWon,
    outcome: { reels, matches, pointsWon },
  };
};
