import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zodiac — Destiny Loom",
  description: "Explore all 12 zodiac signs with daily horoscopes, compatibility readings, and personality insights.",
  openGraph: {
    title: "Zodiac — Destiny Loom",
    description: "Daily horoscopes and zodiac compatibility readings",
    type: "website",
  },
};

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function ZodiacLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
