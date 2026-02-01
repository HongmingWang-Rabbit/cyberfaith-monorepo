/**
 * Server-side game engine interface.
 * Each game registers an engine that takes config + optional input,
 * runs the game logic, and returns the result + points won.
 */
export interface GameResult {
  /** Points the player won (0 for a loss) */
  pointsWon: number;
  /** Arbitrary result data sent to the client for rendering */
  outcome: Record<string, any>;
}

export interface GameConfig {
  minBet: number;
  maxWin: number;
  [key: string]: any;
}

/**
 * A game engine function.
 * @param config - The game's config from the DB
 * @param input - Optional player input (e.g. chosen bet amount, selected options)
 * @returns The game result with points won and outcome data
 */
export type GameEngine = (config: GameConfig, input?: Record<string, any>) => GameResult;
