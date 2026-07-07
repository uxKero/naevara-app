// ════════════════════════════════════════════════════════════════
//  lib/srd.ts — Motor del builder.
//  Carga el contenido SRD (public/srd/*.json), calcula los números
//  derivados de un personaje y convierte hechizos del SRD en
//  CombatAction (lo que entiende el roller de combate).
// ════════════════════════════════════════════════════════════════
import { BuilderCharacter, BuilderAbilities, AbilityKey } from "@/types/builder";
import { CombatAction, Tirada, Dano } from "@/lib/combatData";
import { hechizoES, hechizoDescES, duracionES, armaES } from "@/lib/traducciones";

// ── Tipos del SRD curado ────────────────────────────────────────
export interface SrdSpell {
  index: string; name: string; level: number; school: string;
  casting_time: string; range: string; duration: string;
  concentration: boolean; ritual: boolean; components: string[];
  classes: string[]; attack_type: string | null;
  save: { ability: string; success: string } | null;
  area: { type: string; size: number } | null;
  damage: { tipo: string; bySlot: Record<string, string> | null; byChar: Record<string, string> | null } | null;
  heal: Record<string, string> | null;
  desc: string; higher_level: string;
}
export interface SrdLevel {
  prof_bonus: number; asi: boolean; features: string[];
  spellcasting: { cantrips_known: number; spells_known: number | null; slots: Record<string, number> } | null;
  class_specific: Record<string, number> | null;
}
export interface SrdClass {
  index: string; name: string; hit_die: number;
  saving_throws: string[]; spellcasting_ability: string | null; spellcasting_info: string;
  skill_choose: number; skill_options: string[];
  armor_prof: { light: boolean; medium: boolean; heavy: boolean; shields: boolean };
  weapon_prof: { simple: boolean; martial: boolean; specific: string[] };
  subclasses: string[];
  subclasses_full?: { name: string; desc: string; source: string; srd: boolean }[];
  levels: Record<string, SrdLevel>;
}
export interface SrdDeity {
  index: string; name: string; alignment: string; domains: string[]; pantheon: string;
}
export interface SrdWeapon {
  index: string; name: string; category: string; range: string;
  damage: { dice: string; type: string } | null;
  versatile: string | null; properties: string[];
  finesse: boolean; thrown: boolean; ammunition: boolean; two_handed: boolean;
  range_normal: number | null; range_long: number | null;
}
export interface SrdArmor {
  index: string; name: string; category: string;
  base: number; dexBonus: boolean; maxBonus: number | null;
  strMin: number; stealthDis: boolean;
}
export interface SrdRaceTrait { name: string; desc: string }
export interface SrdRace {
  index: string; name: string; speed: number; size: string;
  ability_bonuses: { ability: string; bonus: number }[];
  languages: string[]; language_desc: string; age: string; alignment: string;
  traits: SrdRaceTrait[]; subraces: { index: string; name: string }[];
  source?: string;
}
export interface SrdBackground {
  index: string; name: string; skills: string[];
  feature: { name: string; desc: string } | null;
  source?: string;
}

// ── Carga (cliente) con cache ───────────────────────────────────
const cache: Record<string, unknown> = {};
async function load<T>(file: string): Promise<T> {
  if (cache[file]) return cache[file] as T;
  const res = await fetch(`/srd/${file}`);
  if (!res.ok) throw new Error(`No se pudo cargar /srd/${file}`);
  const data = (await res.json()) as T;
  cache[file] = data;
  return data;
}
export const loadSpells      = () => load<SrdSpell[]>("spells.json");
export const loadClasses     = () => load<SrdClass[]>("classes.json");
export const loadRaces       = () => load<SrdRace[]>("races.json");
export const loadBackgrounds = () => load<SrdBackground[]>("backgrounds.json");
export const loadWeapons     = () => load<SrdWeapon[]>("weapons.json");
export const loadArmor       = () => load<SrdArmor[]>("armor.json");
export const loadDeities     = () => load<SrdDeity[]>("deities.json");

export async function loadAll() {
  const [spells, classes, races, backgrounds, weapons, armor, deities] = await Promise.all([
    loadSpells(), loadClasses(), loadRaces(), loadBackgrounds(), loadWeapons(), loadArmor(), loadDeities(),
  ]);
  return { spells, classes, races, backgrounds, weapons, armor, deities };
}

