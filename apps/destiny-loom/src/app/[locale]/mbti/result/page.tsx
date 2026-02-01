"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Divider } from "@cyberfaith/ui";
import { Link } from "@/i18n/navigation";

const dimensionKeys = ["EI", "SN", "TF", "JP"] as const;
const dimensionLabels: Record<string, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export default function MbtiResult() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "INTJ";
  const scoresRaw = searchParams.get("scores");
  let scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  if (scoresRaw) {
    try {
      scores = JSON.parse(decodeURIComponent(scoresRaw));
    } catch {
      // Invalid scores param, use defaults
    }
  }

  const typeName = t(`results.typeNames.${type}`);
  const typeDesc = t(`results.typeDescriptions.${type}`);

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert(t("common.actions.copy") + " ✓");
  }

  function handleSave() {
    alert(t("results.saved"));
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8 pb-24">
      {/* Type display */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-7xl font-black tracking-wider bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent drop-shadow-lg"
            style={{ textShadow: "0 0 40px rgba(168,85,247,0.3)" }}>
          {type}
        </h1>
        <p className="text-xl text-accent font-semibold">{typeName}</p>
        <Badge variant="accent">{t("results.title")}</Badge>
      </div>

      <Divider />

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed text-lg">{typeDesc}</p>
        </CardContent>
      </Card>

      {/* Dimension breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("results.breakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dimensionKeys.map((dim) => {
            const [left, right] = dimensionLabels[dim];
            const score = scores[dim] || 0;
            const maxScore = 10;
            const pct = Math.round(((score + maxScore) / (2 * maxScore)) * 100);
            return (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={score >= 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                    {left} ({pct}%)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`mbti.dimensions.${dim}`)}
                  </span>
                  <span className={score < 0 ? "text-accent font-semibold" : "text-muted-foreground"}>
                    {right} ({100 - pct}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Analysis placeholder */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>✨</span> {t("results.aiAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic">{t("results.aiPlaceholder")}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="neon" onClick={handleShare}>
          {t("common.actions.share")}
        </Button>
        <Button variant="outline" onClick={handleSave}>
          {t("common.actions.save")}
        </Button>
        <Link href="/mbti">
          <Button variant="ghost">{t("common.actions.back")}</Button>
        </Link>
      </div>
    </div>
  );
}
