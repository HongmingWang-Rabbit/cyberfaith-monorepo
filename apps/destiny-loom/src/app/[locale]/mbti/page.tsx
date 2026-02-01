import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, Card, CardContent } from "@cyberfaith/ui";

export default function MbtiLanding() {
  const t = useTranslations("mbti");

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 text-center">
      <div className="space-y-4">
        <span className="text-6xl block">🧠</span>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="text-left">
        <CardContent className="p-6">
          <p className="text-muted-foreground leading-relaxed">{t("description")}</p>
        </CardContent>
      </Card>

      <Link href="/mbti/test">
        <Button variant="neon" size="lg" className="text-lg px-8">
          {t("startTest")}
        </Button>
      </Link>
    </div>
  );
}
