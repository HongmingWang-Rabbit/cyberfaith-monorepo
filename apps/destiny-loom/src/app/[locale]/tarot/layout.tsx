import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarot Reading — Destiny Loom",
  description: "Draw Tarot cards and receive AI-powered interpretations. Choose from single card, three-card spread, or Celtic Cross.",
  openGraph: {
    title: "Tarot Reading — Destiny Loom",
    description: "Interactive Tarot readings with AI-powered interpretations",
    type: "website",
  },
};

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
