"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

const TYPE_ICONS: Record<string, string> = {
  tarot: "🃏",
  mbti: "🧠",
  zodiac: "⭐",
  "i-ching": "☯️",
  "four-pillars": "🏛️",
};

const TYPE_ROUTES: Record<string, string> = {
  tarot: "/tarot",
  mbti: "/mbti",
  zodiac: "/zodiac",
  "i-ching": "/i-ching",
  "four-pillars": "/four-pillars",
};

export default function GiftRedeemPage() {
  const t = useTranslations("gift");
  const { session, isAuthenticated, loginWithGoogle } = useAuth();
  const params = useParams();
  const code = params.code as string;

  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unwrapping, setUnwrapping] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    fetch(`/api/gifts/${code}`)
      .then((r) => r.json())
      .then((d) => { setGift(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [code]);

  const handleRedeem = async () => {
    if (!session?.tokens?.accessToken) return;
    setUnwrapping(true);

    // Unwrap animation delay
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const res = await fetch(`/api/gifts/${code}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.tokens.accessToken}` },
      });
      if (res.ok) setRedeemed(true);
    } catch {
      // ignore
    }
    setUnwrapping(false);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="text-6xl animate-bounce">🎁</div>
        <div className="h-8 bg-muted/20 animate-pulse rounded w-48 mx-auto mt-4" />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="text-6xl">❌</div>
        <p className="text-muted-foreground">Gift not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8 pb-24">
      <div className="text-center space-y-4">
        {/* Gift unwrap animation */}
        <div
          className={`text-8xl transition-all duration-1000 ${
            unwrapping ? "animate-spin scale-150" : redeemed ? "scale-125" : "animate-bounce"
          }`}
        >
          {redeemed ? TYPE_ICONS[gift.readingType] || "✨" : "🎁"}
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {redeemed ? t("redeem.redeemed") : t("redeem.title")}
        </h1>

        {gift.senderName && (
          <p className="text-muted-foreground">
            {t("redeem.from")}: <span className="text-foreground font-medium">{gift.senderName}</span>
          </p>
        )}
      </div>

      {/* Message Card */}
      {gift.message && (
        <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t("redeem.message")}</p>
            <p className="text-lg italic text-foreground">&ldquo;{gift.message}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      {/* Reading type */}
      <Card>
        <CardContent className="p-6 text-center space-y-2">
          <span className="text-4xl">{TYPE_ICONS[gift.readingType] || "🔮"}</span>
          <p className="text-lg font-semibold">{t(`types.${gift.readingType}` as any)}</p>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="text-center">
        {gift.redeemed && !redeemed ? (
          <p className="text-muted-foreground">{t("redeem.alreadyRedeemed")}</p>
        ) : !isAuthenticated ? (
          <button
            onClick={loginWithGoogle}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            Sign in to claim your gift
          </button>
        ) : redeemed ? (
          <Link
            href={TYPE_ROUTES[gift.readingType] || "/"}
            className="inline-block px-8 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            {t("redeem.startReading")}
          </Link>
        ) : (
          <button
            onClick={handleRedeem}
            disabled={unwrapping}
            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
          >
            {unwrapping ? t("redeem.unwrapping") : t("redeem.unwrap")}
          </button>
        )}
      </div>
    </div>
  );
}