// ── Traducciones ────────────────────────────────────────────────
export const ABILITY_ES: Record<string, string> = {
  str: "Fuerza", dex: "Destreza", con: "Constitución",
  int: "Inteligencia", wis: "Sabiduría", cha: "Carisma",
};
export const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

// Qué es cada característica, en una línea para principiantes.
export const ABILITY_DESC: Record<AbilityKey, string> = {
  str: "Fuerza bruta: golpes cuerpo a cuerpo, cargar, trepar, forcejear.",
  dex: "Agilidad: tu CA, la iniciativa, el sigilo y la puntería a distancia.",
  con: "Aguante: cuánta vida tenés y resistir venenos, frío, cansancio.",
  int: "Razonar: memoria, lógica, saberes y la magia del Mago.",
  wis: "Intuición: percibir el entorno, fuerza de voluntad y la magia divina.",
  cha: "Presencia: convencer, liderar y la magia de Brujo, Hechicero y Bardo.",
};

const DMG_ES: Record<string, string> = {
  Fire: "fuego", Cold: "frío", Lightning: "relámpago", Acid: "ácido",
  Poison: "veneno", Necrotic: "necrótico", Radiant: "radiante", Force: "fuerza",
  Psychic: "psíquico", Thunder: "trueno", Bludgeoning: "contundente",
  Piercing: "perforante", Slashing: "cortante",
};
const SCHOOL_ES: Record<string, string> = {
  Abjuration: "Abjuración", Conjuration: "Conjuración", Divination: "Adivinación",
  Enchantment: "Encantamiento", Evocation: "Evocación", Illusion: "Ilusión",
  Necromancy: "Nigromancia", Transmutation: "Transmutación",
};
export const dmgES = (t: string) => DMG_ES[t] ?? (t || "").toLowerCase();
export const schoolES = (t: string) => SCHOOL_ES[t] ?? t;

// pies → metros (5 ft = 1,5 m), conservando texto extra
export function rangeES(range: string): string {
  if (!range) return "—";
  const map: Record<string, string> = {
    Self: "Vos misma", Touch: "Toque", Sight: "A la vista",
    Unlimited: "Ilimitado", Special: "Especial",
  };
  if (map[range]) return map[range];
  const m = range.match(/^(\d+)\s*feet/i);
  if (m) {
    const metros = Math.round((parseInt(m[1], 10) * 0.3) / 1.5) * 1.5;
    const resto = range.replace(/^\d+\s*feet/i, "").trim();
    return `${metros} m${resto ? ` ${resto}` : ""}`;
  }
  return range;
}

export function castingTimeES(ct: string): string {
  const c = (ct || "").toLowerCase();
  if (c.includes("bonus")) return "Acción adicional";
  if (c.includes("reaction")) return "Reacción";
  if (c === "1 action") return "Acción";
  if (c.includes("minute")) return ct.replace(/minutes?/i, "min") + " (fuera de combate)";
  if (c.includes("hour")) return ct.replace(/hours?/i, "h") + " (fuera de combate)";
  return ct;
}

// ── Matemática de personaje ─────────────────────────────────────
export const mod = (score: number) => Math.floor((score - 10) / 2);
export const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

// ── Prioridad de características por clase (dónde poner los números altos) ──
export const ABILITY_PRIORITY: Record<string, AbilityKey[]> = {
  barbarian: ["str", "con", "dex", "wis", "cha", "int"],
  bard:      ["cha", "dex", "con", "wis", "int", "str"],
  cleric:    ["wis", "con", "str", "dex", "cha", "int"],
  druid:     ["wis", "con", "dex", "int", "cha", "str"],
  fighter:   ["str", "con", "dex", "wis", "cha", "int"],
  monk:      ["dex", "wis", "con", "str", "int", "cha"],
  paladin:   ["str", "cha", "con", "dex", "wis", "int"],
  ranger:    ["dex", "wis", "con", "str", "int", "cha"],
  rogue:     ["dex", "con", "cha", "int", "wis", "str"],
  sorcerer:  ["cha", "con", "dex", "wis", "int", "str"],
  warlock:   ["cha", "con", "dex", "wis", "int", "str"],
  wizard:    ["int", "con", "dex", "wis", "cha", "str"],
};

