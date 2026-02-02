/**
 * Feng Shui utilities — Chinese element cycle based on birth year
 */

const ELEMENTS = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"] as const;

/** Determine the Chinese element from birth year */
export function getChineseElement(birthYear: number): string {
  // The cycle is based on the last digit of the year
  const lastDigit = birthYear % 10;
  return ELEMENTS[lastDigit];
}

export const ROOM_TYPES = ["bedroom", "office", "living", "kitchen", "bathroom"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const COMPASS_DIRECTIONS = [
  "north", "northeast", "east", "southeast",
  "south", "southwest", "west", "northwest",
] as const;
export type CompassDirection = (typeof COMPASS_DIRECTIONS)[number];
