import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReadingArticleJsonLd } from "@/components/seo/json-ld";

const CORE_API_URL = process.env.CORE_API_URL || "http://localhost:4000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface Reading {
  id: string;
  type: string;
  result: Record<string, any> | null;
  locale: string | null;
  createdAt: string;
  isPublic: boolean;
}

async function fetchReading(id: string): Promise<Reading | null> {
  try {
    const res = await fetch(`${CORE_API_URL}/readings/public/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function getReadingTitle(reading: Reading): string {
  const typeLabels: Record<string, string> = {
    mbti: "MBTI Personality",
    tarot: "Tarot Reading",
    "i-ching": "I Ching Reading",
    "four-pillars": "Four Pillars of Destiny",
    zodiac: "Zodiac Reading",
  };
  const label = typeLabels[reading.type] || "Reading";
  const result = reading.result as any;

  if (reading.type === "mbti" && result?.type) {
    return `My MBTI Result: ${result.type}`;
  }
  if (reading.type === "zodiac" && result?.sign) {
    return `My Zodiac: ${result.sign}`;
  }
  return `My ${label}`;
}

function getReadingDescription(reading: Reading): string {
  const result = reading.result as any;
  if (!result) return "Discover your destiny on Destiny Loom";

  if (result.summary) return String(result.summary).slice(0, 200);
  if (result.interpretation) return String(result.interpretation).slice(0, 200);
  if (result.description) return String(result.description).slice(0, 200);
  if (reading.type === "mbti" && result.type) {
    return `I got ${result.type} on my MBTI personality test. What's yours?`;
  }
  return "Discover your destiny on Destiny Loom";
}

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const reading = await fetchReading(id);

  if (!reading) {
    return { title: "Reading Not Found — Destiny Loom" };
  }

  const title = getReadingTitle(reading);
  const description = getReadingDescription(reading);

  const ogImageUrl = `${APP_URL}/api/og/reading/${id}`;

  return {
    title: `${title} — Destiny Loom`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${APP_URL}/share/${id}`,
      siteName: "Destiny Loom — CyberFaith",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id, locale } = await params;
  const reading = await fetchReading(id);

  if (!reading) {
    notFound();
  }

  const title = getReadingTitle(reading);
  const description = getReadingDescription(reading);
  const result = reading.result as any;
  const createdDate = new Date(reading.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const typeIcons: Record<string, string> = {
    mbti: "🧠",
    tarot: "🃏",
    "i-ching": "☯️",
    "four-pillars": "🏛️",
    zodiac: "⭐",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4">
      <ReadingArticleJsonLd
        title={title}
        description={description}
        url={`${APP_URL}/share/${id}`}
        datePublished={reading.createdAt}
      />
      <div className="max-w-lg w-full space-y-6">
        {/* Main card */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="text-4xl">{typeIcons[reading.type] || "✨"}</span>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{createdDate}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Result content */}
            <div className="space-y-4">
              {reading.type === "mbti" && result?.type && (
                <div className="text-center">
                  <span className="text-6xl font-black tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {result.type}
                  </span>
                </div>
              )}

              {reading.type === "zodiac" && result?.sign && (
                <div className="text-center">
                  <span className="text-5xl font-bold text-accent">{result.sign}</span>
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed text-center">
                {description}
              </p>

              {/* Key highlights from result */}
              {result?.traits && Array.isArray(result.traits) && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {(result.traits as string[]).slice(0, 5).map((trait: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* CTA */}
            <div className="text-center space-y-3">
              <Link
                href={`/${locale}/${reading.type === "i-ching" ? "i-ching" : reading.type === "four-pillars" ? "four-pillars" : reading.type}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
              >
                ✨ Try Your Own Reading
              </Link>
              <p className="text-xs text-muted-foreground">
                Discover your destiny on{" "}
                <Link href={`/${locale}`} className="text-primary hover:underline">
                  Destiny Loom
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Powered by footer */}
        <p className="text-center text-xs text-muted-foreground/50">
          Powered by CyberFaith
        </p>
      </div>
    </div>
  );
}
