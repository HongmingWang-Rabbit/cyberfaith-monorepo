import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "I Ching Divination — Destiny Loom",
  description: "Cast hexagrams and receive ancient wisdom from the I Ching (Book of Changes). AI-powered interpretation of your divination.",
  openGraph: {
    title: "I Ching Divination — Destiny Loom",
    description: "Cast hexagrams and receive timeless wisdom from the I Ching",
    type: "website",
  },
};

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function IChingLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
