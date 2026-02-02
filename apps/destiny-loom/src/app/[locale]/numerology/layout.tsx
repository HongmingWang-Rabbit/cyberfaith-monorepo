import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numerology — Destiny Loom",
  description: "Discover your Life Path, Expression, and Soul Urge numbers with AI-powered numerology analysis.",
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
