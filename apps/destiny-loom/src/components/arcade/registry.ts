import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ArcadeGameProps } from "./types";

/**
 * Frontend game component registry.
 * Maps game slug → lazy-loaded React component.
 *
 * To add a new game:
 * 1. Create a component in ./games/ implementing ArcadeGameProps
 * 2. Register it here with dynamic()
 * 3. Add a row to the `games` table on the backend
 * 4. Add an engine in core-api/src/arcade/engines/
 */
const gameRegistry: Record<string, ComponentType<ArcadeGameProps>> = {
  "karma-slots": dynamic(() => import("./games/karma-slots"), { ssr: false }),
  // Note: muyu has its own dedicated page at /arcade/muyu — not using the generic [slug] wrapper
};

export function getGameComponent(slug: string): ComponentType<ArcadeGameProps> | undefined {
  return gameRegistry[slug];
}

export function hasGameComponent(slug: string): boolean {
  return slug in gameRegistry;
}