// Por qué importa cada característica como PRINCIPAL de la clase
export function porQuePrincipal(ability: AbilityKey, spellAbility: AbilityKey | null): string {
  if (spellAbility && ability === spellAbility)
    return "es tu característica de lanzamiento: define la CD de tus hechizos y tu ataque mágico. Cuanto más alta, más difícil resistirte y más pegás con magia.";
  switch (ability) {
    case "str": return "define tus ataques y daño cuerpo a cuerpo, y tus pruebas de Fuerza.";
    case "dex": return "define tu CA (sin armadura pesada), tu iniciativa y los ataques ágiles o a distancia.";
    case "con": return "define tu vida y aguantar la concentración de los hechizos.";
    case "wis": return "define tus ataques/CD si lanzás con Sabiduría, y tu Percepción.";
    case "int": return "define tus ataques/CD si lanzás con Inteligencia, y el conocimiento arcano.";
    case "cha": return "define tus ataques/CD de hechizos y la interacción social.";
    default: return "es importante para tu clase.";
  }
}

export interface Derived {
  prof: number;
  abilityMods: Record<AbilityKey, number>;
  maxHp: number;
  ac: number;
  initiative: number;
  speed: number;
  spellAbility: AbilityKey | null;
  spellSaveDC: number | null;
  spellAttack: number | null;
  saves: { key: AbilityKey; valor: number; competente: boolean }[];
  passivePerception: number;
  slots: Record<string, number>;        // nivel de espacio -> cantidad
  cantripsKnown: number;
  spellsKnown: number | null;           // null => preparador (elige libre)
  hitDie: number;
}

export function levelData(cls: SrdClass, level: number): SrdLevel | null {
  return cls.levels[String(Math.max(1, Math.min(20, level)))] ?? null;
}

const SKILL_ABILITY: Record<string, AbilityKey> = {
  "Acrobatics": "dex", "Animal Handling": "wis", "Arcana": "int", "Athletics": "str",
  "Deception": "cha", "History": "int", "Insight": "wis", "Intimidation": "cha",
  "Investigation": "int", "Medicine": "wis", "Nature": "int", "Perception": "wis",
  "Performance": "cha", "Persuasion": "cha", "Religion": "int", "Sleight of Hand": "dex",
  "Stealth": "dex", "Survival": "wis",
};

export interface AcOpts { armor?: SrdArmor | null; shield?: boolean; acBonus?: number }

// CA a partir de armadura equipada (o sin armadura 10 + Des)
export function computeAC(armor: SrdArmor | null | undefined, dexMod: number, shield: boolean, acBonus: number): number {
  let ac: number;
  if (armor && armor.category !== "Shield") {
    ac = armor.base;
    if (armor.dexBonus) ac += armor.maxBonus != null ? Math.min(dexMod, armor.maxBonus) : dexMod;
  } else {
    ac = 10 + dexMod;
  }
  if (shield) ac += 2;
  return ac + acBonus;
}

export function computeDerived(ch: BuilderCharacter, cls: SrdClass, race: SrdRace | null, ac?: AcOpts): Derived {
  const a = ch.abilities;
  const abilityMods = {
    str: mod(a.str), dex: mod(a.dex), con: mod(a.con),
    int: mod(a.int), wis: mod(a.wis), cha: mod(a.cha),
  } as Record<AbilityKey, number>;

  const ld = levelData(cls, ch.level);
  const prof = ld?.prof_bonus ?? 2;

  // Vida: dado de golpe + CON al nivel 1, y promedio fijo por nivel extra
  const conMod = abilityMods.con;
  const hd = cls.hit_die;
  const hpAuto = hd + conMod + (ch.level - 1) * (Math.floor(hd / 2) + 1 + conMod);

  // CA: desde armadura equipada (o 10 + Des sin armadura) + escudo + bonos
  const acAuto = computeAC(ac?.armor ?? null, abilityMods.dex, !!ac?.shield, ac?.acBonus ?? 0);

  const spellAbility = (cls.spellcasting_ability as AbilityKey | null) ?? null;
  const spellMod = spellAbility ? abilityMods[spellAbility] : 0;

  const saves = ABILITY_ORDER.map((k) => {
    const competente = cls.saving_throws.includes(k);
    return { key: k, valor: abilityMods[k] + (competente ? prof : 0), competente };
  });

  const perceptionProf = ch.skillProf.includes("Perception");
  const passivePerception = 10 + abilityMods.wis + (perceptionProf ? prof : 0);

  const ov = ch.overrides ?? {};
  return {
    prof,
    abilityMods,
    maxHp: ov.maxHp ?? hpAuto,
    ac: ov.ac ?? acAuto,
    initiative: ov.initiative ?? abilityMods.dex,
    speed: ov.speed ?? (race?.speed ?? 30),
    spellAbility,
    spellSaveDC: spellAbility ? (ov.spellSaveDC ?? 8 + prof + spellMod) : null,
    spellAttack: spellAbility ? (ov.spellAttack ?? prof + spellMod) : null,
    saves,
    passivePerception,
    slots: ld?.spellcasting?.slots ?? {},
    cantripsKnown: ld?.spellcasting?.cantrips_known ?? 0,
    spellsKnown: ld?.spellcasting?.spells_known ?? null,
    hitDie: hd,
  };
}

