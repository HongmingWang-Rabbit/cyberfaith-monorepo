"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { useAuth } from "@cyberfaith/auth-client";
import { useState, useEffect } from "react";

const TYPE_ICONS: Record<string, string> = {
  tarot: "🃏", mbti: "🧠", zodiac: "⭐", "i-ching": "☯️", "four-pillars": "🏛️",
};

export function GiftHistorySection() {
  const t = useTranslations("gift.history");
  const { session } = useAuth();
  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.tokens?.accessToken) return;
    const h = { Authorization: `Bearer ${session.tokens.accessToken}` };

    fetch("/api/gifts/sent", { headers: h })
      .then((r) => r.json())
      .then((d) => setSent(d.data || []))
      .catch(() => {});

    fetch("/api/gifts/received", { headers: h })
      .then((r) => r.json())
      .then((d) => setReceived(d.data || []))
      .catch(() => {});
  }, [session]);

  const items = tab === "sent" ? sent : received;

  if (sent.length === 0 && received.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-3">{t("title")}</h2>
      <div className="flex gap-2 mb-3">
        {(["sent", "received"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {t(key)} ({key === "sent" ? sent.length : received.length})
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground italic">
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((g: any) => (
            <Card key={g.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[g.readingType] || "🎁"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {g.readingType} {g.message ? `— "${g.message.slice(0, 40)}"` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${g.redeemed ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {g.redeemed ? t("redeemed") : t("pending")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
