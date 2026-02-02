import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CyberFaith — Digital Spirituality for the Modern Age",
    template: "%s | CyberFaith",
  },
  description:
    "Explore MBTI, Tarot, Zodiac, Four Pillars, and I Ching through a cyberpunk lens. Casual spirituality for the digital generation.",
  metadataBase: new URL("https://cyberfaith.app"),
  openGraph: {
    title: "CyberFaith — Digital Spirituality for the Modern Age",
    description: "Casual spirituality for the digital generation. Decode your destiny with AI.",
    type: "website",
    siteName: "CyberFaith",
    url: "https://cyberfaith.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberFaith — Digital Spirituality for the Modern Age",
    description: "Casual spirituality for the digital generation.",
  },
};

function Navbar() {
  return (
    <nav aria-label="Main navigation" className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Cyber<span className="text-primary">Faith</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <a
            href="https://destiny-loom.cyberfaith.app"
            className="rounded-md bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-medium text-white hover:shadow-[var(--glow-purple)] transition-all"
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
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold mb-3">
              Cyber<span className="text-primary">Faith</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Digital spirituality for the modern age. Explore your inner world through technology.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Destiny Loom</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Spirit Arcade</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Sanctum</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">WeChat</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CyberFaith. All rights reserved.
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
    description: "Digital spirituality for the modern age.",
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
