// Perfil narrativo de Vaegrant. Se guarda en Supabase (tabla `character`,
// fila id "vaegrant") vía /api/vaegrant, con fallback a data/vaegrant.json.

export interface VItem {
  label: string;
  texto: string;
}

export interface VLugar {
  nombre: string;
  tipo: string;
  texto: string;
  destacado: boolean;
}

export interface VImagen {
  url: string;
  prompt: string;
  fecha: string;
}

export interface VaegrantData {
  __type: "vaegrant";
  meta: {
    alias: string;
    nombreReal: string;
    eyebrow: string;
    subtitle: string;
    subsubtitle: string;
    tags: string[];
  };
  heroQuote: string;
  heroStats: { label: string; value: string }[];
  combateId: string;
  perfil: {
    quote: string;
    nombre: {
      alias: { palabra: string; etimologia: string };
      real: { palabra: string; etimologia: string };
      descripcion: string;
    };
    vista: string[];       // párrafos "A primera vista"
    aspecto: VItem[];      // rasgos físicos y vestimenta
    interior: string[];    // párrafos "Por dentro"
    costumbres: string[];  // señales para jugarlo en mesa
    relaciones: VItem[];   // con el grupo, con el Testigo, con los quebrados
    hoja: VItem[];         // rasgo / ideal / vínculo / defecto
    arco: { fase: string; titulo: string; texto: string }[];
  };
  historia: {
    quote: string;
    secciones: { titulo: string; parrafos: string[] }[];
    notaMesa: string;
  };
  mundo: {
    contexto: { titulo: string; texto: string };
    lugares: VLugar[];
    ganchos: VItem[];
  };
  galeria: {
    estiloBase: string;
    prompts: { titulo: string; prompt: string }[];
    imagenes: VImagen[];
    portada: number;
  };
}
