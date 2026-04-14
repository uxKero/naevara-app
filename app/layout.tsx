import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naevara Tirael",
  description: "Perfil de personaje — Naevara Tirael, Brujo del Gran Antiguo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
