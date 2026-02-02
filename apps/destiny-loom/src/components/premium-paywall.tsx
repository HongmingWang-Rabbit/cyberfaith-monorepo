"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { Card, CardContent } from "@cyberfaith/ui";
import { Link } from "@/i18n/navigation";
import { useState, useEffect, ReactNode } from "react";

interface PremiumPaywallProps {
  /** The full reading content (shown after unlock) */
  children: ReactNode;
  /** A short teaser preview */
  teaser?: string;
  /** Reading type for display */
  readingType?: string;
}

export function PremiumPaywall({ children, teaser, readingType }: PremiumPaywallProps) {
  const t = useTranslations("paywall");
  const { session, isAuthenticated } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !session?.tokens?.accessToken) {
      setChecking(false);
      return;
    }

    fetch("/api/stripe/subscription", {
      headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const tier = d.data?.tier || d.tier || "free";
        setIsPremium(tier !== "free");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isAuthenticated, session]);

  if (checking) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted/20 rounded w-3/4" />
        <div className="h-4 bg-muted/20 rounded w-full" />
        <div className="h-4 bg-muted/20 rounded w-5/6" />
      </div>
    );
  }

  // Premium users see full content
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Teaser content with gradient fade */}
      {teaser && (
        <div className="relative mb-0">
          <p className="text-muted-foreground leading-relaxed">{teaser}</p>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Paywall card */}
      <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-background mt-2">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <h3 className="text-xl font-bold text-foreground">{t("unlockTitle")}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t("unlockDescription")}
          </p>

          {isAuthenticated ? (
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25"
            >
              {t("unlockButton")}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground italic">{t("loginFirst")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
