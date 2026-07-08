import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaegrant (Aeril Tirael)",
  description: "Perfil de personaje: Vaegrant, brujo del Archifey en Silvapor",
};

export default function VaegrantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
