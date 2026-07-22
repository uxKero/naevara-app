// Perfil narrativo de Vaegrant. Se guarda en Supabase (tabla `character`,
// fila id "vaegrant") vía /api/vaegrant, con fallback a data/vaegrant.json.
import type { SessionEntry } from "./character";

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

// ── Personajes del grupo ─────────────────────────────────────────
// Fichas breves de los compañeros de Vaegrant (no incluye a Vaegrant,
// que tiene su propio Perfil y Hoja). Pensadas como un documento, con
// lugar para el retrato cuando se genere.
export interface VPersonaje {
  id: string;
  nombre: string;
  arquetipo: string;      // "Paladín", "Historiador · Artífice"
  linea: string;          // una línea que lo pinta
  imagen: string;         // URL del retrato; "" = pendiente
  rasgos: VItem[];        // señas: casa, oficio, en el barco, etc.
  descripcion: string[];  // párrafos
}

// ── Crónica de sesiones ──────────────────────────────────────────
// Registro curado por sesión: narración por capítulos con el diálogo
// real de mesa insertado donde vale la pena conservarlo textual.

export interface VDialogoLinea {
  quien: string; // "Durin", "Vaegrant", "El Master", etc.
  texto: string;
}

export interface VCapituloSesion {
  titulo: string;
  texto: string; // párrafos separados por líneas en blanco
  dialogo?: VDialogoLinea[];
}

export interface VSesionCronica {
  id: string;      // "sesion-1"
  numero: number;
  titulo: string;
  fecha?: string;
  resumen: string;
  capitulos: VCapituloSesion[];
  nombres: { nombre: string; rol: string }[]; // PNJ, facciones y grupos que aparecieron
  dudas: string[]; // nombres o hechos pendientes de confirmar en mesa
}

// ── Mapa de campaña ──────────────────────────────────────────────
// Pines sobre el mapa de Faerûn, como el mapa físico del salón del club.
// x e y son porcentajes sobre la imagen (independientes de resolución).

export interface VMarcador {
  id: string;
  nombre: string;
  x: number; // % desde la izquierda
  y: number; // % desde arriba
  tipo: "ciudad" | "region" | "isla" | "hito" | "mar" | "portal";
  sesiones: number[]; // en qué sesiones apareció o se mencionó
  nota: string;
  estado: "confirmado" | "aproximado"; // aproximado = lugar original del Master, ubicado a ojo
}

export interface VRuta {
  sesion: number;
  // recorrido = ya viajado · planeado = el viaje comprometido · opcional = encargo personal, no obligatorio
  estado: "recorrido" | "planeado" | "opcional";
  puntos: string[]; // ids de marcadores, en orden
  // Waypoints intermedios (en % del mapa) para que la línea siga el mar y no
  // cruce tierra. Se insertan entre el primer y el segundo marcador.
  via?: { x: number; y: number }[];
}

export interface VMapa {
  imagen: string;
  titulo: string;
  nota: string;
  party: { marcadorId: string; texto: string }; // dónde está el grupo ahora
  marcadores: VMarcador[];
  rutas: VRuta[];
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
    // Registro de sesiones: cola temporal, igual que en Naevara.
    // Se integra al canon y se vacía (ver workflow de sesiones).
    sesiones?: SessionEntry[];
  };
  mundo: {
    contexto: { titulo: string; texto: string };
    lugares: VLugar[];
    ganchos: VItem[];
  };
  // Opcionales para que las filas viejas de Supabase sigan validando;
  // el GET las completa desde la semilla vía mergeConSeed.
  cronica?: VSesionCronica[];
  mapa?: VMapa;
  personajes?: VPersonaje[];
  galeria: {
    estiloBase: string;
    prompts: { titulo: string; prompt: string }[];
    imagenes: VImagen[];
    portada: number;
  };
}
