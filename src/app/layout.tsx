import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trailbound: Survival Island",
  description: "An adaptive learning adventure for curious explorers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
