import type { Metadata } from "next";
import { getVaegrantData } from "@/lib/vaegrant-data";
import VaegrantApp from "../VaegrantApp";

// Datos frescos de Supabase en cada request (no cachear estático).
export const dynamic = "force-dynamic";

// Ruta catch-all opcional: /vaegrant, /vaegrant/<seccion> y
// /vaegrant/sesiones/<slug> resuelven acá. Los datos se renderizan en el
// servidor (SSR) para que el contenido esté en el HTML y lo lean los crawlers.
const TAB_IDS = ["perfil", "hoja", "personajes", "historia", "sesiones", "mapa", "mundo"];
const TAB_LABEL: Record<string, string> = {
  perfil: "Perfil", hoja: "Hoja de combate", personajes: "Personajes",
  historia: "Historia", sesiones: "Crónica de sesiones", mapa: "Mapa de campaña", mundo: "El mundo",
};

function parseSlug(slug?: string[]) {
  const seg0 = slug?.[0];
  const tab = seg0 && TAB_IDS.includes(seg0) ? seg0 : "perfil";
  const session = tab === "sesiones" ? slug?.[1] : undefined;
  return { tab, session };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug?: string[] }> },
): Promise<Metadata> {
  const { slug } = await params;
  const { tab, session } = parseSlug(slug);
  const sec = TAB_LABEL[tab] ?? "Perfil";
  const titulo = session ? `Vaegrant · ${sec} · ${session}` : `Vaegrant · ${sec} · Silvapor`;
  return {
    title: titulo,
    description:
      "Vaegrant (Aeril Tirael), brujo del pacto Archfey en el mundo de Silvapor (Faerûn): perfil, el mundo, mapa de campaña y crónica de sesiones.",
  };
}

export default async function VaegrantSlugPage(
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const { tab, session } = parseSlug(slug);
  const data = await getVaegrantData();
  return <VaegrantApp initialData={data} initialTab={tab} initialSession={session} />;
}
