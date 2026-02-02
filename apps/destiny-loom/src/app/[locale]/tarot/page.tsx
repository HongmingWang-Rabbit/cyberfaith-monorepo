import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GiftReadingButton } from "@/components/gift-reading-button";

const spreads = [
  { key: "single", icon: "🎴", cards: 1, color: "primary" },
  { key: "threeCard", icon: "🃏", cards: 3, color: "accent" },
  { key: "celticCross", icon: "✨", cards: 10, color: "highlight" },
] as const;

export default function TarotPage() {
  const t = useTranslations("tarot");

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-10 pb-24">
      <Breadcrumb current={t("title")} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="mt-3">
          <GiftReadingButton readingType="tarot" />
        </div>
      </div>

      <div className="grid gap-6">
        {spreads.map((spread) => (
          <Link key={spread.key} href={`/tarot/reading?spread=${spread.key === "threeCard" ? "three-card" : spread.key === "celticCross" ? "celtic-cross" : "single"}`}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-primary/40">
              <CardContent className="p-6 flex items-center gap-6">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{spread.icon}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{t(`spreads.${spread.key}.title`)}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t(`spreads.${spread.key}.description`)}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">{spread.cards}</span>
                  <p className="text-xs text-muted-foreground">{t("cards")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
