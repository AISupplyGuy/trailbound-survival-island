import type { Metadata } from "next";
import { Bowlby_One_SC, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const bowlby = Bowlby_One_SC({ weight: "400", subsets: ["latin"], variable: "--font-bowlby" });

export const metadata: Metadata = {
  title: "Trailbound: Survival Island",
  description: "An adaptive learning adventure for curious explorers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${bowlby.variable}`}>{children}</body>
    </html>
  );
}
