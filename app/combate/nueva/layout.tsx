import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear personaje",
  description: "Asistente para crear y editar personajes D&D 5e",
};

export default function NuevaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
