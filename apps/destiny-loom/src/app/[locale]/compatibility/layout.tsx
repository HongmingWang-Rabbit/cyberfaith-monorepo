import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibility — Destiny Loom",
  description: "Discover your cosmic compatibility with zodiac signs and MBTI types",
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
