import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@cyberfaith/ui";
import { zodiacSigns } from "@/data/zodiac-signs";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const elementGlow: Record<string, string> = {
  fire: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:border-red-500/50",
  earth: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:border-green-500/50",
  air: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-primary/50",
  water: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50",
};

export default function ZodiacPage() {
  const t = useTranslations("zodiac");

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 pb-24">
      <Breadcrumb current={t("title")} />
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-highlight bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <p className="text-center text-muted-foreground">{t("selectSign")}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {zodiacSigns.map((sign) => (
          <Link key={sign.id} href={`/zodiac/${sign.id}`}>
            <Card
              className={`group cursor-pointer transition-all duration-300 ${elementGlow[sign.element] ?? ""}`}
            >
              <CardContent className="p-5 text-center space-y-2">
                <span className="text-5xl block group-hover:scale-110 transition-transform duration-300">
                  {sign.symbol}
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  {sign.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {sign.dateRange}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
