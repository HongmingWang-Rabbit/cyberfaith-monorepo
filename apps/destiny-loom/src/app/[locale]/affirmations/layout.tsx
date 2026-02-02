import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Affirmations — Destiny Loom",
  description: "Receive personalized daily affirmations based on your zodiac sign and cosmic energy.",
};

export default function AffirmationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
