// ════════════════════════════════════════════════════════════════
//  build-srd.mjs — Baja el SRD 5e (contenido abierto, OGL) desde
//  5e-bits/5e-database, lo cura a los campos que usamos y lo escribe
//  en public/srd/ como JSON estáticos.
//
//  Uso (una sola vez, o cuando quieras refrescar el contenido):
//     node scripts/build-srd.mjs
//
//  Fuente: https://github.com/5e-bits/5e-database  (contenido SRD / OGL)
// ════════════════════════════════════════════════════════════════
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/en";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "srd");

async function get(file) {
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`${file} -> ${res.status}`);
  return res.json();
}
// Open5e (contenido abierto OGL ampliado): trae todas las páginas.
const O5E = "https://api.open5e.com/v1";
async function getO5e(path) {
  const res = await fetch(`${O5E}/${path}`);
  if (!res.ok) throw new Error(`open5e ${path} -> ${res.status}`);
  return res.json();
}
const txt = (arr) => (Array.isArray(arr) ? arr.join("\n\n") : arr || "");
const slug = (u) => (u ? u.split("/").pop() : null);
const stripMd = (s) => (s || "").replace(/\*\*\*|\*\*|\*|_/g, "").trim();

const ABIL_KEY = {
  Strength: "str", Dexterity: "dex", Constitution: "con",
  Intelligence: "int", Wisdom: "wis", Charisma: "cha",
};
const SKILL_NAMES = ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];

// Parsear "***Nombre.*** descripción" en [{name,desc}]
function parseTraits(md) {
  if (!md) return [];
  const parts = md.split(/\*\*\*(.+?)\.?\*\*\*/g).filter((x) => x !== "");
  const out = [];
  for (let i = 0; i < parts.length - 1; i += 2) {
    out.push({ name: stripMd(parts[i]).replace(/\.$/, ""), desc: stripMd(parts[i + 1]) });
  }
  if (!out.length && md.trim()) out.push({ name: "Rasgos raciales", desc: stripMd(md) });
  return out;
}

console.log("Descargando SRD…");
const [rawSpells, rawClasses, rawLevels, rawRaces, rawBg, rawTraits, rawEquip] = await Promise.all([
  get("5e-SRD-Spells.json"),
  get("5e-SRD-Classes.json"),
  get("5e-SRD-Levels.json"),
  get("5e-SRD-Races.json"),
  get("5e-SRD-Backgrounds.json"),
  get("5e-SRD-Traits.json"),
  get("5e-SRD-Equipment.json"),
]);

// ── SPELLS ──────────────────────────────────────────────────────
const spells = rawSpells.map((s) => {
  let damage = null;
  if (s.damage) {
    const bySlot = s.damage.damage_at_slot_level || null;
    const byChar = s.damage.damage_at_character_level || null;
    if (bySlot || byChar) {
      damage = { tipo: s.damage.damage_type ? s.damage.damage_type.name : "", bySlot, byChar };
    }
  }
  return {
    index: s.index,
    name: s.name,
    level: s.level,                       // 0 = truco
    school: s.school ? s.school.name : "",
    casting_time: s.casting_time,
    range: s.range,
    duration: s.duration,
    concentration: !!s.concentration,
    ritual: !!s.ritual,
    components: s.components || [],
    classes: (s.classes || []).map((c) => c.index),
    attack_type: s.attack_type || null,   // "ranged" | "melee" | null
    save: s.dc ? { ability: slug(s.dc.dc_type && s.dc.dc_type.url) || (s.dc.dc_type && s.dc.dc_type.name.toLowerCase()), success: s.dc.dc_success } : null,
    area: s.area_of_effect ? { type: s.area_of_effect.type, size: s.area_of_effect.size } : null,
    damage,
    heal: s.heal_at_slot_level || null,
    desc: txt(s.desc),
    higher_level: txt(s.higher_level),
  };
});

// ── TRAITS (mapa index -> {name, desc}) ─────────────────────────
const traitMap = {};
for (const t of rawTraits) traitMap[t.index] = { name: t.name, desc: txt(t.desc) };
const traitsOf = (arr) => (arr || []).map((t) => traitMap[t.index] || { name: t.name, desc: "" });

