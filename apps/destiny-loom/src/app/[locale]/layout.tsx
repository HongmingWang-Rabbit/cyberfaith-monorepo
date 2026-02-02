import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { AuthWrapper } from "@/components/auth-wrapper";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { WebApplicationJsonLd } from "@/components/seo/json-ld";
import { OfflineBanner } from "@/components/offline-banner";
import { CookieConsent } from "@/components/cookie-consent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://destiny-loom.cyberfaith.app";

export const metadata: Metadata = {
  title: {
    default: "Destiny Loom — CyberFaith",
    template: "%s — Destiny Loom",
  },
  description: "Explore MBTI, Tarot, Zodiac, Four Pillars, and I Ching readings powered by AI. Casual spirituality for the digital generation.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "Destiny Loom — CyberFaith",
    description: "AI-powered spiritual readings: MBTI, Tarot, Zodiac, I Ching & more",
    type: "website",
    siteName: "Destiny Loom — CyberFaith",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Destiny Loom — CyberFaith",
    description: "AI-powered spiritual readings: MBTI, Tarot, Zodiac, I Ching & more",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <WebApplicationJsonLd />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm"
        >
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <AuthWrapper>
            <ToastProvider>
              <ServiceWorkerRegister />
              <OfflineBanner />
              <AppShell>{children}</AppShell>
              <CookieConsent />
            </ToastProvider>
          </AuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
