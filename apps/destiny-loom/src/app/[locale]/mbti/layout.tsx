import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "MBTI Personality Test — Destiny Loom",
  description: "Discover your MBTI personality type through an AI-powered assessment. Explore your strengths, preferences, and cognitive functions.",
  openGraph: {
    title: "MBTI Personality Test — Destiny Loom",
    description: "Discover your MBTI personality type with AI-powered analysis",
    type: "website",
  },
};

export default function MbtiLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
