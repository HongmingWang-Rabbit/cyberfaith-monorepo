"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@cyberfaith/ui";
import { Link } from "@/i18n/navigation";

interface AiAnalysisCardProps {
  title: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  aiTier?: string;
}

export function AiAnalysisCard({
  title,
  isLoading,
  error,
  onRetry,
  children,
  aiTier,
}: AiAnalysisCardProps) {
  const t = useTranslations("common.ai");

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>✨</span> {title}
          {aiTier === "pro" && (
            <Badge variant="highlight" className="ml-1">⚡ PRO</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-3 py-4">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <span className="text-muted-foreground text-sm animate-pulse">
              {t("loading")}
            </span>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm italic">{t("error")}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {t("retry")}
              </button>
            )}
          </div>
        ) : (
          <>
            {children}
            {aiTier !== "pro" && (
              <ProUpsellBanner />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Upsell banner shown on free-tier readings */
function ProUpsellBanner() {
  const t = useTranslations("common.ai");

  return (
    <div className="mt-6 p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 to-purple-950/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔮</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{t("upsellTitle")}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t("upsellDescription")}</p>
        </div>
        <Link
          href="/pricing"
          className="text-xs px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all whitespace-nowrap"
        >
          {t("upsellCta")}
        </Link>
      </div>
    </div>
  );
}

/** Renders MBTI analysis JSON */
export function MbtiAnalysisContent({ data }: { data: Record<string, unknown> }) {
  const analysis = (data as { analysis?: Record<string, unknown> }).analysis;
  if (!analysis) return <p className="text-muted-foreground italic">No analysis available</p>;

  return (
    <div className="space-y-4">
      {typeof analysis.title === "string" && (
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {analysis.title}
        </h3>
      )}
      {typeof analysis.summary === "string" && (
        <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
      )}
      {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">💪 Strengths</p>
          <div className="flex flex-wrap gap-2">
            {(analysis.strengths as string[]).map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{s}</span>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(analysis.challenges) && analysis.challenges.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">🎯 Challenges</p>
          <div className="flex flex-wrap gap-2">
            {(analysis.challenges as string[]).map((c) => (
              <span key={c} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{c}</span>
            ))}
          </div>
        </div>
      )}
      {typeof analysis.deepDive === "string" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">🔍 Deep Dive</p>
          <p className="text-muted-foreground leading-relaxed">{analysis.deepDive}</p>
        </div>
      )}
      {typeof analysis.shadowSide === "string" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">🌑 Shadow Side</p>
          <p className="text-muted-foreground leading-relaxed">{analysis.shadowSide}</p>
        </div>
      )}
      {typeof analysis.spiritAnimal === "string" && (
        <p className="text-sm text-muted-foreground">
          🐉 Spirit Creature: <span className="text-foreground font-medium">{analysis.spiritAnimal}</span>
        </p>
      )}
      {typeof analysis.advice === "string" && (
        <p className="text-sm italic text-accent border-l-2 border-accent/30 pl-3">{analysis.advice}</p>
      )}
      {typeof analysis.raw === "string" && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{analysis.raw}</p>
      )}
    </div>
  );
}

/** Generic reading content renderer */
export function ReadingContent({ data, messageKey }: { data: Record<string, unknown>; messageKey?: string }) {
  // Try to get interpretation/reading from response
  const content = (data as Record<string, unknown>).interpretation
    || (data as Record<string, unknown>).reading
    || (data as Record<string, unknown>).analysis;
  const message = (data as Record<string, unknown>).message as string | undefined;

  if (message && !content) {
    return <p className="text-muted-foreground italic">{message}</p>;
  }

  if (!content) {
    return <p className="text-muted-foreground italic">{messageKey || "No analysis available"}</p>;
  }

  if (typeof content === "string") {
    return <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  const obj = content as Record<string, unknown>;

  // Render known fields
  return (
    <div className="space-y-4">
      {typeof obj.title === "string" && (
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {obj.title}
        </h3>
      )}
      {typeof obj.overview === "string" && <p className="text-muted-foreground leading-relaxed">{obj.overview}</p>}
      {typeof obj.summary === "string" && <p className="text-muted-foreground leading-relaxed">{obj.summary}</p>}
      {typeof obj.reading === "string" && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{obj.reading}</p>
      )}
      {typeof obj.horoscope === "string" && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{obj.horoscope}</p>
      )}
      {typeof obj.interpretation === "string" && (
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{obj.interpretation}</p>
      )}
      {typeof obj.advice === "string" && (
        <p className="text-sm italic text-accent border-l-2 border-accent/30 pl-3">{obj.advice}</p>
      )}
      {typeof obj.guidance === "string" && (
        <p className="text-sm italic text-accent border-l-2 border-accent/30 pl-3">{obj.guidance}</p>
      )}
      {/* Render any remaining string fields */}
      {Object.entries(obj).map(([key, val]) => {
        if (["title", "overview", "summary", "reading", "horoscope", "interpretation", "advice", "guidance"].includes(key)) return null;
        if (typeof val === "string") {
          return (
            <div key={key}>
              <p className="text-xs font-medium text-muted-foreground capitalize mb-1">{key.replace(/([A-Z])/g, " $1")}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{val}</p>
            </div>
          );
        }
        if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
          return (
            <div key={key}>
              <p className="text-xs font-medium text-muted-foreground capitalize mb-1">{key.replace(/([A-Z])/g, " $1")}</p>
              <div className="flex flex-wrap gap-2">
                {(val as string[]).map((v) => (
                  <span key={v} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{v}</span>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
