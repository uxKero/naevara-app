import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Naevara Tirael",
  description: "Perfil de personaje: Naevara Tirael, Brujo del Gran Antiguo",
};

export default function NaevaraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
