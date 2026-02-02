/**
 * Simplified birth chart calculator using astronomical approximations.
 * Uses the tropical zodiac with simplified planetary position calculations.
 */

export interface BirthChartInput {
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  location: string;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  interpretation: string;
}

export interface BirthChartResult {
  input: BirthChartInput;
  planets: PlanetPosition[];
  houses: number[]; // degree of each house cusp (12)
  dominantElement: string;
  dominantModality: string;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const SIGN_MODALITIES: Record<string, string> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
};

const INTERPRETATIONS: Record<string, Record<string, string>> = {
  Sun: {
    Aries: "Bold leadership energy, pioneering spirit",
    Taurus: "Grounded determination, sensual appreciation",
    Gemini: "Curious intellect, communicative nature",
    Cancer: "Nurturing soul, deep emotional intuition",
    Leo: "Radiant confidence, creative expression",
    Virgo: "Analytical precision, service-oriented",
    Libra: "Harmonious diplomacy, aesthetic sense",
    Scorpio: "Transformative intensity, profound depth",
    Sagittarius: "Adventurous wisdom, philosophical explorer",
    Capricorn: "Ambitious discipline, structural mastery",
    Aquarius: "Innovative vision, humanitarian ideals",
    Pisces: "Mystical compassion, transcendent imagination",
  },
  Moon: {
    Aries: "Emotionally impulsive, needs independence",
    Taurus: "Emotionally stable, seeks comfort and security",
    Gemini: "Emotionally versatile, needs mental stimulation",
    Cancer: "Deeply intuitive, nurturing emotional nature",
    Leo: "Emotionally dramatic, needs recognition",
    Virgo: "Emotionally reserved, finds comfort in order",
    Libra: "Emotionally balanced, needs harmony in relationships",
    Scorpio: "Emotionally intense, transformative inner life",
    Sagittarius: "Emotionally free-spirited, optimistic outlook",
    Capricorn: "Emotionally disciplined, needs achievement",
    Aquarius: "Emotionally detached, needs intellectual freedom",
    Pisces: "Emotionally sensitive, deeply empathetic nature",
  },
  Mercury: {
    Aries: "Quick, assertive communication style",
    Taurus: "Deliberate, practical thinking",
    Gemini: "Brilliant, versatile mental agility",
    Cancer: "Intuitive, memory-driven thought",
    Leo: "Creative, dramatic expression",
    Virgo: "Precise, analytical mind",
    Libra: "Diplomatic, balanced perspective",
    Scorpio: "Penetrating, investigative thinking",
    Sagittarius: "Expansive, philosophical reasoning",
    Capricorn: "Structured, strategic planning",
    Aquarius: "Innovative, unconventional ideas",
    Pisces: "Imaginative, poetic communication",
  },
  Venus: {
    Aries: "Passionate, spontaneous in love",
    Taurus: "Sensual, devoted in relationships",
    Gemini: "Flirtatious, intellectually attracted",
    Cancer: "Nurturing, emotionally bonded",
    Leo: "Generous, romantic grand gestures",
    Virgo: "Devoted, love through acts of service",
    Libra: "Charming, seeks perfect partnership",
    Scorpio: "Intense, deeply transformative love",
    Sagittarius: "Adventurous, freedom-loving in love",
    Capricorn: "Committed, love built on respect",
    Aquarius: "Unconventional, friendship-based love",
    Pisces: "Romantic, selfless and dreamy love",
  },
  Mars: {
    Aries: "Dynamic energy, natural warrior spirit",
    Taurus: "Persistent drive, steady determination",
    Gemini: "Mental energy, versatile action",
    Cancer: "Protective drive, emotionally motivated",
    Leo: "Confident action, creative ambition",
    Virgo: "Precise effort, methodical approach",
    Libra: "Diplomatic action, cooperative drive",
    Scorpio: "Powerful intensity, strategic force",
    Sagittarius: "Adventurous drive, enthusiastic energy",
    Capricorn: "Disciplined ambition, calculated moves",
    Aquarius: "Revolutionary action, collective drive",
    Pisces: "Intuitive action, compassionate motivation",
  },
  Jupiter: {
    Aries: "Growth through bold initiative",
    Taurus: "Abundance through patience and resources",
    Gemini: "Expansion through knowledge and ideas",
    Cancer: "Luck through nurturing and home",
    Leo: "Fortune through creativity and leadership",
    Virgo: "Growth through service and improvement",
    Libra: "Expansion through partnerships",
    Scorpio: "Transformation brings abundance",
    Sagittarius: "Natural philosopher, endless expansion",
    Capricorn: "Success through discipline and structure",
    Aquarius: "Growth through innovation and community",
    Pisces: "Spiritual abundance, boundless compassion",
  },
  Saturn: {
    Aries: "Lessons in patience and self-discipline",
    Taurus: "Challenges around material security",
    Gemini: "Learning focused communication",
    Cancer: "Lessons in emotional boundaries",
    Leo: "Challenges in ego and self-expression",
    Virgo: "Mastery through perfectionism",
    Libra: "Lessons in commitment and fairness",
    Scorpio: "Deep transformation through limitation",
    Sagittarius: "Disciplined pursuit of truth",
    Capricorn: "Natural authority, mastery of ambition",
    Aquarius: "Structured innovation, social responsibility",
    Pisces: "Lessons in boundaries and spiritual discipline",
  },
  Rising: {
    Aries: "Appears energetic, bold first impression",
    Taurus: "Appears calm, reliable first impression",
    Gemini: "Appears curious, talkative first impression",
    Cancer: "Appears nurturing, approachable first impression",
    Leo: "Appears confident, charismatic first impression",
    Virgo: "Appears organized, modest first impression",
    Libra: "Appears graceful, charming first impression",
    Scorpio: "Appears mysterious, intense first impression",
    Sagittarius: "Appears adventurous, optimistic first impression",
    Capricorn: "Appears serious, professional first impression",
    Aquarius: "Appears unique, eccentric first impression",
    Pisces: "Appears gentle, dreamy first impression",
  },
};

