"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";
import { useState } from "react";
import { Card, CardContent } from "@cyberfaith/ui";

interface GiftReadingButtonProps {
  readingType: string;
}

export function GiftReadingButton({ readingType }: GiftReadingButtonProps) {
  const t = useTranslations("gift");
  const { session, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [giftLink, setGiftLink] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    if (!session?.tokens?.accessToken) return;
    setSending(true);
    try {
      const res = await fetch("/api/gifts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingType,
          message: message || undefined,
          recipientEmail: email || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const code = data.data?.redeemCode;
        setGiftLink(`${window.location.origin}/gift/${code}`);
      }
    } catch {
      // ignore
    }
    setSending(false);
  };

  const copyLink = () => {
    if (!giftLink) return;
    navigator.clipboard.writeText(giftLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 text-sm font-medium transition-colors"
      >
        {t("button")}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !giftLink && setOpen(false)}>
          <Card className="w-full max-w-md" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground">{t("title")}</h2>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>

              {giftLink ? (
                <div className="space-y-3 text-center">
                  <p className="text-green-400 text-sm">✅ {t("success")}</p>
                  <div className="p-3 bg-muted/10 rounded-lg text-xs break-all text-muted-foreground">
                    {giftLink}
                  </div>
                  <button
                    onClick={copyLink}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {copied ? "✅" : t("copyLink")}
                  </button>
                  <button
                    onClick={() => { setOpen(false); setGiftLink(null); setMessage(""); setEmail(""); }}
                    className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("message.label")}</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("message.placeholder")}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none resize-none h-20"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("recipientEmail.label")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("recipientEmail.placeholder")}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("cost")}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {sending ? "..." : t("send")}
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
