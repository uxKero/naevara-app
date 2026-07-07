// ════════════════════════════════════════════════════════════════
//  lib/features.ts — Motor (curado) de features que SÍ cambian números.
//  Cubre lo "clave": estilos de combate, invocaciones, ataque
//  adicional, y riders de daño situacional (Furtivo, Smite, Furia).
//  Lo no automatizado se muestra como referencia en la hoja.
// ════════════════════════════════════════════════════════════════
import { AbilityKey } from "@/types/builder";
import { CombatAction } from "@/lib/combatData";
import type { SrdClass } from "@/lib/srd";

// ── Estilos de combate ──────────────────────────────────────────
export interface FightingStyle { id: string; name: string; desc: string }
export const FIGHTING_STYLES: FightingStyle[] = [
  { id: "archery",       name: "Tiro con arco (Archery)", desc: "+2 a las tiradas de ataque con armas a distancia." },
  { id: "defense",       name: "Defensa (Defense)",       desc: "+1 a la CA mientras lleves armadura." },
  { id: "dueling",       name: "Duelo (Dueling)",         desc: "+2 al daño cuando empuñás un arma cuerpo a cuerpo a una mano y nada más en la otra." },
  { id: "great-weapon",  name: "Arma a dos manos",        desc: "Repetís 1 y 2 en los dados de daño de armas a dos manos / versátiles. (No automatizado: tiralo a mano)." },
  { id: "two-weapon",    name: "Dos armas",               desc: "Sumás tu modificador al daño del segundo ataque con arma. (Recordatorio)." },
  { id: "protection",    name: "Protección",              desc: "Reacción: imponés desventaja a un ataque contra un aliado cercano si llevás escudo. (Recordatorio)." },
];
export function tieneEstilo(clsIndex: string, level: number): boolean {
  if (clsIndex === "fighter") return level >= 1;
  if (clsIndex === "paladin" || clsIndex === "ranger") return level >= 2;
  return false;
}

// ── Invocaciones místicas (subconjunto curado) ──────────────────
export interface Invocation { id: string; name: string; desc: string; req?: string }
export const INVOCATIONS: Invocation[] = [
  { id: "agonizing-blast", name: "Agonizing Blast", desc: "Sumás tu Carisma al daño de cada rayo de Eldritch Blast.", req: "Eldritch Blast" },
  { id: "repelling-blast", name: "Repelling Blast", desc: "Eldritch Blast empuja al objetivo 3 m. (Recordatorio).", req: "Eldritch Blast" },
  { id: "eldritch-spear",  name: "Eldritch Spear",  desc: "El alcance de Eldritch Blast pasa a 90 m. (Recordatorio).", req: "Eldritch Blast" },
  { id: "devils-sight",    name: "Devil's Sight",   desc: "Ves en la oscuridad (mágica o no) a 36 m. (Recordatorio)." },
  { id: "mask-many-faces", name: "Mask of Many Faces", desc: "Lanzás Disfrazarse a voluntad. (Recordatorio)." },
  { id: "book-ancient",    name: "Book of Ancient Secrets", desc: "Inscribís y lanzás rituales sin gastar espacios. (Recordatorio).", req: "Pacto del Tomo" },
  { id: "thirsting-blade", name: "Thirsting Blade", desc: "Atacás dos veces con tu arma de pacto al usar la acción de Ataque.", req: "Pacto de la Hoja, nivel 5" },
];
export function invocacionesConocidas(cls: SrdClass, level: number): number {
  const ld = cls.levels[String(level)];
  return ld?.class_specific?.invocations_known ?? 0;
}

// ── Efectos activos agregados ───────────────────────────────────
export interface ActiveEffects {
  acBonus: number;
  rangedAttackBonus: number;
  meleeAttackBonus: number;
  oneHandedMeleeDmgBonus: number;
  ebAgonizing: boolean;
  extraAttacks: number;       // ataques de arma adicionales
  notes: string[];            // recordatorios para mostrar
}

export function extraAttacks(clsIndex: string, level: number): number {
  if (clsIndex === "fighter") return level >= 20 ? 3 : level >= 11 ? 2 : level >= 5 ? 1 : 0;
  if (["barbarian", "paladin", "ranger", "monk"].includes(clsIndex)) return level >= 5 ? 1 : 0;
  return 0;
}

