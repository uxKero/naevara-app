export interface HeroStat {
  value: string;
  label: string;
}

export interface NameEntry {
  palabra: string;
  etimologia: string;
}

export interface TextEntry {
  label: string;
  texto: string;
}

export interface Equipment {
  nombre: string;
  descripcion: string;
}

export interface StatBase {
  nombre: string;
  valor: number;
  modificador: string;
  nota: string;
  principal: boolean;
}

export interface CombatStat {
  valor: string;
  label: string;
}

export interface SavingThrow {
  stat: string;
  valor: string;
  nota?: string;
}

export interface Skill {
  nombre: string;
  circulo: boolean;
  numero: string;
  origen: string;
}

export interface DiceDado {
  cantidad: number;
  caras: number;
  modificador?: number;       // e.g. +4 for Agonizing Blast
  tipo: string;               // "fuerza", "necrótico", "psíquico", etc.
  extra?: string;             // tooltip: "1d12 si el objetivo ya está herido"
  salvacion?: string;         // "SAB CD 14" or null if attack roll
  ataque?: boolean;           // true = ranged spell attack (no save)
  variante?: {                // for spells with two dice modes (Toll the Dead)
    condicion: string;        // "Si el objetivo ya está herido"
    cantidad: number;
    caras: number;
  };
  descripcionMecanica: string; // short mechanical description in Spanish
  notas?: string[];           // extra bullets
}

export interface Spell {
  badge: string;
  nombre: string;
  descripcion: string;
  destacado: boolean;
  dado?: DiceDado;            // optional — only for spells that roll dice
}

export interface ArcStep {
  fase: string;
  titulo: string;
  texto: string;
}

export interface Location {
  nombre: string;
  tipo: string;
  texto: string;
  destacado: boolean;
}

export interface Signal {
  nivel: string;
  titulo: string;
  texto: string;
}

export interface SessionEntry {
  id: string;
  fecha: string;
  sesion: string;
  tipo: "personal" | "partida";
  titulo: string;
  contenido: string;
}

export interface CharacterData {
  meta: {
    eyebrow: string;
    firstName: string;
    lastName: string;
    subtitle: string;
    subsubtitle: string;
    tags: string[];
  };
  heroStats: HeroStat[];
  heroQuote: string;
  perfil: {
    nombre: {
      naevara: NameEntry;
      tirael: NameEntry;
      combinado: string;
      descripcion: string;
    };
    aspecto: {
      rasgos: TextEntry[];
      estilo: TextEntry[];
    };
    personalidad: {
      rasgos: TextEntry[];
      relaciones: TextEntry[];
    };
    equipamiento: Equipment[];
    equipamientoNota: string;
    quote: string;
  };
  stats: {
    base: StatBase[];
    combate: CombatStat[];
    salvacion: {
      conComp: SavingThrow[];
      sinComp: SavingThrow[];
    };
    habilidades: Skill[];
    sabiduriaPasiva: string;
  };
  hechizos: {
    nota: string;
    trucos: Spell[];
    patron: Spell[];
    elegidos: Spell[];
    invocaciones: Spell[];
    loopCombate: string;
  };
  historia: {
    origen: {
      titulo: string;
      parrafos: string[];
      contextoActual: string;
    };
    escrituraUmbral: {
      titulo: string;
      subtitulo: string;
      descripcion: string;
      extra: string;
      detalles: TextEntry[];
    };
    arco: ArcStep[];
    sesiones: SessionEntry[];
  };
  mundo: {
    contexto: { titulo: string; texto: string };
    redmica: {
      titulo: string;
      descripcion: string;
      detalles: TextEntry[];
    };
    cultistas: { titulo: string; texto: string };
    lugares: Location[];
  };
  master: {
    senales: Signal[];
    conexiones: TextEntry[];
    quote: string;
  };
  settings: {
    openrouterModel: string;
    openrouterKey: string;
  };
}