// ── RACES (con subrazas aplanadas como variantes) ───────────────
const races = rawRaces.map((r) => ({
  index: r.index,
  name: r.name,
  speed: r.speed,
  size: r.size,
  ability_bonuses: (r.ability_bonuses || []).map((a) => ({ ability: a.ability_score.index, bonus: a.bonus })),
  languages: (r.languages || []).map((l) => l.name),
  language_desc: r.language_desc || "",
  age: r.age || "",
  alignment: r.alignment || "",
  traits: traitsOf(r.traits),
  subraces: (r.subraces || []).map((s) => ({ index: slug(s.url), name: s.name })),
}));

// Detalle de subrazas (bonos y traits propios) en archivo aparte si hace falta luego.
// Para v1 alcanzan los nombres; el detalle de subraza se puede pedir por API en el futuro.

// ── CLASSES (con tabla por nivel embebida) ──────────────────────
const levelsByClass = {};
for (const lv of rawLevels) {
  const ci = lv.class ? lv.class.index : null;
  if (!ci || lv.subclass) continue;   // ignorar entradas de subclase: ensucian el conteo de ASI
  (levelsByClass[ci] = levelsByClass[ci] || []).push(lv);
}

const classes = rawClasses.map((c) => {
  // elección de habilidades
  let skillChoose = 0, skillOptions = [];
  const pc = (c.proficiency_choices || []).find(
    (p) => p.from && p.from.options && p.from.options.some((o) => o.item && o.item.index && o.item.index.startsWith("skill"))
  );
  if (pc) {
    skillChoose = pc.choose;
    skillOptions = pc.from.options
      .filter((o) => o.item && o.item.index && o.item.index.startsWith("skill"))
      .map((o) => o.item.name.replace(/^Skill:\s*/, ""));
  }

  const levels = {};
  let prevAsi = 0;
  const ordered = (levelsByClass[c.index] || []).slice().sort((a, b) => a.level - b.level);
  for (const lv of ordered) {
    const sc = lv.spellcasting;
    const cumAsi = lv.ability_score_bonuses || 0;   // SRD da el acumulado
    const asiHere = cumAsi > prevAsi;                 // este nivel concede una mejora
    prevAsi = cumAsi;
    levels[lv.level] = {
      prof_bonus: lv.prof_bonus,
      asi: asiHere,
      features: (lv.features || []).map((f) => f.name),
      spellcasting: sc
        ? {
            cantrips_known: sc.cantrips_known ?? 0,
            spells_known: sc.spells_known ?? null,   // null => preparador (elige libre)
            slots: {
              1: sc.spell_slots_level_1 ?? 0, 2: sc.spell_slots_level_2 ?? 0,
              3: sc.spell_slots_level_3 ?? 0, 4: sc.spell_slots_level_4 ?? 0,
              5: sc.spell_slots_level_5 ?? 0, 6: sc.spell_slots_level_6 ?? 0,
              7: sc.spell_slots_level_7 ?? 0, 8: sc.spell_slots_level_8 ?? 0,
              9: sc.spell_slots_level_9 ?? 0,
            },
          }
        : null,
      class_specific: lv.class_specific || null,
    };
  }

  // competencias de armas/armadura
  const profNames = (c.proficiencies || []).map((p) => p.name);
  const hasP = (re) => profNames.some((n) => re.test(n));
  const armor_prof = {
    light: hasP(/Light Armor|All armor/i),
    medium: hasP(/Medium Armor|All armor/i),
    heavy: hasP(/Heavy Armor|All armor/i),
    shields: hasP(/Shield/i),
  };
  const weapon_prof = {
    simple: hasP(/Simple Weapons/i),
    martial: hasP(/Martial Weapons/i),
    specific: profNames.filter((n) =>
      /sword|crossbow|dagger|dart|sling|staff|quarterstaff|hammer|axe|mace|club|javelin|spear|whip|rapier|scimitar|bow|blowgun|net|sickle|flail|glaive|halberd|lance|maul|morningstar|pike|trident|pick/i.test(n)
    ),
  };

  return {
    index: c.index,
    name: c.name,
    hit_die: c.hit_die,
    saving_throws: (c.saving_throws || []).map((s) => s.index),  // ["wis","cha"]
    spellcasting_ability: c.spellcasting ? c.spellcasting.spellcasting_ability.index : null,
    spellcasting_info: c.spellcasting ? txt((c.spellcasting.info || []).map((i) => `${i.name}: ${txt(i.desc)}`)) : "",
    skill_choose: skillChoose,
    skill_options: skillOptions,
    armor_prof,
    weapon_prof,
    subclasses: (c.subclasses || []).map((s) => s.name),
    levels,
  };
});

