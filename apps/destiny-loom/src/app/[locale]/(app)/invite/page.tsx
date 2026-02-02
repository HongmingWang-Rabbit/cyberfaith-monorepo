"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useEffect, useCallback } from "react";

export default function InvitePage() {
  const t = useTranslations("referral");
  const { session, isAuthenticated, loginWithGoogle } = useAuth();

  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "success" | "error">("idle");
  const [stats, setStats] = useState<{ count: number; totalKarma: number; totalPremiumDays: number } | null>(null);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${session?.tokens?.accessToken}`,
    "Content-Type": "application/json",
  }), [session]);

  useEffect(() => {
    if (!isAuthenticated || !session?.tokens?.accessToken) return;

    fetch("/api/referral/code", { headers: headers() })
      .then((r) => r.json())
      .then((d) => setCode(d.data?.code))
      .catch(() => {});

    fetch("/api/referral/list", { headers: headers() })
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .catch(() => {});
  }, [isAuthenticated, session, headers]);

  const copyCode = () => {
    if (!code) return;
    const url = `${window.location.origin}/invite?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    try {
      const res = await fetch("/api/referral/apply", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ code: applyCode.trim() }),
      });
      if (res.ok) setApplyStatus("success");
      else setApplyStatus("error");
    } catch {
      setApplyStatus("error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
        <button
          onClick={loginWithGoogle}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Sign in to get your code
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
        <CardContent className="p-6 text-center space-y-4">
          <h2 className="text-lg font-semibold">{t("yourCode")}</h2>
          {code ? (
            <>
              <div className="text-3xl font-mono font-bold tracking-widest text-primary">{code}</div>
              <button
                onClick={copyCode}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {copied ? t("copied") : t("shareLink")}
              </button>
            </>
          ) : (
            <div className="h-10 bg-muted/20 animate-pulse rounded w-48 mx-auto" />
          )}
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">{t("rewards.title")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span>{t("rewards.referrerKarma")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span>{t("rewards.referrerPremium")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <span>{t("rewards.referredKarma")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("stats.title")}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t("stats.totalReferred"), value: stats.count },
              { label: t("stats.karmaEarned"), value: stats.totalKarma },
              { label: t("stats.premiumDays"), value: stats.totalPremiumDays },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Apply Referral Code */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">{t("apply.title")}</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={applyCode}
              onChange={(e) => { setApplyCode(e.target.value); setApplyStatus("idle"); }}
              placeholder={t("apply.placeholder")}
              className="flex-1 px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
            />
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
            >
              {t("apply.submit")}
            </button>
          </div>
          {applyStatus === "success" && (
            <p className="text-sm text-green-400">{t("apply.success")}</p>
          )}
          {applyStatus === "error" && (
            <p className="text-sm text-red-400">{t("apply.error")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
