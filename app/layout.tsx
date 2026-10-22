import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Bodoni_Moda({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NOIR THREADS — Streetwear showcase",
  description:
    "NOIR THREADS: contemporary streetwear. Explore the collection, the lookbook, and visit the shop.",
  openGraph: {
    title: "NOIR THREADS",
    description: "Contemporary streetwear. Explore the collection and visit the shop.",
    images: ["/images/dress-arched-hall-md.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
