// Personaje creado con el builder. Se guarda en Supabase (tabla `character`,
// fila con id propio) y se distingue por __type: "builder".

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface BuilderAbilities {
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
}

export interface BuilderOverrides {
  maxHp?: number;
  ac?: number;
  spellSaveDC?: number;
  spellAttack?: number;
  initiative?: number;
  speed?: number;
}

export interface BuilderCharacter {
  __type: "builder";
  id: string;
  name: string;
  level: number;                 // 1–20
  raceIndex: string;                 // índice SRD/Open5e, o "custom"
  customRace?: string | null;        // nombre si raceIndex === "custom"
  subraceIndex?: string | null;
  classIndex: string;
  subclassName?: string | null;      // nombre de subclase (abierta) o personalizada
  backgroundIndex?: string | null;   // índice o "custom"
  deity?: string | null;             // nombre de deidad o personalizada
  alignment?: string;
  abilities: BuilderAbilities;       // puntuaciones FINALES (ya con bonos raciales)
  skillProf: string[];               // habilidades en las que es competente (nombres SRD en inglés)
  cantrips: string[];                // índices de trucos elegidos
  spells: string[];                  // índices de hechizos (nivel 1+) elegidos
  // equipo
  weapons?: string[];                // índices de armas equipadas (SRD)
  armorIndex?: string | null;        // índice de armadura equipada (SRD) o null
  shield?: boolean;                  // lleva escudo
  // opciones / features
  fightingStyle?: string | null;     // id de estilo de combate
  invocations?: string[];            // ids de invocaciones místicas
  overrides?: BuilderOverrides;      // valores forzados a mano
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Resumen para listar en el roster.
export interface CharacterSummary {
  id: string;
  name: string;
  classIndex?: string;
  raceIndex?: string;
  level?: number;
  updatedAt?: string;
}
