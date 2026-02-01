import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Destiny Loom — CyberFaith",
  description: "Weave your path with guided journeys",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">{children}</body>
    </html>
  );
}