// ── EQUIPMENT: armas y armadura ─────────────────────────────────
const weapons = rawEquip
  .filter((e) => e.equipment_category && e.equipment_category.index === "weapon")
  .map((w) => {
    const props = (w.properties || []).map((p) => p.index);
    return {
      index: w.index,
      name: w.name,
      category: w.weapon_category,           // "Simple" | "Martial"
      range: w.weapon_range,                 // "Melee" | "Ranged"
      damage: w.damage ? { dice: w.damage.damage_dice, type: w.damage.damage_type ? w.damage.damage_type.name : "" } : null,
      versatile: w.two_handed_damage ? w.two_handed_damage.damage_dice : null,
      properties: props,
      finesse: props.includes("finesse"),
      thrown: props.includes("thrown"),
      ammunition: props.includes("ammunition"),
      two_handed: props.includes("two-handed"),
      range_normal: w.range ? w.range.normal : null,
      range_long: w.range ? w.range.long : null,
    };
  });

const armor = rawEquip
  .filter((e) => e.equipment_category && e.equipment_category.index === "armor")
  .map((a) => ({
    index: a.index,
    name: a.name,
    category: a.armor_category,             // "Light" | "Medium" | "Heavy" | "Shield"
    base: a.armor_class ? a.armor_class.base : 10,
    dexBonus: a.armor_class ? !!a.armor_class.dex_bonus : false,
    maxBonus: a.armor_class && a.armor_class.max_bonus != null ? a.armor_class.max_bonus : null,
    strMin: a.str_minimum || 0,
    stealthDis: !!a.stealth_disadvantage,
  }));

// ── BACKGROUNDS ─────────────────────────────────────────────────
const backgrounds = rawBg.map((b) => ({
  index: b.index,
  name: b.name,
  skills: (b.starting_proficiencies || []).map((p) => p.name.replace(/^Skill:\s*/, "")),
  feature: b.feature ? { name: b.feature.name, desc: txt(b.feature.desc) } : null,
}));

// ── AMPLIACIÓN CURADA (razas/subclases reales de D&D; solo mecánicas) ──
const attribution = ["5e-bits/5e-database (SRD/OGL)", "Mecánicas curadas a mano (nombres y stats; sin texto con copyright)"];