export function skillTotal(ch: BuilderCharacter, derived: Derived, skill: string): number {
  const ab = SKILL_ABILITY[skill] ?? "int";
  const competente = ch.skillProf.includes(skill);
  return derived.abilityMods[ab] + (competente ? derived.prof : 0);
}
export const ALL_SKILLS = Object.keys(SKILL_ABILITY);
export const skillAbility = (skill: string): AbilityKey => SKILL_ABILITY[skill] ?? "int";

// Nombre en español + qué hace, explicado para principiantes.
export const SKILL_ES: Record<string, { es: string; desc: string }> = {
  "Acrobatics":      { es: "Acrobacias",          desc: "Mantener el equilibrio, dar volteretas, soltarte de un agarre o no caerte en suelo resbaladizo." },
  "Animal Handling": { es: "Trato con Animales",  desc: "Calmar, controlar o montar animales, y entender qué quiere o siente una bestia." },
  "Arcana":          { es: "Arcanos",             desc: "Saber sobre magia: hechizos, objetos mágicos, símbolos arcanos, criaturas y planos mágicos." },
  "Athletics":       { es: "Atletismo",           desc: "Esfuerzo físico: trepar, saltar lejos, nadar, forcejear o empujar a alguien." },
  "Deception":       { es: "Engaño",              desc: "Mentir convincentemente, disimular intenciones o hacerte pasar por otro." },
  "History":         { es: "Historia",            desc: "Recordar hechos del pasado: reinos, guerras, linajes, leyendas y eventos antiguos." },
  "Insight":         { es: "Perspicacia",         desc: "Leer a la gente: detectar si te mienten o adivinar sus verdaderas intenciones." },
  "Intimidation":    { es: "Intimidación",        desc: "Conseguir algo por la fuerza: amenazar, presionar o meter miedo." },
  "Investigation":   { es: "Investigación",       desc: "Deducir con lógica: buscar pistas, encontrar trampas o pasadizos, atar cabos." },
  "Medicine":        { es: "Medicina",            desc: "Estabilizar a alguien que se muere, diagnosticar una enfermedad o dar primeros auxilios." },
  "Nature":          { es: "Naturaleza",          desc: "Saber de plantas, animales, clima, estaciones y terreno natural." },
  "Perception":      { es: "Percepción",          desc: "Notar cosas con los sentidos: ver, oír o detectar enemigos ocultos y emboscadas. (La más usada.)" },
  "Performance":     { es: "Interpretación",      desc: "Entretener a un público: actuar, cantar, bailar o tocar un instrumento." },
  "Persuasion":      { es: "Persuasión",          desc: "Convencer de buena fe: negociar, caer bien, hacer diplomacia." },
  "Religion":        { es: "Religión",            desc: "Saber sobre dioses, ritos, símbolos sagrados, no-muertos y lo divino." },
  "Sleight of Hand": { es: "Juego de Manos",      desc: "Manos hábiles: robar de un bolsillo, hacer trucos o esconder objetos pequeños." },
  "Stealth":         { es: "Sigilo",              desc: "Esconderte y moverte sin que te vean ni te oigan." },
  "Survival":        { es: "Supervivencia",       desc: "Rastrear huellas, orientarte, cazar, conseguir comida y sobrevivir a la intemperie." },
};
export const skillES = (skill: string) => SKILL_ES[skill]?.es ?? skill;
export const skillDesc = (skill: string) => SKILL_ES[skill]?.desc ?? "";

