"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface BreadcrumbProps {
  current: string;
}

export function Breadcrumb({ current }: BreadcrumbProps) {
  const t = useTranslations("common");
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-primary transition-colors">
        {t("nav.home")}
      </Link>
      <span className="text-border">/</span>
      <span className="text-foreground font-medium" aria-current="page">{current}</span>
    </nav>
  );
}
