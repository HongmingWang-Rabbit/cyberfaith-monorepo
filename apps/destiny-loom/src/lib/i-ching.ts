/**
 * I Ching (易经) hexagram casting and data.
 *
 * Uses the three-coin method: toss 3 coins 6 times (bottom to top).
 * Heads=3, Tails=2. Sum of 3 coins:
 *   6 = Old Yin (changing → Yang)
 *   7 = Young Yang (stable)
 *   8 = Young Yin (stable)
 *   9 = Old Yang (changing → Yin)
 */

export type LineType = "yang" | "yin" | "old-yang" | "old-yin";

export interface HexagramLine {
  position: number; // 1 (bottom) to 6 (top)
  value: number; // 6, 7, 8, or 9
  type: LineType;
  changing: boolean;
}

export interface HexagramData {
  number: number;
  name: string;
  chinese: string;
  trigrams: { upper: string; lower: string };
  description: string;
}

export interface CastResult {
  hexagram: HexagramData;
  lines: HexagramLine[];
  changingLines: number[]; // positions (1-6) that are changing
  resultHexagram: HexagramData | null; // hexagram after changes, null if no changes
}

function lineFromValue(value: number, position: number): HexagramLine {
  const types: Record<number, LineType> = {
    6: "old-yin",
    7: "yang",
    8: "yin",
    9: "old-yang",
  };
  return {
    position,
    value,
    type: types[value] || "yang",
    changing: value === 6 || value === 9,
  };
}

/** Toss 3 coins, return sum (6-9) */
function tossCoin(): number {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += Math.random() < 0.5 ? 2 : 3; // tails=2, heads=3
  }
  return sum;
}

/** Convert 6 lines to binary (yang/old-yang=1, yin/old-yin=0) and look up hexagram number */
function linesToBinary(lines: HexagramLine[]): number {
  let binary = 0;
  for (let i = 5; i >= 0; i--) {
    const isYang = lines[i].type === "yang" || lines[i].type === "old-yang";
    binary = (binary << 1) | (isYang ? 1 : 0);
  }
  return binary;
}

function getChangedLines(lines: HexagramLine[]): HexagramLine[] {
  return lines.map((line) => {
    if (!line.changing) return line;
    const newValue = line.value === 6 ? 7 : line.value === 9 ? 8 : line.value;
    return lineFromValue(newValue, line.position);
  });
}

/** Look up hexagram by its binary representation (bottom-to-top, yang=1, yin=0) */
function lookupHexagram(binary: number): HexagramData {
  // The King Wen sequence maps trigram pairs to hexagram numbers.
  // Upper trigram = lines 4-6, lower trigram = lines 1-3
  const upper = (binary >> 3) & 0b111;
  const lower = binary & 0b111;

  // Trigram indices: 000=坤(Earth), 001=震(Thunder), 010=坎(Water), 011=兑(Lake/Marsh)
  //                  100=艮(Mountain), 101=离(Fire), 110=巽(Wind), 111=乾(Heaven)
  // But standard ordering for King Wen lookup uses the traditional trigram order:
  // 乾=111, 兑=011, 离=101, 震=001, 巽=110, 坎=010, 艮=100, 坤=000

  const trigramNames: Record<number, string> = {
    0b111: "Heaven", 0b011: "Lake", 0b101: "Fire", 0b001: "Thunder",
    0b110: "Wind", 0b010: "Water", 0b100: "Mountain", 0b000: "Earth",
  };

  // King Wen sequence lookup table: KING_WEN[upper][lower] = hexagram number
  // Rows/cols ordered: Heaven(111), Lake(011), Fire(101), Thunder(001), Wind(110), Water(010), Mountain(100), Earth(000)
  const ORDER = [0b111, 0b011, 0b101, 0b001, 0b110, 0b010, 0b100, 0b000];
  const KING_WEN = [
    [ 1, 43, 14, 34, 9,  5, 26, 11],
    [10, 58, 38, 54, 61, 60, 41, 19],
    [13, 49, 30, 55, 37, 63, 22, 36],
    [25, 17, 21, 51, 42,  3, 27, 24],
    [44, 28, 50, 32, 57, 48, 18, 46],
    [ 6, 47, 64, 40, 59, 29,  4,  7],
    [33, 31, 56, 62, 53, 39, 52, 15],
    [12, 45, 35, 16, 20,  8, 23,  2],
  ];

  const upperIdx = ORDER.indexOf(upper);
  const lowerIdx = ORDER.indexOf(lower);
  const hexNum = KING_WEN[upperIdx]?.[lowerIdx] ?? 1;

  return {
    number: hexNum,
    name: HEXAGRAM_NAMES[hexNum - 1]?.en ?? `Hexagram ${hexNum}`,
    chinese: HEXAGRAM_NAMES[hexNum - 1]?.zh ?? "",
    trigrams: { upper: trigramNames[upper] ?? "Unknown", lower: trigramNames[lower] ?? "Unknown" },
    description: HEXAGRAM_NAMES[hexNum - 1]?.desc ?? "",
  };
}

export function castHexagram(): CastResult {
  const lines: HexagramLine[] = [];
  for (let i = 1; i <= 6; i++) {
    lines.push(lineFromValue(tossCoin(), i));
  }

  const changingLines = lines.filter((l) => l.changing).map((l) => l.position);
  const hexagram = lookupHexagram(linesToBinary(lines));

  let resultHexagram: HexagramData | null = null;
  if (changingLines.length > 0) {
    const changed = getChangedLines(lines);
    resultHexagram = lookupHexagram(linesToBinary(changed));
  }

  return { hexagram, lines, changingLines, resultHexagram };
}

