import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CyberFaith — AI-Powered Spiritual Guidance for the Modern Soul",
    template: "%s | CyberFaith",
  },
  description:
    "Discover your destiny with AI-powered Tarot, Zodiac, MBTI, I Ching, Four Pillars, Numerology, Feng Shui, and Dream Interpretation. Casual spirituality for the digital generation.",
  metadataBase: new URL("https://cyberfaith.app"),
  keywords: ["tarot", "zodiac", "MBTI", "I Ching", "numerology", "feng shui", "dream interpretation", "AI spirituality", "digital divination"],
  openGraph: {
    title: "CyberFaith — Discover Your Destiny",
    description: "AI-powered spiritual guidance for the modern soul. Tarot, Zodiac, MBTI, and more.",
    type: "website",
    siteName: "CyberFaith",
    url: "https://cyberfaith.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberFaith — Discover Your Destiny",
    description: "AI-powered spiritual guidance for the modern soul.",
  },
  robots: { index: true, follow: true },
};

function Navbar() {
  return (
    <nav aria-label="Main navigation" className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Cyber<span className="text-primary">Faith</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <a href="#features" className="hidden sm:block text-muted-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#demo" className="hidden sm:block text-muted-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hidden sm:block text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </a>
          <Link href="/about" className="hidden sm:block text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <a
            href="https://destiny-loom.cyberfaith.app"
            className="rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white hover:shadow-[var(--glow-purple)] transition-all"
          >
            Launch App
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-3">
              Cyber<span className="text-primary">Faith</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered spiritual guidance for the modern soul. Explore your inner world through technology.
            </p>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="mailto:hello@cyberfaith.app" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">TikTok</a></li>
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-3">Get the latest readings and features.</p>
            <form className="flex gap-2" action="#">
              <input
                type="email"
                placeholder="your@email.com"
                aria-label="Email for newsletter"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CyberFaith. All rights reserved.</p>
          <p>Built with ✨ and AI</p>
        </div>
      </div>
    </footer>
  );
}

function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CyberFaith",
    url: "https://cyberfaith.app",
    description: "AI-powered spiritual guidance for the modern soul.",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm"
        >
          Skip to content
        </a>
        <Navbar />
        <div id="main-content" className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
