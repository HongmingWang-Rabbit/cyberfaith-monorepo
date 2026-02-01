import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { AuthWrapper } from "@/components/auth-wrapper";

export const metadata: Metadata = {
  title: "Destiny Loom — CyberFaith",
  description: "Weave your path with guided journeys and divine insights",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-background text-foreground min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <AuthWrapper>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
