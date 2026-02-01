/**
 * Standard interface every arcade game component implements.
 */
export interface ArcadeGameProps {
  /** Game config from the DB */
  config: GameConfig;
  /** Current point balance (null if not loaded) */
  balance: number | null;
  /** Called when balance changes after a play */
  onBalanceChange: (newBalance: number) => void;
  /** Called to play — sends request to API, returns result */
  onPlay: (input?: Record<string, any>) => Promise<PlayResult | null>;
  /** Whether a play request is in flight */
  isPlaying: boolean;
}

export interface GameConfig {
  minBet: number;
  maxWin: number;
  [key: string]: any;
}

export interface PlayResult {
  pointsWon: number;
  pointsSpent: number;
  netPoints: number;
  result: Record<string, any>;
}

export interface GameDefinition {
  slug: string;
  name: string;
  description: string;
  thumbnail: string;
  config: GameConfig;
  status: string;
}
