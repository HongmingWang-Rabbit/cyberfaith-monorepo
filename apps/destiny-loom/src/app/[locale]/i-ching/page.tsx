"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { useState } from "react";
import { castHexagram } from "@/lib/i-ching";

export default function IChingPage() {
  const t = useTranslations("iching");
  const router = useRouter();
  const [casting, setCasting] = useState(false);

  const handleCast = () => {
    setCasting(true);
    const result = castHexagram();
    // Store in sessionStorage for result page
    sessionStorage.setItem("iching-result", JSON.stringify(result));
    setTimeout(() => {
      router.push("/i-ching/result");
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10 pb-24">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <Card className="border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <span className="text-6xl block">☯️</span>
            <p className="text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              {t("method")}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handleCast}
              disabled={casting}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                casting
                  ? "bg-primary/50 text-primary-foreground/70 animate-pulse"
                  : "bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105"
              }`}
            >
              {casting ? t("casting") : t("castButton")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
