"use client";

import { Button } from "@cyberfaith/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@cyberfaith/ui";
import { Badge } from "@cyberfaith/ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Animated Counter ── */
function Counter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          let start = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              start = target;
              clearInterval(timer);
            }
            setCount(start);
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold neon-text sm:text-5xl">
        {count.toLocaleString()}+
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ── Apps data ── */
const apps = [
  {
    name: "Destiny Loom",
    tagline: "Weave your cosmic path",
    description:
      "MBTI personality tests, Tarot readings, Zodiac insights, Four Pillars of Destiny, and I Ching divination — all powered by AI.",
    icon: "🔮",
    color: "primary" as const,
    glow: "neon-border",
  },
  {
    name: "Spirit Arcade",
    tagline: "Play with purpose",
    description:
      "Spiritual-themed mini-games and interactive experiences that make self-discovery fun and social.",
    icon: "🎮",
    color: "accent" as const,
    glow: "neon-border-cyan",
  },
  {
    name: "Sanctum",
    tagline: "Your digital temple",
    description:
      "Personal dashboard for tracking your spiritual journey, achievements, and daily reflections.",
    icon: "🏛️",
    color: "highlight" as const,
    glow: "",
  },
];

const destinyFeatures = [
  { name: "MBTI", icon: "🧬", desc: "Discover your personality type through AI-powered assessment" },
  { name: "Tarot", icon: "🃏", desc: "Interactive card spreads with deep AI interpretations" },
  { name: "Zodiac", icon: "⭐", desc: "Daily horoscopes and compatibility readings" },
  { name: "Four Pillars", icon: "🏯", desc: "Ancient Chinese destiny calculation (BaZi)" },
  { name: "I Ching", icon: "☯️", desc: "Cast hexagrams and receive timeless wisdom" },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="cyber-grid" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-accent/20 blur-[80px]" />

        <h1 className="relative z-10 text-6xl font-extrabold tracking-tighter sm:text-8xl lg:text-9xl">
          Cyber<span className="text-primary neon-text">Faith</span>
        </h1>
        <p className="relative z-10 mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
          Casual spirituality for the digital generation.
          <br />
          <span className="text-accent neon-text-cyan">Decode your destiny with AI.</span>
        </p>
        <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-4">
          <a href="https://destiny-loom.cyberfaith.app">
            <Button variant="neon" size="lg" className="animate-glow-pulse">
              Try Destiny Loom
            </Button>
          </a>
          <Link href="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 z-10 animate-float text-muted-foreground text-sm">
          ↓ Scroll to explore
        </div>
      </section>

      {/* ── App Features ── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-accent">
          Our Apps
        </h2>
        <p className="mb-12 text-center text-3xl font-bold sm:text-4xl">
          The CyberFaith Ecosystem
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.name} className={`${app.glow} hover:scale-[1.02] transition-transform duration-300`}>
              <CardHeader>
                <div className="text-4xl mb-2">{app.icon}</div>
                <CardTitle className="text-xl">{app.name}</CardTitle>
                <p className="text-sm text-accent">{app.tagline}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{app.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Destiny Loom Showcase ── */}
      <section className="border-y border-border/50 bg-secondary/30 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Destiny Loom
          </h2>
          <p className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Five Paths, One Journey
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {destinyFeatures.map((f) => (
              <div
                key={f.name}
                className="group rounded-xl border border-border/50 bg-card p-5 text-center transition-all hover:border-primary/50 hover:shadow-[var(--glow-purple)]"
              >
                <div className="text-3xl mb-3 group-hover:animate-float">{f.icon}</div>
                <h3 className="font-semibold text-foreground">{f.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-24">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 sm:grid-cols-3">
          <Counter target={12847} label="Readings completed" />
          <Counter target={4216} label="Personality types discovered" />
          <Counter target={892} label="Hexagrams cast" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-border/50 bg-secondary/30 py-24">
        <div className="pointer-events-none absolute inset-0 cyber-grid opacity-50" />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to decode your <span className="text-primary neon-text">destiny</span>?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start your journey today — it&apos;s free, fast, and might just change how you see yourself.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="https://destiny-loom.cyberfaith.app">
              <Button variant="neon" size="lg">
                Get Started
              </Button>
            </a>
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