// ── Dados ───────────────────────────────────────────────────────
function parseDice(s: string): { cantidad: number; caras: number; modificador?: number } | null {
  const m = (s || "").match(/(\d+)\s*d\s*(\d+)(?:\s*\+\s*(\d+))?/i);
  if (!m) return null;
  return { cantidad: parseInt(m[1], 10), caras: parseInt(m[2], 10), modificador: m[3] ? parseInt(m[3], 10) : undefined };
}
// Elige la cuerda de daño correcta para el nivel de personaje / espacio
function damageDiceFor(spell: SrdSpell, charLevel: number): string | null {
  if (!spell.damage) return null;
  if (spell.level === 0 && spell.damage.byChar) {
    // truco: escala por nivel de personaje (mayor clave <= nivel)
    const keys = Object.keys(spell.damage.byChar).map(Number).filter((k) => k <= charLevel).sort((x, y) => y - x);
    const k = keys[0] ?? Math.min(...Object.keys(spell.damage.byChar).map(Number));
    return spell.damage.byChar[String(k)];
  }
  if (spell.damage.bySlot) {
    return spell.damage.bySlot[String(spell.level)] ?? spell.damage.bySlot[Object.keys(spell.damage.bySlot)[0]];
  }
  if (spell.damage.byChar) {
    const k = Math.max(...Object.keys(spell.damage.byChar).map(Number));
    return spell.damage.byChar[String(k)];
  }
  return null;
}

// rayos de Eldritch Blast por nivel de personaje
function ebBeams(charLevel: number): number {
  return charLevel >= 17 ? 4 : charLevel >= 11 ? 3 : charLevel >= 5 ? 2 : 1;
}

// ── Conversión: hechizo SRD -> CombatAction (para el roller) ─────
export function spellToAction(spell: SrdSpell, derived: Derived, charLevel: number, ebAgonizing = false): CombatAction {
  const esTruco = spell.level === 0;
  const accion = castingTimeES(spell.casting_time);
  const esEB = spell.index === "eldritch-blast";
  const rayos = esEB ? ebBeams(charLevel) : 1;

  // tirada
  let tirada: Tirada;
  if (spell.attack_type) {
    tirada = {
      tipo: "ataque",
      bonus: derived.spellAttack ?? 0,
      rayos,
      nota: `1d20 + ${derived.spellAttack ?? 0} contra la CA del enemigo. Si igualás o superás, pega.${rayos > 1 ? ` Cada uno de los ${rayos} rayos es un ataque aparte.` : ""}`,
    };
  } else if (spell.save) {
    const hayDmg = !!spell.damage;
    const half = spell.save.success === "half";
    tirada = {
      tipo: "salvacion",
      stat: ABILITY_ES[spell.save.ability] ?? spell.save.ability.toUpperCase(),
      cd: derived.spellSaveDC ?? 8,
      fallo: hayDmg ? "recibe el daño completo y el efecto." : "sufre el efecto del hechizo.",
      exito: hayDmg ? (half ? "recibe la mitad del daño." : "no recibe daño.") : "resiste, no le afecta.",
    };
  } else {
    tirada = { tipo: "ninguna", nota: "No hay tirada para que funcione: aplicá el efecto descrito." };
  }

  // daño
  const danos: Dano[] = [];
  const diceStr = damageDiceFor(spell, charLevel);
  if (diceStr && spell.damage) {
    const p = parseDice(diceStr);
    if (p) {
      const dano: Dano = { cantidad: p.cantidad, caras: p.caras, modificador: p.modificador, tipo: dmgES(spell.damage.tipo) };
      if (esEB) {
        dano.etiqueta = "por rayo";
        if (ebAgonizing && derived.spellAbility) {
          dano.modificador = derived.abilityMods[derived.spellAbility];
          dano.modLabel = ABILITY_ES[derived.spellAbility];
        }
      }
      danos.push(dano);
    }
  }

  const queHace =
    `${esTruco ? "Truco" : `Hechizo de nivel ${spell.level}`} de ${schoolES(spell.school)}.` +
    (spell.area ? ` Área: ${spell.area.type} de ${rangeES(`${spell.area.size} feet`)}.` : "") +
    (spell.concentration ? " Requiere concentración." : "") +
    (spell.ritual ? " Se puede lanzar como ritual." : "");

  let grupo: CombatAction["grupo"];
  if (accion.includes("Reacción")) grupo = "reaccion";
  else if (esTruco) grupo = danos.length ? "loop" : "utilidad";
  else grupo = "accion";

  const descEs = hechizoDescES(spell.index);
  return {
    id: spell.index,
    nombre: hechizoES(spell.index, spell.name),
    grupo,
    coste: esTruco ? "Truco · gratis e ilimitado" : `Espacio de nivel ${spell.level}`,
    usaEspacio: !esTruco,
    accion,
    alcance: rangeES(spell.range),
    queHace,
    tirada,
    danos: danos.length ? danos : undefined,
    concentracion: spell.concentration,
    duracion: duracionES(spell.duration),
    ojo: descEs ? `Descripción: ${descEs}` : undefined,
  };
}