// Razas oficiales conocidas (mecánica resumida; flavor escrito por nosotros).
const RACE = (name, speed, size, bonuses, traits, extra = {}) => ({
  index: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-"),
  name, speed, size,
  ability_bonuses: Object.entries(bonuses).map(([ability, bonus]) => ({ ability, bonus })),
  languages: [], language_desc: extra.lang || "", age: "", alignment: "",
  traits: traits.map(([n, d]) => ({ name: n, desc: d })),
  subraces: (extra.subraces || []).map((n) => ({ index: n.toLowerCase().replace(/[^a-z]+/g, "-"), name: n })),
  source: "Mecánica curada",
});
const EXTRA_RACES = [
  RACE("Aasimar", 30, "Medium", { cha: 2 }, [["Visión en la oscuridad", "Ves en penumbra a 18 m."], ["Resistencia celestial", "Resistencia a daño necrótico y radiante."], ["Manos sanadoras", "1/descanso largo: curás PV = tu nivel."]], { subraces: ["Protector", "Flagelo", "Caído"] }),
  RACE("Goliath", 30, "Medium", { str: 2, con: 1 }, [["Constitución poderosa", "Contás como una talla más grande para cargar/empujar."], ["Resistencia de piedra", "1/descanso corto: reducís un daño en 1d12 + mod CON."], ["Nacido en la montaña", "Resistencia al frío; aclimatado a la altura."]]),
  RACE("Aarakocra", 25, "Medium", { dex: 2, wis: 1 }, [["Vuelo", "Velocidad de vuelo 15 m (50 pies). No podés volar con armadura media/pesada."], ["Garras", "Ataque natural sin armas: 1d4 cortante."]]),
  RACE("Tabaxi", 30, "Medium", { dex: 2, cha: 1 }, [["Visión en la oscuridad", "18 m."], ["Agilidad felina", "Duplicás tu velocidad hasta fin de turno (se recarga si no te movés)."], ["Garras", "Trepar 6 m con velocidad de trepar; garras 1d4 cortante."]]),
  RACE("Firbolg", 30, "Medium", { wis: 2, str: 1 }, [["Magia de firbolg", "Lanzás Detectar Magia y Disfrazarse 1/descanso corto."], ["Paso oculto", "Acción adicional: invisible hasta tu próximo turno (1/descanso corto)."], ["Constitución poderosa", "Contás como una talla más grande para cargar."]]),
  RACE("Tortle", 30, "Medium", { str: 2, wis: 1 }, [["Armadura natural", "CA base 17 (no usás armadura)."], ["Defensa de caparazón", "Te metés en el caparazón: +4 CA, pero quedás tumbado e incapacitado."], ["Aguantar la respiración", "Hasta 1 hora."]]),
  RACE("Kenku", 30, "Medium", { dex: 2, wis: 1 }, [["Imitación", "Imitás cualquier sonido que hayas oído."], ["Falsificación experta", "Ventaja para duplicar objetos/escritos."]]),
  RACE("Genasi", 30, "Medium", { con: 2 }, [["Linaje elemental", "Según el subtipo: Aire (+1 DES), Tierra (+1 FUE), Fuego (+1 INT), Agua (+1 SAB), con un truco/efecto propio."]], { subraces: ["Aire", "Tierra", "Fuego", "Agua"] }),
  RACE("Bugbear", 30, "Medium", { str: 2, dex: 1 }, [["Visión en la oscuridad", "18 m."], ["Miembros largos", "Tu alcance cuerpo a cuerpo es +1,5 m."], ["Ataque sorpresa", "Si pegás a un sorprendido en el 1er turno: +2d6 daño."], ["Constitución poderosa", "Contás como una talla más grande para cargar."]]),
  RACE("Goblin", 30, "Small", { dex: 2, con: 1 }, [["Visión en la oscuridad", "18 m."], ["Furia de los pequeños", "+nivel al daño 1/descanso contra criaturas más grandes."], ["Escape ágil", "Esconderse o Retirarse como acción adicional cada turno."]]),
  RACE("Hobgoblin", 30, "Medium", { con: 2, int: 1 }, [["Visión en la oscuridad", "18 m."], ["Entrenamiento marcial", "Competencia con armadura ligera y 2 armas marciales."], ["Salvar las apariencias", "1/descanso: sumás a una tirada fallada +1 por aliado cercano (máx +5)."]]),
  RACE("Kobold", 30, "Small", { dex: 2 }, [["Visión en la oscuridad", "18 m."], ["Tácticas de manada", "Ventaja al atacar si un aliado está adyacente al objetivo."], ["Sensibilidad a la luz solar", "Desventaja en ataques y Percepción visual bajo luz solar directa."]]),
  RACE("Orc", 30, "Medium", { str: 2, con: 1 }, [["Visión en la oscuridad", "18 m."], ["Agresivo", "Acción adicional: te movés tu velocidad hacia un enemigo."], ["Constitución poderosa", "Contás como una talla más grande para cargar."]]),
  RACE("Lizardfolk", 30, "Medium", { con: 2, wis: 1 }, [["Armadura natural", "CA base 13 + mod DES (sin armadura)."], ["Aguantar la respiración", "Hasta 15 min."], ["Mordisco hambriento", "Acción adicional: mordés (1d6 + FUE) y ganás PV temporales."]]),
  RACE("Triton", 30, "Medium", { str: 1, con: 1, cha: 1 }, [["Anfibio", "Respirás aire y agua; velocidad de nado 30 pies."], ["Control del aire y el agua", "Lanzás Niebla / Hablar con animales / Muro de viento según el nivel, 1/descanso largo."], ["Visión en la oscuridad", "18 m."]]),
  RACE("Yuan-ti (Sangre Pura)", 30, "Medium", { cha: 2, int: 1 }, [["Resistencia mágica", "Ventaja en salvaciones contra hechizos y efectos mágicos."], ["Inmunidad al veneno", "Inmune a daño de veneno y a la condición envenenado."], ["Magia innata", "Lanzás Amistad con animales (serpientes) a voluntad, y Veneno/Sugestión 1/descanso."]]),
  RACE("Githyanki", 30, "Medium", { str: 2, int: 1 }, [["Visión en la oscuridad", "18 m."], ["Maestría decadente", "Aprendés un idioma extra y competencia con una habilidad o herramienta."], ["Prodigio marcial", "Competencia con armadura ligera y media y con espadas corta, larga y mandoble."], ["Psiónica githyanki", "Lanzás Mano Mágica (invisible) a voluntad; a nivel 3 Salto y a nivel 5 Paso Brumoso (1/descanso largo cada uno). Característica: Inteligencia."]]),
  RACE("Githzerai", 30, "Medium", { wis: 2, int: 1 }, [["Visión en la oscuridad", "18 m."], ["Disciplina mental", "Ventaja en salvaciones contra estar hechizado o asustado."], ["Psiónica githzerai", "Lanzás Mano Mágica (invisible) a voluntad; a nivel 3 Escudo y a nivel 5 Detectar Pensamientos (1/descanso largo). Característica: Sabiduría."]]),
];
const existentes = new Set(races.map((r) => r.name.toLowerCase()));
for (const r of EXTRA_RACES) if (!existentes.has(r.name.toLowerCase())) races.push(r);
console.log(`  + ${EXTRA_RACES.length} razas oficiales curadas`);

