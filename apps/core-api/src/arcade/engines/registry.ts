import type { GameEngine } from "./types";
import { karmaSlotsEngine } from "./karma-slots";

/**
 * Server-side game engine registry.
 * Maps game slug → engine function.
 *
 * To add a new game:
 * 1. Create engine file in this directory
 * 2. Register it here
 * 3. Add a row to the `games` table (seed or migration)
 * 4. Add a React component to the frontend game registry
 */
const engineRegistry: Record<string, GameEngine> = {
  "karma-slots": karmaSlotsEngine,
};

export function getGameEngine(slug: string): GameEngine | undefined {
  return engineRegistry[slug];
}

export function getRegisteredSlugs(): string[] {
  return Object.keys(engineRegistry);
}