// nivel mínimo de espacio que usa un hechizo (para el tracker)
export const spellSlotLevel = (spell: SrdSpell) => spell.level;

// ── Armas ───────────────────────────────────────────────────────
export function weaponProficient(weapon: SrdWeapon, cls: SrdClass): boolean {
  if (weapon.category === "Simple" && cls.weapon_prof.simple) return true;
  if (weapon.category === "Martial" && cls.weapon_prof.martial) return true;
  const wl = weapon.name.toLowerCase();
  return cls.weapon_prof.specific.some((s) => {
    const sl = s.toLowerCase();
    return sl.includes(wl) || wl.includes(sl.replace(/s$/, ""));
  });
}

export interface WeaponEffects {
  rangedAttackBonus: number; meleeAttackBonus: number;
  oneHandedMeleeDmgBonus: number; extraAttacks: number;
}

export function weaponToAction(weapon: SrdWeapon, cls: SrdClass, derived: Derived, eff: WeaponEffects): CombatAction {
  const ranged = weapon.range === "Ranged";
  const useDex = ranged || (weapon.finesse && derived.abilityMods.dex >= derived.abilityMods.str);
  const abKey: AbilityKey = useDex ? "dex" : "str";
  const abMod = derived.abilityMods[abKey];
  const competente = weaponProficient(weapon, cls);
  const prof = competente ? derived.prof : 0;
  const atkBonus = abMod + prof + (ranged ? eff.rangedAttackBonus : eff.meleeAttackBonus);

  const oneHandedMelee = !ranged && !weapon.two_handed;
  const dmgMod = abMod + (oneHandedMelee ? eff.oneHandedMeleeDmgBonus : 0);

  const p = weapon.damage ? parseDice(weapon.damage.dice) : null;
  const danos: Dano[] = p
    ? [{ cantidad: p.cantidad, caras: p.caras, modificador: dmgMod || undefined, modLabel: ABILITY_ES[abKey], tipo: dmgES(weapon.damage!.type) }]
    : [];

  const rayos = 1 + eff.extraAttacks;
  const alcance = ranged
    ? `${rangeES(`${weapon.range_normal ?? 0} feet`)}${weapon.range_long ? ` / ${rangeES(`${weapon.range_long} feet`)} largo` : ""}`
    : `Cuerpo a cuerpo${weapon.thrown ? ` · o arrojada ${rangeES(`${weapon.range_normal ?? 20} feet`)}` : ""}`;

  const notas: string[] = [];
  if (!competente) notas.push("No sos competente con esta arma: NO sumás tu bono de competencia al ataque.");
  if (weapon.versatile) notas.push(`Versátil: a dos manos el daño es ${weapon.versatile} (cambialo en el modo manual).`);
  if (weapon.finesse) notas.push("Sutil (finesse): podés usar Destreza en vez de Fuerza.");

  const nombreArma = armaES(weapon.index, weapon.name);
  return {
    id: `weapon-${weapon.index}`,
    nombre: nombreArma,
    grupo: "armas",
    coste: `Arma ${weapon.category === "Simple" ? "simple" : "marcial"}`,
    accion: "Acción",
    alcance,
    queHace: `Ataque con ${nombreArma.toLowerCase()}.${rayos > 1 ? ` Con Ataque adicional hacés ${rayos} ataques.` : ""}`,
    tirada: {
      tipo: "ataque",
      bonus: atkBonus,
      rayos,
      nota: `1d20 + ${atkBonus} contra la CA del enemigo${competente ? "" : " (sin competencia)"}.`,
    },
    danos: danos.length ? danos : undefined,
    ojo: notas.length ? notas.join(" ") : undefined,
  };
}
