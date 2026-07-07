import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hojas de combate",
  description: "Roster y hojas de combate D&D 5e",
};

export default function CombateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