export function computeEffects(opts: {
  clsIndex: string; level: number; hasArmor: boolean;
  fightingStyle?: string | null; invocations?: string[];
}): ActiveEffects {
  const eff: ActiveEffects = {
    acBonus: 0, rangedAttackBonus: 0, meleeAttackBonus: 0,
    oneHandedMeleeDmgBonus: 0, ebAgonizing: false, extraAttacks: 0, notes: [],
  };

  switch (opts.fightingStyle) {
    case "archery": eff.rangedAttackBonus += 2; break;
    case "defense": if (opts.hasArmor) eff.acBonus += 1; break;
    case "dueling": eff.oneHandedMeleeDmgBonus += 2; break;
    case "great-weapon": eff.notes.push("Arma a dos manos: repetí los 1 y 2 en los dados de daño."); break;
    case "two-weapon": eff.notes.push("Dos armas: sumás tu mod al daño del segundo ataque."); break;
    case "protection": eff.notes.push("Protección: reacción con escudo para dar desventaja a un ataque contra un aliado."); break;
  }

  for (const inv of opts.invocations ?? []) {
    if (inv === "agonizing-blast") eff.ebAgonizing = true;
    const def = INVOCATIONS.find((i) => i.id === inv);
    if (def && inv !== "agonizing-blast") eff.notes.push(`${def.name}: ${def.desc}`);
  }

  eff.extraAttacks = extraAttacks(opts.clsIndex, opts.level);
  if (eff.extraAttacks > 0) eff.notes.push(`Ataque adicional: hacés ${eff.extraAttacks + 1} ataques con arma al usar la acción de Ataque.`);

  return eff;
}

// ── Rasgos de subclase (curados) como cartas de acción ───────────
// La hoja no auto-aplica subclases (solo las lista por nombre), pero los
// rasgos de nivel bajo más usados se curan acá para que aparezcan como
// cartas jugables, explicadas para principiantes.
export function buildSubclassActions(
  clsIndex: string,
  subclassName: string | null | undefined,
  level: number,
  spellSaveDC: number | null,
  mods: Record<AbilityKey, number>
): CombatAction[] {
  const out: CombatAction[] = [];
  const sub = (subclassName ?? "").toLowerCase();

  if (clsIndex === "warlock" && /arch?i?fey/.test(sub) && level >= 1) {
    out.push({
      id: "fey-presence",
      nombre: "Presencia Feérica",
      grupo: "accion",
      coste: "1 uso · vuelve con descanso corto o largo",
      accion: "Acción",
      alcance: "Cubo de 3 m alrededor tuyo (pegado a vos)",
      queHace:
        "Tu patrón se asoma un instante a través tuyo. Todas las criaturas dentro de un cubo de 3 metros alrededor tuyo (o sea: bien cerca, cuerpo a cuerpo) tiran una salvación de Sabiduría. Las que fallan quedan, a TU elección para todas por igual, hechizadas (no pueden atacarte y les caés bien) o asustadas (no pueden acercarse a vos y atacan con desventaja si te ven). Dura hasta el final de tu PRÓXIMO turno.",
      tirada: {
        tipo: "salvacion",
        stat: "Sabiduría",
        cd: spellSaveDC ?? 8,
        fallo: "queda hechizada o asustada (elegís vos, lo mismo para todas) hasta el final de tu próximo turno.",
        exito: "no le pasa nada.",
      },
      cuando:
        "Usala cuando te rodearon: varios enemigos encima tuyo y necesitás una salida. Elegí 'asustadas' para que no puedan acercarse y escapate; o 'hechizadas' para que no te ataquen mientras el grupo actúa. También sirve fuera de combate como impacto social (a criterio del Master). Como vuelve con descanso corto, no la guardes de más: si la situación la pide, usala.",
      ojo:
        "No hace daño y afecta a TODAS las criaturas del área, aliados incluidos: no la tires con un compañero pegado a vos. El efecto es corto (hasta el final de tu próximo turno): aprovechalo ya mismo. Hechizado sabe que lo hechizaste cuando se le pasa.",
    });
  }

  if (clsIndex === "warlock" && /fiend|infernal/.test(sub) && level >= 1) {
    out.push({
      id: "dark-ones-blessing",
      nombre: "Bendición del Oscuro",
      grupo: "pasiva",
      coste: "Pasiva",
      accion: "Automática",
      alcance: "Vos misma",
      queHace: `Cuando reducís a un enemigo a 0 PV, ganás ${Math.max(1, mods.cha + level)} puntos de golpe temporales (Carisma + nivel de brujo).`,
      tirada: { tipo: "ninguna", nota: "No se tira nada: pasa solo al voltear a un enemigo." },
      cuando: "Recordalo cada vez que rematás a un enemigo: anotá los PV temporales en el tracker.",
    });
  }

  if (clsIndex === "warlock" && /great old one|gran antiguo/.test(sub) && level >= 1) {
    out.push({
      id: "awakened-mind",
      nombre: "Mente Despierta",
      grupo: "utilidad",
      coste: "Gratis e ilimitada",
      accion: "Libre",
      alcance: "9 m",
      queHace: "Podés hablarle telepáticamente a cualquier criatura que veas a 9 metros. No hace falta compartir idioma, pero la criatura tiene que entender al menos un idioma.",
      tirada: { tipo: "ninguna", nota: "Sin tirada: es comunicación, no control." },
      cuando: "Para coordinar en silencio, amenazar sin testigos o hablar con quien no comparte idioma.",
    });
  }

  return out;
}

