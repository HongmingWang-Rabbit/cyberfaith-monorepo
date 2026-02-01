/**
 * Complete 78-card Tarot deck with Major and Minor Arcana
 */

export interface TarotCard {
  name: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  keywords: string[];
}

const MAJOR_ARCANA: TarotCard[] = [
  { name: "The Fool", arcana: "major", keywords: ["new beginnings", "innocence", "adventure"] },
  { name: "The Magician", arcana: "major", keywords: ["willpower", "creation", "manifestation"] },
  { name: "The High Priestess", arcana: "major", keywords: ["intuition", "mystery", "inner knowledge"] },
  { name: "The Empress", arcana: "major", keywords: ["abundance", "nurturing", "fertility"] },
  { name: "The Emperor", arcana: "major", keywords: ["authority", "structure", "stability"] },
  { name: "The Hierophant", arcana: "major", keywords: ["tradition", "wisdom", "spiritual guidance"] },
  { name: "The Lovers", arcana: "major", keywords: ["love", "harmony", "choices"] },
  { name: "The Chariot", arcana: "major", keywords: ["determination", "willpower", "victory"] },
  { name: "Strength", arcana: "major", keywords: ["courage", "patience", "inner strength"] },
  { name: "The Hermit", arcana: "major", keywords: ["introspection", "solitude", "inner guidance"] },
  { name: "Wheel of Fortune", arcana: "major", keywords: ["fate", "cycles", "turning point"] },
  { name: "Justice", arcana: "major", keywords: ["fairness", "truth", "karma"] },
  { name: "The Hanged Man", arcana: "major", keywords: ["surrender", "new perspective", "letting go"] },
  { name: "Death", arcana: "major", keywords: ["transformation", "endings", "rebirth"] },
  { name: "Temperance", arcana: "major", keywords: ["balance", "patience", "moderation"] },
  { name: "The Devil", arcana: "major", keywords: ["shadow self", "attachment", "illusion"] },
  { name: "The Tower", arcana: "major", keywords: ["upheaval", "revelation", "sudden change"] },
  { name: "The Star", arcana: "major", keywords: ["hope", "inspiration", "renewal"] },
  { name: "The Moon", arcana: "major", keywords: ["illusion", "intuition", "the subconscious"] },
  { name: "The Sun", arcana: "major", keywords: ["joy", "success", "vitality"] },
  { name: "Judgement", arcana: "major", keywords: ["rebirth", "reckoning", "absolution"] },
  { name: "The World", arcana: "major", keywords: ["completion", "integration", "accomplishment"] },
];

function generateMinorArcana(): TarotCard[] {
  const suits: Array<"wands" | "cups" | "swords" | "pentacles"> = ["wands", "cups", "swords", "pentacles"];
  const courtNames = ["Page", "Knight", "Queen", "King"];
  const cards: TarotCard[] = [];

  const suitKeywords: Record<string, string[]> = {
    wands: ["passion", "energy", "creativity"],
    cups: ["emotions", "relationships", "intuition"],
    swords: ["intellect", "conflict", "truth"],
    pentacles: ["material", "prosperity", "craft"],
  };

  for (const suit of suits) {
    for (let i = 1; i <= 10; i++) {
      const name = i === 1 ? `Ace of ${capitalize(suit)}` : `${i} of ${capitalize(suit)}`;
      cards.push({ name, arcana: "minor", suit, number: i, keywords: suitKeywords[suit] });
    }
    for (const court of courtNames) {
      cards.push({ name: `${court} of ${capitalize(suit)}`, arcana: "minor", suit, keywords: suitKeywords[suit] });
    }
  }

  return cards;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...generateMinorArcana()];

export const SPREAD_POSITIONS: Record<string, string[]> = {
  single: ["Present Energy"],
  three: ["Past", "Present", "Future"],
  celtic: [
    "Present",
    "Challenge",
    "Foundation",
    "Recent Past",
    "Crown",
    "Near Future",
    "Self",
    "Environment",
    "Hopes & Fears",
    "Outcome",
  ],
};

export interface DrawnCard {
  name: string;
  position: string;
  reversed: boolean;
  keywords: string[];
  arcana: "major" | "minor";
}

export function drawCards(spreadType: "single" | "three" | "celtic"): DrawnCard[] {
  const positions = SPREAD_POSITIONS[spreadType];
  const deck = [...TAROT_DECK];
  const drawn: DrawnCard[] = [];

  for (const position of positions) {
    const index = Math.floor(Math.random() * deck.length);
    const card = deck.splice(index, 1)[0];
    drawn.push({
      name: card.name,
      position,
      reversed: Math.random() < 0.3,
      keywords: card.keywords,
      arcana: card.arcana,
    });
  }

  return drawn;
}
