/**
 * Four Pillars of Destiny (四柱命理 / BaZi) calculation engine.
 *
 * Uses the sexagenary cycle (Heavenly Stems × Earthly Branches) to derive
 * Year, Month, Day, and Hour pillars from a Gregorian date.
 */

export const HEAVENLY_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
] as const;

export const HEAVENLY_STEMS_EN = [
  "Jiǎ", "Yǐ", "Bǐng", "Dīng", "Wù", "Jǐ", "Gēng", "Xīn", "Rén", "Guǐ",
] as const;

export const EARTHLY_BRANCHES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;

export const EARTHLY_BRANCHES_EN = [
  "Zǐ", "Chǒu", "Yín", "Mǎo", "Chén", "Sì", "Wǔ", "Wèi", "Shēn", "Yǒu", "Xū", "Hài",
] as const;

export const STEM_ELEMENTS = [
  "Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water",
] as const;

export const BRANCH_ELEMENTS = [
  "Water", "Earth", "Wood", "Wood", "Earth", "Fire",
  "Fire", "Earth", "Metal", "Metal", "Earth", "Water",
] as const;

export const BRANCH_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
] as const;

export interface Pillar {
  stem: { index: number; chinese: string; pinyin: string; element: string };
  branch: { index: number; chinese: string; pinyin: string; element: string; animal: string };
}

export interface FourPillarsResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dominantElements: Record<string, number>;
}

function makePillar(stemIdx: number, branchIdx: number): Pillar {
  const si = ((stemIdx % 10) + 10) % 10;
  const bi = ((branchIdx % 12) + 12) % 12;
  return {
    stem: { index: si, chinese: HEAVENLY_STEMS[si], pinyin: HEAVENLY_STEMS_EN[si], element: STEM_ELEMENTS[si] },
    branch: { index: bi, chinese: EARTHLY_BRANCHES[bi], pinyin: EARTHLY_BRANCHES_EN[bi], element: BRANCH_ELEMENTS[bi], animal: BRANCH_ANIMALS[bi] },
  };
}

/**
 * Year pillar: The sexagenary cycle starts with 甲子 at year 4 CE.
 * stemIndex = (year - 4) % 10, branchIndex = (year - 4) % 12
 *
 * Note: The Chinese new year starts around Feb 4 (Lichun). For simplicity,
 * if month < 2 (i.e. Jan), we use the previous year's pillar.
 */
export function yearPillar(year: number, month: number): Pillar {
  const y = month < 2 ? year - 1 : year;
  return makePillar((y - 4) % 10, (y - 4) % 12);
}

/**
 * Month pillar: branch is fixed by month (寅=1st month starts at index 2).
 * Stem is derived from the year stem using the Five Tigers formula.
 * Lichun boundaries approximated: month 1 → branch 2 (寅), etc.
 */
export function monthPillar(year: number, month: number): Pillar {
  const y = month < 2 ? year - 1 : year;
  // Chinese month: Jan→12th month of prev year, Feb→1st month, Mar→2nd, ...
  const chineseMonth = month < 2 ? 12 : month - 1; // 1-12
  const branchIdx = (chineseMonth + 1) % 12; // month 1 → branch 2 (寅)

  // Five Tigers (五虎遁月) — year stem determines the starting month stem
  const yearStemIdx = ((y - 4) % 10 + 10) % 10;
  const startStem = (yearStemIdx % 5) * 2; // 甲/己→丙(2), 乙/庚→戊(4), etc.
  const stemIdx = (startStem + chineseMonth - 1) % 10;

  return makePillar(stemIdx, branchIdx);
}

/**
 * Day pillar: Uses a simplified algorithm based on Julian Day Number.
 * JDN for a date, then stemIdx = (JDN - 1) % 10, branchIdx = (JDN - 1) % 12
 * (adjusted so that Jan 1, 2000 = 甲午 stem=0, branch=6 → JDN offset)
 */
function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function dayPillar(year: number, month: number, day: number): Pillar {
  const jdn = julianDayNumber(year, month, day);
  // Calibration: Jan 1, 2000 (JDN 2451545) is 甲午 (stem=0, branch=6)
  // So stemOffset = (2451545 - 1) % 10 should give 0 → offset = jdn - 1
  // Actually: (2451545) % 10 = 5, and we want stem=0, so shift = jdn - 2451545 + 0
  // stemIdx = (jdn + 9) % 10 and branchIdx = (jdn + 1) % 12 (calibrated empirically)
  // Let's calibrate: 2000-01-01 should be 甲午 (stem=0, branch=6)
  // jdn=2451545. stemIdx=(2451545+offset)%10=0 → offset=5 → (jdn+5)%10? 2451550%10=0 ✓
  // branchIdx=(2451545+offset2)%12=6 → 2451545%12=1, 1+5=6 → offset2=5
  const stemIdx = (jdn + 5) % 10;
  const branchIdx = (jdn + 5) % 12;
  return makePillar(stemIdx, branchIdx);
}

/**
 * Hour pillar: Each Chinese "hour" (时辰) spans 2 Western hours.
 * 子时 = 23:00-01:00, 丑时 = 01:00-03:00, etc.
 * Stem uses Five Rats (五鼠遁时) from the day stem.
 */
export function hourPillar(year: number, month: number, day: number, hour: number): Pillar {
  // Branch from hour: 23-1→0(子), 1-3→1(丑), ... formula: ((hour+1)/2) % 12
  const branchIdx = Math.floor(((hour + 1) % 24) / 2);

  // Five Rats: day stem determines starting hour stem
  const dp = dayPillar(year, month, day);
  const dayStemIdx = dp.stem.index;
  const startStem = (dayStemIdx % 5) * 2;
  const stemIdx = (startStem + branchIdx) % 10;

  return makePillar(stemIdx, branchIdx);
}

export function calculateFourPillars(
  year: number, month: number, day: number, hour: number
): FourPillarsResult {
  const yp = yearPillar(year, month);
  const mp = monthPillar(year, month);
  const dp = dayPillar(year, month, day);
  const hp = hourPillar(year, month, day, hour);

  // Count elements
  const elements: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const p of [yp, mp, dp, hp]) {
    elements[p.stem.element] = (elements[p.stem.element] || 0) + 1;
    elements[p.branch.element] = (elements[p.branch.element] || 0) + 1;
  }

  return { year: yp, month: mp, day: dp, hour: hp, dominantElements: elements };
}