// Trasfondos del manual básico (nombre + habilidades que otorgan).
const BG = (name, skills) => ({ index: name.toLowerCase().replace(/[^a-z]+/g, "-"), name, skills, feature: null, source: "Manual básico" });
const backgroundsFinal = [
  BG("Acólito", ["Insight", "Religion"]), BG("Charlatán", ["Deception", "Sleight of Hand"]),
  BG("Criminal", ["Deception", "Stealth"]), BG("Artista", ["Acrobatics", "Performance"]),
  BG("Héroe del pueblo", ["Animal Handling", "Survival"]), BG("Artesano gremial", ["Insight", "Persuasion"]),
  BG("Ermitaño", ["Medicine", "Religion"]), BG("Noble", ["History", "Persuasion"]),
  BG("Forastero", ["Athletics", "Survival"]), BG("Sabio", ["Arcana", "History"]),
  BG("Marinero", ["Athletics", "Perception"]), BG("Soldado", ["Athletics", "Intimidation"]),
  BG("Pillo", ["Sleight of Hand", "Stealth"]),
];
console.log(`  + ${backgroundsFinal.length} trasfondos del manual`);

// Subclases reales por clase (nombres oficiales; mecánica a mano salvo la del SRD).
const SUBCLASS_NAMES = {
  barbarian: ["Berserker", "Tótem", "Guardián Ancestral", "Heraldo de la Tormenta", "Fanático", "Bestia", "Magia Salvaje"],
  bard: ["Lore", "Valor", "Glamour", "Espadas", "Susurros", "Elocuencia", "Creación"],
  cleric: ["Life", "Luz", "Engaño", "Conocimiento", "Naturaleza", "Tempestad", "Guerra", "Muerte", "Forja", "Tumba", "Orden", "Paz", "Crepúsculo"],
  druid: ["Land", "Luna", "Sueños", "Pastor", "Esporas", "Estrellas", "Fuego Salvaje"],
  fighter: ["Champion", "Maestro de Batalla", "Caballero Arcano", "Arquero Arcano", "Caballero", "Samurái", "Caballero del Eco", "Guerrero Psi", "Caballero Rúnico"],
  monk: ["Open Hand", "Sombra", "Cuatro Elementos", "Maestro Borracho", "Kensei", "Alma del Sol", "Piedad", "Yo Astral"],
  paladin: ["Devotion", "Antiguos", "Venganza", "Conquista", "Redención", "Gloria", "Vigilantes", "Rompejuramentos"],
  ranger: ["Hunter", "Amo de Bestias", "Acechador de la Penumbra", "Caminante del Horizonte", "Cazamonstruos", "Errante Feérico", "Guardián de Enjambres"],
  rogue: ["Thief", "Asesino", "Embaucador Arcano", "Cerebro", "Espadachín", "Explorador", "Inquisitivo", "Cuchilla Psíquica", "Fantasma"],
  sorcerer: ["Draconic", "Magia Salvaje", "Alma Divina", "Sombra", "Tormenta", "Mente Aberrante", "Alma de Relojería"],
  warlock: ["Fiend", "Archifey", "Gran Antiguo", "Espada Maldita", "Celestial", "Insondable", "Genio", "No Muerto"],
  wizard: ["Evocation", "Abjuración", "Conjuración", "Adivinación", "Encantamiento", "Ilusión", "Nigromancia", "Transmutación", "Cantante de Espadas", "Magia de Guerra", "Escribas"],
};
for (const c of classes) {
  const srdNames = new Set(c.subclasses);
  const names = SUBCLASS_NAMES[c.index] || c.subclasses;
  c.subclasses_full = names.map((n) => ({ name: n, desc: "", source: srdNames.has(n) ? "SRD" : "Oficial", srd: srdNames.has(n) }));
}
console.log(`  + ${classes.reduce((s, c) => s + c.subclasses_full.length, 0)} subclases curadas`);

