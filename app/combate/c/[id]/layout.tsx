import type { Metadata } from "next";

// Título de pestaña a partir del slug del personaje:
// "vaegrant-aeril-tirael-7bynj" -> "Vaegrant Aeril Tirael"
function nombreDesdeSlug(id: string): string {
  const partes = decodeURIComponent(id)
    .replace(/-[a-z0-9]{5}$/, "")
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return partes.join(" ") || "Personaje";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${nombreDesdeSlug(id)} · Combate`,
    description: "Hoja de combate D&D 5e",
  };
}

export default function HojaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
