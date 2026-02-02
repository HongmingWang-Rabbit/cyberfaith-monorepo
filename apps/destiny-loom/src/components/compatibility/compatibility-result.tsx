"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { zodiacSigns } from "@/data/zodiac-signs";
import { ShareButtons } from "@/components/ui/share-buttons";

interface Props {
  data: any;
  sign1: string;
  sign2: string;
  friendName?: string;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{score}</span>
      </div>
      <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function CompatibilityResult({ data, sign1, sign2, friendName }: Props) {
  const t = useTranslations("compatibility");
  const s1 = zodiacSigns.find((s) => s.id === sign1);
  const s2 = zodiacSigns.find((s) => s.id === sign2);

  const overallScore = data.overallScore ?? data.overall_score ?? 50;
  const loveScore = data.loveScore ?? data.categories?.romance?.score ?? 50;
  const friendshipScore = data.friendshipScore ?? data.categories?.friendship?.score ?? 50;
  const workScore = data.workScore ?? data.categories?.communication?.score ?? 50;
  const strengths = data.strengths || [];
  const challenges = data.challenges || [];
  const advice = data.advice || data.cosmicVerdict || "";

  const scoreColor = overallScore >= 75 ? "text-green-400" : overallScore >= 50 ? "text-yellow-400" : "text-red-400";
  const ringColor = overallScore >= 75 ? "border-green-400/50" : overallScore >= 50 ? "border-yellow-400/50" : "border-red-400/50";

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header with signs */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <span className="text-5xl block">{s1?.symbol}</span>
              <p className="text-sm mt-1 text-foreground font-medium">{s1?.name}</p>
            </div>
            <div className={`w-24 h-24 rounded-full border-4 ${ringColor} flex items-center justify-center`}>
              <span className={`text-3xl font-black ${scoreColor}`}>{overallScore}</span>
            </div>
            <div className="text-center">
              <span className="text-5xl block">{s2?.symbol}</span>
              <p className="text-sm mt-1 text-foreground font-medium">
                {friendName || s2?.name}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("overallScore")}</p>
        </div>

        {/* Score bars */}
        <div className="space-y-4">
          <ScoreBar label={`❤️ ${t("love")}`} score={loveScore} color="bg-gradient-to-r from-pink-500 to-rose-500" />
          <ScoreBar label={`🤝 ${t("friendship")}`} score={friendshipScore} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
          <ScoreBar label={`💼 ${t("work")}`} score={workScore} color="bg-gradient-to-r from-amber-500 to-orange-500" />
        </div>

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengths.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-green-400">✨ {t("strengths")}</h3>
              <ul className="space-y-1">
                {strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {challenges.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-400">⚡ {t("challenges")}</h3>
              <ul className="space-y-1">
                {challenges.map((c: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Advice / Cosmic Verdict */}
        {advice && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-2">🔮 {t("cosmicAdvice")}</h3>
            <p className="text-sm text-muted-foreground italic">{advice}</p>
          </div>
        )}

        {/* Share */}
        <div className="flex justify-center">
          <ShareButtons
            title={`${s1?.name} × ${s2?.name} Compatibility: ${overallScore}%`}
            description={`My cosmic compatibility: ${s1?.symbol} ${s1?.name} × ${s2?.symbol} ${s2?.name} = ${overallScore}%! Check yours on Destiny Loom 🔮`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
