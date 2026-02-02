"use client";

import { useEffect, useRef } from "react";

/* ── Intersection Observer hook for scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Hero Particles (pure CSS, generated via JS positions) ── */
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 13) % 100}%`,
    delay: `${(i * 1.3) % 8}s`,
    size: i % 3 === 0 ? 2 : 3,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── Hero Section ── */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      {/* Backgrounds */}
      <div className="hero-gradient-bg absolute inset-0" />
      <div className="cyber-grid" />
      <Particles />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/3 bottom-1/3 h-56 w-56 rounded-full bg-accent/15 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-highlight/10 blur-[80px]" />

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl lg:text-8xl">
          <span className="text-primary neon-text animate-text-glow">Discover</span>{" "}
          <span className="text-foreground">Your</span>{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent animate-gradient">
            Destiny
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
          AI-powered spiritual guidance for the modern soul
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="https://destiny-loom.cyberfaith.app"
            className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-8 py-3.5 text-base font-semibold text-white transition-all hover:shadow-[var(--glow-purple-lg)] animate-glow-pulse"
          >
            <span>Start Free</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary hover:shadow-[var(--glow-purple)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Watch Demo</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-muted-foreground animate-float">
        <span className="text-xs tracking-widest uppercase">Explore</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

/* ── Features Showcase ── */
const features = [
  { name: "Tarot", icon: "🃏", desc: "Interactive card spreads with deep AI-powered interpretations and guidance" },
  { name: "Zodiac", icon: "⭐", desc: "Daily horoscopes, birth charts, and compatibility readings" },
  { name: "MBTI", icon: "🧬", desc: "Discover your personality type through nuanced AI assessment" },
  { name: "I Ching", icon: "☯️", desc: "Cast hexagrams and receive ancient wisdom for modern dilemmas" },
  { name: "Four Pillars", icon: "🏯", desc: "BaZi destiny analysis — decode your life path from birth data" },
  { name: "Numerology", icon: "🔢", desc: "Unlock the hidden meanings in your numbers and life cycles" },
  { name: "Feng Shui", icon: "🌊", desc: "Harmonize your space with AI-guided energy optimization" },
  { name: "Dream Interpretation", icon: "🌙", desc: "Decode your dreams with deep symbolic analysis" },
];

function FeaturesSection() {
  const ref = useReveal();
  return (
    <section id="features" className="py-24 px-4" ref={ref}>
      <div className="mx-auto max-w-6xl">
        <div className="reveal text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Features</p>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Every Path to <span className="text-primary neon-text">Enlightenment</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Eight powerful spiritual tools, all enhanced by AI. Choose your reading and unlock insights you never knew existed.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.name}
              className={`reveal feature-card`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-foreground">{f.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal mt-8 text-center">
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">And more...</span> Spirit Arcade, Compatibility Readings, Daily Rituals, and Community features coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ── */
const steps = [
  {
    num: "01",
    title: "Choose Your Reading",
    desc: "Pick from Tarot, Zodiac, MBTI, I Ching, and more. Each path offers unique insights.",
    icon: "🔮",
  },
  {
    num: "02",
    title: "AI Analyzes",
    desc: "Our AI combines ancient wisdom with modern intelligence to create personalized readings.",
    icon: "⚡",
  },
  {
    num: "03",
    title: "Get Insights",
    desc: "Receive detailed, actionable guidance tailored to your questions and life situation.",
    icon: "✨",
  },
];

function HowItWorksSection() {
  const ref = useReveal();
  return (
    <section id="demo" className="py-24 px-4 border-y border-border/50 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-5xl">
        <div className="reveal text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">How It Works</p>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three Steps to <span className="neon-text-cyan text-accent">Clarity</span>
          </h2>
        </div>
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal text-center ${i < steps.length - 1 ? "step-connector" : ""}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-secondary">
                <span className="text-3xl">{step.icon}</span>
                <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.num}
                </div>
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full border border-primary/40"
                  style={{ animation: `pulse-ring 2s ease-out infinite`, animationDelay: `${i * 0.5}s` }}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const testimonials = [
  { name: "Sarah K.", role: "Software Engineer", quote: "CyberFaith's tarot readings are eerily accurate. It's like having a spiritual advisor in my pocket.", avatar: "🧑‍💻" },
  { name: "Marcus L.", role: "Designer", quote: "The MBTI analysis went way deeper than any other test I've taken. Really eye-opening stuff.", avatar: "🎨" },
  { name: "Yuki T.", role: "Student", quote: "I was skeptical, but the I Ching readings helped me make a tough career decision. No regrets.", avatar: "📚" },
  { name: "Priya M.", role: "Entrepreneur", quote: "Four Pillars analysis was spot on about my strengths. Now I lean into them with confidence.", avatar: "💼" },
  { name: "Alex R.", role: "Writer", quote: "The dream interpretation feature is addictive. I log my dreams every morning now.", avatar: "✍️" },
  { name: "Chen W.", role: "Data Scientist", quote: "As a skeptic, I appreciate how CyberFaith blends data-driven analysis with spiritual tradition.", avatar: "📊" },
];

function TestimonialsSection() {
  const ref = useReveal();
  return (
    <section className="py-24 overflow-hidden" ref={ref}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="reveal text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-highlight mb-3">Testimonials</p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            What Our <span className="neon-text-pink text-highlight">Users</span> Say
          </h2>
        </div>
      </div>
      {/* Auto-scrolling carousel */}
      <div className="reveal relative">
        <div className="testimonial-track flex gap-6 animate-scroll-testimonials" style={{ width: "max-content" }}>
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-80 flex-shrink-0 rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

/* ── Pricing ── */
const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with basic readings",
    features: ["3 readings per day", "Basic Tarot & Zodiac", "Daily horoscope", "Community access"],
    missing: ["Advanced AI analysis", "All reading types", "Priority support", "Custom spreads"],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/mo",
    desc: "Unlock deeper insights",
    features: ["Unlimited readings", "All 8 reading types", "Advanced AI analysis", "Reading history", "Custom spreads"],
    missing: ["Priority support", "Early access features"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    desc: "The ultimate spiritual toolkit",
    features: ["Everything in Pro", "Priority AI processing", "Early access features", "Priority support", "Exclusive community", "Custom AI personas"],
    missing: [],
    cta: "Go Premium",
    featured: false,
  },
];

function PricingSection() {
  const ref = useReveal();
  return (
    <section id="pricing" className="py-24 px-4 border-y border-border/50 bg-secondary/30" ref={ref}>
      <div className="mx-auto max-w-5xl">
        <div className="reveal text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Pricing</p>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Choose Your <span className="text-primary neon-text">Path</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`reveal pricing-card ${tier.featured ? "featured" : ""}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {tier.featured && (
                <div className="mb-4 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
              <hr className="my-6 border-border/50" />
              <ul className="space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-foreground">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {tier.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground/50">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://destiny-loom.cyberfaith.app"
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                  tier.featured
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-[var(--glow-purple-lg)]"
                    : "border border-border text-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ── */
function CTASection() {
  const ref = useReveal();
  return (
    <section className="relative py-24 px-4 overflow-hidden" ref={ref}>
      <div className="pointer-events-none absolute inset-0 cyber-grid opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[150px]" />
      <div className="reveal relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
          Ready to decode your <span className="text-primary neon-text">destiny</span>?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join thousands exploring their inner world through AI. It&apos;s free, fast, and might just change how you see yourself.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="https://destiny-loom.cyberfaith.app"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-8 py-3.5 text-base font-semibold text-white transition-all hover:shadow-[var(--glow-purple-lg)] animate-glow-pulse"
          >
            Get Started — It&apos;s Free
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Main Page ── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