/**
 * Calculate Julian Day Number from a date.
 */
function toJulianDay(year: number, month: number, day: number, hour: number): number {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

/**
 * Simplified planetary longitude calculations based on orbital elements.
 * These are approximations good enough for sign placement.
 */
function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const Mrad = M * Math.PI / 180;
  const C = (1.9146 - 0.004817 * T) * Math.sin(Mrad) + 0.019993 * Math.sin(2 * Mrad);
  return ((L0 + C) % 360 + 360) % 360;
}

function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = 218.3165 + 481267.8813 * T;
  const D = 297.8502 + 445267.1115 * T;
  const M = 357.5291 + 35999.0503 * T;
  const Mp = 134.9634 + 477198.8676 * T;
  const F = 93.2720 + 483202.0175 * T;
  const Drad = D * Math.PI / 180;
  const Mrad = M * Math.PI / 180;
  const Mprad = Mp * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  const lon = L + 6.289 * Math.sin(Mprad) - 1.274 * Math.sin(2 * Drad - Mprad)
    + 0.658 * Math.sin(2 * Drad) - 0.214 * Math.sin(2 * Mprad)
    - 0.186 * Math.sin(Mrad);
  return ((lon % 360) + 360) % 360;
}

function getPlanetLongitude(jd: number, planet: string): number {
  const T = (jd - 2451545.0) / 36525;
  // Simplified mean longitudes + first-order corrections
  const params: Record<string, { L0: number; rate: number; eqCenter: number; Mrate: number }> = {
    Mercury: { L0: 252.25, rate: 149472.67, eqCenter: 23.44, Mrate: 149472.51 },
    Venus:   { L0: 181.98, rate: 58517.82, eqCenter: 0.78, Mrate: 58517.80 },
    Mars:    { L0: 355.43, rate: 19140.30, eqCenter: 10.69, Mrate: 19139.86 },
    Jupiter: { L0: 34.35, rate: 3034.91, eqCenter: 5.55, Mrate: 3034.69 },
    Saturn:  { L0: 50.08, rate: 1222.11, eqCenter: 6.40, Mrate: 1221.55 },
  };
  const p = params[planet];
  if (!p) return 0;
  const M = (p.Mrate * T) * Math.PI / 180;
  const lon = p.L0 + p.rate * T + p.eqCenter * Math.sin(M);
  return ((lon % 360) + 360) % 360;
}

function longitudeToSign(lon: number): { sign: string; degree: number } {
  const idx = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[idx], degree: Math.round((lon % 30) * 100) / 100 };
}

/**
 * Rising sign approximation based on time of day and sun position.
 */
function getRisingLongitude(sunLon: number, hour: number): number {
  // Approximate: rising sign advances ~15° per hour from sunrise (~6am)
  const hoursFromSunrise = ((hour - 6) + 24) % 24;
  return ((sunLon + hoursFromSunrise * 15) % 360 + 360) % 360;
}

export function calculateBirthChart(input: BirthChartInput): BirthChartResult {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  const decimalHour = hour + (minute || 0) / 60;

  const jd = toJulianDay(year, month, day, decimalHour);

  const sunLon = getSunLongitude(jd);
  const moonLon = getMoonLongitude(jd);
  const risingLon = getRisingLongitude(sunLon, decimalHour);

  const planetData: { name: string; lon: number }[] = [
    { name: "Sun", lon: sunLon },
    { name: "Moon", lon: moonLon },
    { name: "Mercury", lon: getPlanetLongitude(jd, "Mercury") },
    { name: "Venus", lon: getPlanetLongitude(jd, "Venus") },
    { name: "Mars", lon: getPlanetLongitude(jd, "Mars") },
    { name: "Jupiter", lon: getPlanetLongitude(jd, "Jupiter") },
    { name: "Saturn", lon: getPlanetLongitude(jd, "Saturn") },
    { name: "Rising", lon: risingLon },
  ];

  const planets: PlanetPosition[] = planetData.map(({ name, lon }) => {
    const { sign, degree } = longitudeToSign(lon);
    return {
      planet: name,
      sign,
      degree,
      interpretation: INTERPRETATIONS[name]?.[sign] || "A unique celestial influence",
    };
  });

  // Equal house system from rising
  const houses = Array.from({ length: 12 }, (_, i) => Math.round(((risingLon + i * 30) % 360) * 100) / 100);

  // Dominant element & modality
  const elementCount: Record<string, number> = {};
  const modalityCount: Record<string, number> = {};
  for (const p of planets) {
    const el = SIGN_ELEMENTS[p.sign];
    const mod = SIGN_MODALITIES[p.sign];
    elementCount[el] = (elementCount[el] || 0) + 1;
    modalityCount[mod] = (modalityCount[mod] || 0) + 1;
  }

  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Fire";
  const dominantModality = Object.entries(modalityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Cardinal";

  return { input, planets, houses, dominantElement, dominantModality };
}
