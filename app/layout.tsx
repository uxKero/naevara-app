import type { Metadata } from "next";
import { Cinzel, Spectral, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tirael — Naevara & Vaegrant",
  description: "Elegí un personaje: Naevara Tirael (Brujo del Gran Antiguo) o Vaegrant (Brujo del Archifey).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark", cinzel.variable, spectral.variable, "font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
