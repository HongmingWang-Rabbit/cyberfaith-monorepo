import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "@cyberfaith/ui";
import { Badge } from "@cyberfaith/ui";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore the CyberFaith ecosystem: Destiny Loom, Spirit Arcade, and Sanctum.",
};

const products = [
  {
    name: "Destiny Loom",
    tagline: "Weave your cosmic path",
    icon: "🔮",
    status: "Live",
    statusVariant: "default" as const,
    href: "https://destiny-loom.cyberfaith.app",
    features: [
      "MBTI personality assessment with AI analysis",
      "Interactive Tarot card readings",
      "Zodiac daily horoscopes & compatibility",
      "Four Pillars of Destiny (BaZi) calculator",
      "I Ching hexagram casting & interpretation",
      "Multi-language support (EN/ZH)",
    ],
  },
  {
    name: "Spirit Arcade",
    tagline: "Play with purpose",
    icon: "🎮",
    status: "Coming Soon",
    statusVariant: "accent" as const,
    href: null,
    features: [
      "Spiritual-themed mini-games",
      "Multiplayer discovery experiences",
      "Social sharing & leaderboards",
      "Daily challenges & rewards",
      "Integration with Destiny Loom results",
    ],
  },
  {
    name: "Sanctum",
    tagline: "Your digital temple",
    icon: "🏛️",
    status: "Coming Soon",
    statusVariant: "highlight" as const,
    href: null,
    features: [
      "Personal spiritual dashboard",
      "Journey history & insights timeline",
      "Achievement system & milestones",
      "Daily reflection journal",
      "Points & rewards tracking",
    ],
  },
];

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-24">
      <div className="text-center mb-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Ecosystem</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Our Products</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Three apps, one mission: make self-discovery accessible, fun, and meaningful.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {products.map((p) => (
          <Card
            key={p.name}
            className="flex flex-col hover:shadow-[var(--glow-purple)] transition-shadow duration-300"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{p.icon}</span>
                <Badge variant={p.statusVariant}>{p.status}</Badge>
              </div>
              <CardTitle className="text-2xl">{p.name}</CardTitle>
              <p className="text-sm text-accent">{p.tagline}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">▸</span>
                    {f}
                  </li>
                ))}
              </ul>
              {p.href ? (
                <a
                  href={p.href}
                  className="block w-full rounded-md bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-center text-sm font-medium text-white hover:shadow-[var(--glow-purple)] transition-all"
                >
                  Try Now →
                </a>
              ) : (
                <div className="block w-full rounded-md border border-border bg-muted px-4 py-2.5 text-center text-sm text-muted-foreground">
                  Coming Soon
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