// ── Riders de daño situacional (cartas con dado para tirar) ──────
export function buildRiders(clsIndex: string, level: number, mods: Record<AbilityKey, number>): CombatAction[] {
  const out: CombatAction[] = [];

  // Daño furtivo (Pícaro)
  if (clsIndex === "rogue") {
    const d = Math.ceil(level / 2);
    out.push({
      id: "sneak-attack", nombre: "Daño Furtivo", grupo: "riders", coste: "1 vez por turno", accion: "Al pegar",
      alcance: "—",
      queHace: "Una vez por turno, si tenés ventaja (o un aliado adyacente al objetivo) y usás un arma sutil o a distancia, sumás este daño extra.",
      tirada: { tipo: "ninguna", nota: "Se suma al daño de un ataque que ya impactó. Una sola vez por turno." },
      danos: [{ cantidad: d, caras: 6, tipo: "perforante", etiqueta: "extra al impactar (1 vez/turno)" }],
    });
  }

  // Castigo Divino (Paladín)
  if (clsIndex === "paladin" && level >= 2) {
    out.push({
      id: "divine-smite", nombre: "Castigo Divino (Divine Smite)", grupo: "riders", coste: "Gasta 1 espacio", accion: "Al pegar c/c",
      alcance: "—", usaEspacio: true,
      queHace: "Cuando pegás con un arma cuerpo a cuerpo, gastás un espacio de hechizo para hacer daño radiante extra. +1d8 por cada nivel de espacio por encima del 1.º (máx 5d8). +1d8 más contra muertos vivientes o infernales.",
      tirada: { tipo: "ninguna", nota: "Se decide DESPUÉS de confirmar el golpe. Base 2d8 con espacio de nivel 1." },
      danos: [{ cantidad: 2, caras: 8, tipo: "radiante", etiqueta: "con espacio de nv1 (sube +1d8 por nivel)" }],
    });
  }

  // Furia (Bárbaro)
  if (clsIndex === "barbarian") {
    const bono = level >= 16 ? 4 : level >= 9 ? 3 : 2;
    out.push({
      id: "rage", nombre: "Furia (Rage)", grupo: "riders", coste: "Usos por descanso", accion: "Acción adicional",
      alcance: "Vos misma",
      queHace: `Entrás en furia: +${bono} al daño con ataques de Fuerza cuerpo a cuerpo, ventaja en pruebas y salvaciones de Fuerza, y resistencia a daño contundente/perforante/cortante. Dura 1 minuto.`,
      tirada: { tipo: "ninguna", nota: `El +${bono} se suma al daño cuerpo a cuerpo de Fuerza mientras estés en furia.` },
      ojo: "No podés lanzar hechizos ni concentrarte mientras estás en furia.",
    });
  }

  return out;
}