// ── DEIDADES (apéndice abierto "Gods of the Multiverse", SRD) ────
const deities = buildDeities();

// ── HECHIZOS EXTRA (fuera del SRD 5.1; están en el SRD 5.2, CC-BY-4.0;
//    descripciones parafraseadas, sin texto literal del manual) ──────
const EXTRA_SPELLS = [
  {
    index: "hex",
    name: "Hex",
    level: 1,
    school: "Enchantment",
    casting_time: "1 bonus action",
    range: "90 feet",
    duration: "Concentration, up to 1 hour",
    concentration: true,
    ritual: false,
    components: ["V", "S", "M"],
    classes: ["warlock"],
    attack_type: null,
    save: null,
    area: null,
    damage: { tipo: "Necrotic", bySlot: { "1": "1d6" }, byChar: null },
    heal: null,
    desc: "You curse a creature you can see within range. Until the spell ends, the target takes an extra 1d6 necrotic damage whenever you hit it with an attack, and it has disadvantage on ability checks made with one ability you choose when casting. If the target drops to 0 hit points before the spell ends, you can use a bonus action on a later turn to move the curse to a new creature. A remove curse cast on the target ends the spell early.",
    higher_level: "With a spell slot of 3rd or 4th level, you can maintain concentration for up to 8 hours; with a slot of 5th level or higher, up to 24 hours.",
  },
];
for (const s of EXTRA_SPELLS) {
  if (!spells.some((x) => x.index === s.index)) spells.push(s);
}
console.log(`  + ${EXTRA_SPELLS.length} hechizos extra curados`);

// ── ESCRIBIR ────────────────────────────────────────────────────
await mkdir(OUT, { recursive: true });
const files = {
  "spells.json": spells,
  "classes.json": classes,
  "races.json": races,
  "backgrounds.json": backgroundsFinal,
  "weapons.json": weapons,
  "armor.json": armor,
  "deities.json": deities,
  "meta.json": {
    sources: attribution,
    generated: new Date().toISOString(),
    counts: { spells: spells.length, classes: classes.length, races: races.length, backgrounds: backgroundsFinal.length, weapons: weapons.length, armor: armor.length, deities: deities.length },
  },
};
for (const [name, data] of Object.entries(files)) {
  await writeFile(path.join(OUT, name), JSON.stringify(data), "utf-8");
  console.log(`  ✓ public/srd/${name}`);
}
console.log("Listo.");

