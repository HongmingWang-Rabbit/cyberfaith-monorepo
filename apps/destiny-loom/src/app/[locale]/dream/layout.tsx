import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Interpretation",
  description: "AI-powered dream analysis with Jungian and Freudian perspectives.",
};

export default function DreamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
