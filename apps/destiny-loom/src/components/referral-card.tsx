"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@cyberfaith/ui";
import { Link } from "@/i18n/navigation";

export function ReferralCard() {
  const t = useTranslations("referral.profileCard");

  return (
    <Card className="border-accent/20 hover:border-accent/40 transition-colors">
      <CardContent className="p-6 flex items-center gap-4">
        <span className="text-4xl">💌</span>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href="/invite"
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors shrink-0"
        >
          {t("button")}
        </Link>
      </CardContent>
    </Card>
  );
}
