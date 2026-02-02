import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feng Shui — Destiny Loom",
  description: "Get personalized feng shui room analysis based on your Chinese element and room layout.",
};

export default function FengShuiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