// ════════════════════════════════════════════════════════════════
//  Deidades — del apéndice abierto del SRD "Gods of the Multiverse"
//  (contenido OGL). Incluye Forgotten Realms, deidades no humanas
//  y los panteones históricos. name · alignment · domains · pantheon.
// ════════════════════════════════════════════════════════════════
function buildDeities() {
  const mk = (pantheon) => (rows) => rows.map(([name, alignment, domains]) => ({ name, alignment, domains, pantheon }));

  const fr = mk("Forgotten Realms")([
    ["Auril", "NE", ["Naturaleza", "Tempestad"]], ["Azuth", "LN", ["Conocimiento"]],
    ["Bane", "LE", ["Guerra"]], ["Beshaba", "CE", ["Engaño"]], ["Bhaal", "NE", ["Muerte"]],
    ["Chauntea", "NG", ["Vida"]], ["Cyric", "CE", ["Engaño"]], ["Deneir", "NG", ["Conocimiento"]],
    ["Eldath", "NG", ["Naturaleza", "Vida"]], ["Gond", "N", ["Conocimiento"]],
    ["Helm", "LN", ["Vida", "Luz"]], ["Ilmater", "LG", ["Vida"]], ["Kelemvor", "LN", ["Muerte"]],
    ["Lathander", "NG", ["Vida", "Luz"]], ["Leira", "CN", ["Engaño"]], ["Lliira", "CG", ["Vida"]],
    ["Loviatar", "LE", ["Muerte"]], ["Malar", "CE", ["Naturaleza"]], ["Mask", "CN", ["Engaño"]],
    ["Mielikki", "NG", ["Naturaleza"]], ["Milil", "NG", ["Luz", "Conocimiento"]],
    ["Myrkul", "NE", ["Muerte"]], ["Mystra", "NG", ["Conocimiento"]], ["Oghma", "N", ["Conocimiento"]],
    ["Savras", "LN", ["Conocimiento"]], ["Selûne", "CG", ["Conocimiento", "Vida"]],
    ["Shar", "NE", ["Muerte", "Engaño"]], ["Silvanus", "N", ["Naturaleza"]],
    ["Sune", "CG", ["Vida", "Luz"]], ["Talona", "CE", ["Muerte"]], ["Talos", "CE", ["Tempestad"]],
    ["Tempus", "N", ["Guerra"]], ["Torm", "LG", ["Guerra"]], ["Tymora", "CG", ["Engaño"]],
    ["Tyr", "LG", ["Guerra"]], ["Umberlee", "CE", ["Tempestad"]], ["Waukeen", "N", ["Conocimiento", "Engaño"]],
  ]);

  const nh = mk("Deidades no humanas")([
    ["Bahamut", "LG", ["Vida", "Guerra"]], ["Corellon Larethian", "CG", ["Luz"]],
    ["Garl Glittergold", "LG", ["Engaño"]], ["Gruumsh", "CE", ["Tempestad", "Guerra"]],
    ["Lolth", "CE", ["Engaño"]], ["Moradin", "LG", ["Conocimiento"]],
    ["Sehanine Moonbow", "CG", ["Conocimiento"]], ["Tiamat", "LE", ["Engaño"]],
    ["Yondalla", "LG", ["Vida"]], ["Rillifane Rallathil", "CG", ["Naturaleza"]],
    ["Sekolah", "LE", ["Naturaleza", "Tempestad"]], ["Skoraeus Stonebones", "N", ["Conocimiento"]],
  ]);

  const greek = mk("Panteón griego")([
    ["Zeus", "N", ["Tempestad"]], ["Atenea", "LG", ["Conocimiento", "Guerra"]],
    ["Apolo", "CG", ["Conocimiento", "Vida", "Luz"]], ["Ares", "CE", ["Guerra"]],
    ["Ártemis", "NG", ["Vida", "Naturaleza"]], ["Hades", "LE", ["Muerte"]],
    ["Hécate", "CE", ["Conocimiento", "Engaño"]], ["Poseidón", "CN", ["Tempestad"]],
    ["Tique", "N", ["Engaño"]], ["Hefesto", "NG", ["Conocimiento"]],
  ]);

  const egyptian = mk("Panteón egipcio")([
    ["Ra", "LG", ["Vida", "Luz"]], ["Anubis", "LN", ["Muerte"]], ["Bast", "CG", ["Guerra", "Engaño"]],
    ["Isis", "NG", ["Conocimiento", "Vida"]], ["Osiris", "LG", ["Vida", "Naturaleza"]],
    ["Set", "LE", ["Muerte", "Engaño", "Tempestad"]], ["Thoth", "N", ["Conocimiento"]],
  ]);

  const norse = mk("Panteón nórdico")([
    ["Odín", "NG", ["Conocimiento", "Guerra"]], ["Thor", "CG", ["Tempestad", "Guerra"]],
    ["Tyr", "LN", ["Conocimiento", "Guerra"]], ["Frigga", "N", ["Vida", "Luz"]],
    ["Loki", "CE", ["Engaño"]], ["Hel", "NE", ["Muerte"]], ["Frey", "NG", ["Vida", "Luz"]],
  ]);

  const celtic = mk("Panteón celta")([
    ["Lugh", "CN", ["Conocimiento", "Vida"]], ["The Daghdha", "CG", ["Naturaleza", "Engaño"]],
    ["Morrigan", "CE", ["Guerra"]], ["Brigantia", "NG", ["Vida"]], ["Arawn", "NE", ["Vida", "Muerte"]],
  ]);

  const sl = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, "-").replace(/^-+|-+$/g, "");
  return [...fr, ...nh, ...greek, ...egyptian, ...norse, ...celtic]
    .map((d) => ({ index: `${sl(d.name)}-${sl(d.pantheon)}`, ...d }));
}
