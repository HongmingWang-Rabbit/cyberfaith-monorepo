/**
 * Numerology calculation utilities
 * Pythagorean number system for name-based calculations
 */

const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Reduce a number to a single digit (or master number 11, 22, 33) */
export function reduceToSingle(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

/** Life Path Number: sum all digits of birthdate */
export function calculateLifePathNumber(birthdate: string): number {
  const digits = birthdate.replace(/\D/g, "");
  const sum = digits.split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceToSingle(sum);
}

/** Expression Number: sum all letters of full name */
export function calculateExpressionNumber(fullName: string): number {
  const sum = fullName
    .toLowerCase()
    .split("")
    .filter((c) => PYTHAGOREAN_MAP[c] !== undefined)
    .reduce((acc, c) => acc + PYTHAGOREAN_MAP[c], 0);
  return reduceToSingle(sum);
}

/** Soul Urge Number: sum only vowels of full name */
export function calculateSoulUrgeNumber(fullName: string): number {
  const sum = fullName
    .toLowerCase()
    .split("")
    .filter((c) => VOWELS.has(c))
    .reduce((acc, c) => acc + PYTHAGOREAN_MAP[c], 0);
  return reduceToSingle(sum);
}

export interface NumerologyResult {
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
}

export function calculateNumerology(fullName: string, birthdate: string): NumerologyResult {
  return {
    lifePathNumber: calculateLifePathNumber(birthdate),
    expressionNumber: calculateExpressionNumber(fullName),
    soulUrgeNumber: calculateSoulUrgeNumber(fullName),
  };
}
