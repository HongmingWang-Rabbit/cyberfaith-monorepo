"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("common.locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <button
      onClick={() => switchLocale(locale === "en" ? "zh" : "en")}
      className="h-8 px-2.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-accent hover:shadow-[var(--glow-cyan)] transition-all duration-200"
    >
      {locale === "en" ? t("zh") : t("en")}
    </button>
  );
}
