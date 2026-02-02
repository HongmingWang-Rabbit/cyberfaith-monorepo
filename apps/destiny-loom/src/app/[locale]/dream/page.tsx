"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@cyberfaith/ui";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { AiAnalysisCard, ReadingContent } from "@/components/ui/ai-analysis";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Link } from "@/i18n/navigation";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  anxious: "😰",
  hopeful: "🌟",
  confused: "😵‍💫",
};

export default function DreamPage() {
  const t = useTranslations("dream");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [dreamText, setDreamText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [apiBody, setApiBody] = useState<Record<string, unknown> | null>(null);

  const { data: aiData, isLoading, error, refetch } = useAiAnalysis<Record<string, unknown>>(
    apiBody ? "/api/dream/analyze" : null,
    apiBody
  );

  function handleSubmit() {
    if (dreamText.trim().length < 10) return;
    setSubmitted(true);
    setApiBody({ dreamText: dreamText.trim(), locale });
  }

  function handleReset() {
    setSubmitted(false);
    setApiBody(null);
    setDreamText("");
  }

  const interpretation = aiData?.interpretation as Record<string, unknown> | undefined;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-24">
      <Breadcrumb current={t("title")} />

      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          🌙 {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {!submitted ? (
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg">{t("inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("instruction")}</p>
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full h-48 p-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              maxLength={3000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {dreamText.length}/3000
              </span>
              <Button
                variant="neon"
                onClick={handleSubmit}
                disabled={dreamText.trim().length < 10}
              >
                🔮 {t("analyze")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Show the dream text */}
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🌙 {t("yourDream")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{dreamText}</p>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <AiAnalysisCard
            title={t("aiAnalysis")}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            aiTier={(aiData as Record<string, unknown>)?.aiTier as string | undefined}
          >
            {interpretation ? (
              <DreamResult interpretation={interpretation} />
            ) : (
              <p className="text-muted-foreground italic">{t("aiPlaceholder")}</p>
            )}
          </AiAnalysisCard>

          <ShareButtons title="My Dream Interpretation" description="AI dream analysis on Destiny Loom" />

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleReset}>{t("newDream")}</Button>
            <Link href="/"><Button variant="ghost">{tc("actions.back")}</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}

function DreamResult({ interpretation }: { interpretation: Record<string, unknown> }) {
  const t = useTranslations("dream");

  return (
    <div className="space-y-6">
      {typeof interpretation.title === "string" && (
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {interpretation.title}
        </h3>
      )}

      {typeof interpretation.overview === "string" && (
        <p className="text-muted-foreground leading-relaxed">{interpretation.overview}</p>
      )}

      {/* Symbols */}
      {Array.isArray(interpretation.symbols) && interpretation.symbols.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">🔮 {t("sections.symbols")}</p>
          <div className="space-y-2">
            {(interpretation.symbols as Array<{ symbol: string; meaning: string }>).map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <span className="text-primary font-medium whitespace-nowrap">{s.symbol}</span>
                <span className="text-muted-foreground text-sm">{s.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional Themes */}
      {Array.isArray(interpretation.emotionalThemes) && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">💜 {t("sections.emotions")}</p>
          <div className="flex flex-wrap gap-2">
            {(interpretation.emotionalThemes as string[]).map((theme) => (
              <span key={theme} className="text-xs px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Possible Meanings */}
      {Array.isArray(interpretation.possibleMeanings) && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">🌊 {t("sections.meanings")}</p>
          <div className="space-y-2">
            {(interpretation.possibleMeanings as string[]).map((m, i) => (
              <p key={i} className="text-muted-foreground text-sm pl-4 border-l-2 border-indigo-500/30">{m}</p>
            ))}
          </div>
        </div>
      )}

      {/* Jung */}
      {typeof interpretation.jungianPerspective === "string" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">🧠 {t("sections.jung")}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{interpretation.jungianPerspective}</p>
        </div>
      )}

      {/* Freud */}
      {typeof interpretation.freudianPerspective === "string" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">🛋️ {t("sections.freud")}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{interpretation.freudianPerspective}</p>
        </div>
      )}

      {/* Action Suggestions */}
      {Array.isArray(interpretation.actionSuggestions) && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">✨ {t("sections.actions")}</p>
          <div className="space-y-1">
            {(interpretation.actionSuggestions as string[]).map((a, i) => (
              <p key={i} className="text-sm text-accent flex items-start gap-2">
                <span>→</span> {a}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Cosmic Insight */}
      {typeof interpretation.cosmicInsight === "string" && (
        <p className="text-sm italic text-accent border-l-2 border-accent/30 pl-3 mt-4">
          {interpretation.cosmicInsight}
        </p>
      )}
    </div>
  );
}
