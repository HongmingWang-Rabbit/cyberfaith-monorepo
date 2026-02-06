"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useAuth } from "@cyberfaith/auth-client";
import { DailyHoroscope } from "@/components/daily-horoscope";
import { PushPrompt } from "@/components/push-prompt";
import { FeaturedReading } from "@/components/featured-reading";
import { EventBanner } from "@/components/events/event-banner";
import { DailyChallenge } from "@/components/daily-challenge";
import { SolanaCTA } from "@/components/home/SolanaCTA";

const features = [
  { key: "mbti", href: "/mbti", icon: "🧠", color: "purple" },
  { key: "tarot", href: "/tarot", icon: "🃏", color: "cyan" },
  { key: "zodiac", href: "/zodiac", icon: "⭐", color: "pink" },
  { key: "iching", href: "/i-ching", icon: "☯️", color: "cyan" },
  { key: "fourPillars", href: "/four-pillars", icon: "🏛️", color: "purple" },
] as const;

const glowMap = {
  purple: "hover:shadow-[var(--glow-purple)] hover:border-primary/50",
  cyan: "hover:shadow-[var(--glow-cyan)] hover:border-accent/50",
  pink: "hover:shadow-[var(--glow-pink)] hover:border-highlight/50",
} as const;

export default function HomePage() {
  const t = useTranslations();
  const { session, isAuthenticated } = useAuth();
  const token = isAuthenticated ? session?.tokens?.accessToken : null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Event Banner */}
      <EventBanner />

      {/* Daily Horoscope + Challenge */}
      {isAuthenticated && (
        <section className="space-y-3">
          <DailyHoroscope token={token} />
          <DailyChallenge token={token} />
          <PushPrompt token={token} />
        </section>
      )}

      {/* Reading of the Day */}
      <section>
        <FeaturedReading />
      </section>

      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          {t("home.hero")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("home.heroSub")}
        </p>
      </section>

      {/* Solana CTA */}
      <section>
        <SolanaCTA />
      </section>

      {/* Feature grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link key={f.key} href={f.href}>
            <Card
              className={`group cursor-pointer h-full transition-all duration-300 ${glowMap[f.color]}`}
            >
              <CardContent className="p-6 space-y-3">
                <span className="text-4xl block group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </span>
                <h2 className="text-xl font-semibold text-foreground">
                  {t(`home.features.${f.key}.title`)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(`home.features.${f.key}.description`)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
