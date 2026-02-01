import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Four Pillars of Destiny (BaZi) — Destiny Loom",
  description: "Calculate your Four Pillars of Destiny (八字) based on your birth date and time. Discover your elemental balance and cosmic path.",
  openGraph: {
    title: "Four Pillars of Destiny — Destiny Loom",
    description: "Ancient Chinese destiny calculation powered by AI",
    type: "website",
  },
};

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function FourPillarsLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
