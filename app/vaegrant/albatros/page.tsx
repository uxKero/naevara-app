import type { Metadata } from "next";
import AlbatrosViewer from "./AlbatrosViewer";

export const metadata: Metadata = {
  title: "El Albatros · plano y modelo 3D · Vaegrant",
  description:
    "Plano arquitectónico y modelo 3D navegable del Albatros, la carabela de la campaña de Vaegrant en Silvapor. A escala real, con los cuatro niveles y la cámara secreta del motor.",
};

export default function Page() {
  return <AlbatrosViewer />;
}