// Minimal hexagram name table (all 64)
const HEXAGRAM_NAMES: { en: string; zh: string; desc: string }[] = [
  { en: "The Creative", zh: "乾", desc: "Pure creative force, heaven over heaven" },
  { en: "The Receptive", zh: "坤", desc: "Pure receptive force, earth over earth" },
  { en: "Difficulty at the Beginning", zh: "屯", desc: "Thunder over water, birth pains" },
  { en: "Youthful Folly", zh: "蒙", desc: "Mountain over water, inexperience" },
  { en: "Waiting", zh: "需", desc: "Water over heaven, patient nourishment" },
  { en: "Conflict", zh: "讼", desc: "Heaven over water, dispute" },
  { en: "The Army", zh: "师", desc: "Earth over water, organized discipline" },
  { en: "Holding Together", zh: "比", desc: "Water over earth, union" },
  { en: "Small Taming", zh: "小畜", desc: "Wind over heaven, gentle restraint" },
  { en: "Treading", zh: "履", desc: "Heaven over lake, careful conduct" },
  { en: "Peace", zh: "泰", desc: "Earth over heaven, harmony" },
  { en: "Standstill", zh: "否", desc: "Heaven over earth, stagnation" },
  { en: "Fellowship", zh: "同人", desc: "Heaven over fire, community" },
  { en: "Great Possession", zh: "大有", desc: "Fire over heaven, abundance" },
  { en: "Modesty", zh: "谦", desc: "Earth over mountain, humility" },
  { en: "Enthusiasm", zh: "豫", desc: "Thunder over earth, joy" },
  { en: "Following", zh: "随", desc: "Lake over thunder, adapting" },
  { en: "Work on the Decayed", zh: "蛊", desc: "Mountain over wind, repair" },
  { en: "Approach", zh: "临", desc: "Earth over lake, becoming great" },
  { en: "Contemplation", zh: "观", desc: "Wind over earth, viewing" },
  { en: "Biting Through", zh: "噬嗑", desc: "Fire over thunder, decisive action" },
  { en: "Grace", zh: "贲", desc: "Mountain over fire, adornment" },
  { en: "Splitting Apart", zh: "剥", desc: "Mountain over earth, deterioration" },
  { en: "Return", zh: "复", desc: "Earth over thunder, renewal" },
  { en: "Innocence", zh: "无妄", desc: "Heaven over thunder, the unexpected" },
  { en: "Great Taming", zh: "大畜", desc: "Mountain over heaven, great accumulation" },
  { en: "Nourishment", zh: "颐", desc: "Mountain over thunder, providing" },
  { en: "Great Exceeding", zh: "大过", desc: "Lake over wind, critical mass" },
  { en: "The Abysmal", zh: "坎", desc: "Water over water, repeated danger" },
  { en: "The Clinging", zh: "离", desc: "Fire over fire, radiance" },
  { en: "Influence", zh: "咸", desc: "Lake over mountain, attraction" },
  { en: "Duration", zh: "恒", desc: "Thunder over wind, perseverance" },
  { en: "Retreat", zh: "遁", desc: "Heaven over mountain, withdrawal" },
  { en: "Great Power", zh: "大壮", desc: "Thunder over heaven, great strength" },
  { en: "Progress", zh: "晋", desc: "Fire over earth, advancement" },
  { en: "Darkening of the Light", zh: "明夷", desc: "Earth over fire, concealment" },
  { en: "The Family", zh: "家人", desc: "Wind over fire, domestic order" },
  { en: "Opposition", zh: "睽", desc: "Fire over lake, divergence" },
  { en: "Obstruction", zh: "蹇", desc: "Water over mountain, difficulty" },
  { en: "Deliverance", zh: "解", desc: "Thunder over water, release" },
  { en: "Decrease", zh: "损", desc: "Mountain over lake, sacrifice" },
  { en: "Increase", zh: "益", desc: "Wind over thunder, augmentation" },
  { en: "Breakthrough", zh: "夬", desc: "Lake over heaven, determination" },
  { en: "Coming to Meet", zh: "姤", desc: "Heaven over wind, encounter" },
  { en: "Gathering Together", zh: "萃", desc: "Lake over earth, collection" },
  { en: "Pushing Upward", zh: "升", desc: "Earth over wind, ascending" },
  { en: "Oppression", zh: "困", desc: "Lake over water, exhaustion" },
  { en: "The Well", zh: "井", desc: "Water over wind, inexhaustible source" },
  { en: "Revolution", zh: "革", desc: "Lake over fire, transformation" },
  { en: "The Cauldron", zh: "鼎", desc: "Fire over wind, nourishing the new" },
  { en: "The Arousing", zh: "震", desc: "Thunder over thunder, shock" },
  { en: "Keeping Still", zh: "艮", desc: "Mountain over mountain, meditation" },
  { en: "Development", zh: "渐", desc: "Wind over mountain, gradual progress" },
  { en: "The Marrying Maiden", zh: "归妹", desc: "Thunder over lake, affinity" },
  { en: "Abundance", zh: "丰", desc: "Thunder over fire, fullness" },
  { en: "The Wanderer", zh: "旅", desc: "Fire over mountain, travel" },
  { en: "The Gentle", zh: "巽", desc: "Wind over wind, penetrating" },
  { en: "The Joyous", zh: "兑", desc: "Lake over lake, delight" },
  { en: "Dispersion", zh: "涣", desc: "Wind over water, dissolution" },
  { en: "Limitation", zh: "节", desc: "Water over lake, restraint" },
  { en: "Inner Truth", zh: "中孚", desc: "Wind over lake, sincerity" },
  { en: "Small Exceeding", zh: "小过", desc: "Thunder over mountain, small surplus" },
  { en: "After Completion", zh: "既济", desc: "Water over fire, accomplished" },
  { en: "Before Completion", zh: "未济", desc: "Fire over water, not yet fulfilled" },
];
