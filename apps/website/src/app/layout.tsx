import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberFaith",
  description: "Digital faith platform for the modern age",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">{children}</body>
    </html>
  );
}
