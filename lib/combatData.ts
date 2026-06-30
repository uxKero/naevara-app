// ════════════════════════════════════════════════════════════════
//  Hoja de combate de Naevara — referencia curada de reglas (D&D 5e)
//  Brujo del Gran Antiguo · Pacto del Tomo · Nivel 5
//
//  Los NÚMEROS de vitales/salvaciones se leen en vivo desde
//  character.json (ver vitalesDesde / salvacionesDesde más abajo).
//  Las INSTRUCCIONES de cada habilidad son referencia fija de 5e,
//  escritas en lenguaje claro para usar en la mesa.
// ════════════════════════════════════════════════════════════════

import { CharacterData } from "@/types/character";

// ── Daño que se tira ────────────────────────────────────────────
export interface Dano {
  cantidad: number;
  caras: number;
  tipo: string;               // "fuerza", "necrótico", "frío", "ácido"...
  modificador?: number;       // +5 de Agonizing Blast, etc.
  modLabel?: string;          // "Carisma"
  flat?: number;              // daño fijo sin tirar (Armor of Agathys: 15)
  etiqueta?: string;          // "por rayo", "extra por golpe", "por turno"
  variante?: {                // segunda forma del dado (Toll the Dead)
    cantidad: number;
    caras: number;
    etiqueta: string;         // "Ya herido"
    etiquetaBase: string;     // "Sano"
  };
}

// ── Qué se tira para que funcione ───────────────────────────────
export type Tirada =
  | { tipo: "ataque"; bonus: number; rayos?: number; nota?: string }
  | { tipo: "salvacion"; stat: string; cd: number; fallo: string; exito: string; nota?: string }
  | { tipo: "ninguna"; nota?: string }
  | { tipo: "especial"; texto: string };

export type Grupo =
  | "loop"
  | "accion"
  | "reaccion"
  | "defensa"
  | "utilidad"
  | "info"
  | "armas"
  | "riders"
  | "pasiva";

export interface CombatAction {
  id: string;
  nombre: string;
  grupo: Grupo;
  coste: string;              // "Truco · gratis", "1 espacio (3er nivel)", "Pasiva"...
  usaEspacio?: boolean;       // true → gasta uno de los 2 espacios de 3er nivel
  accion: string;            // "Acción", "Acción adicional", "Reacción", "Pasiva"...
  alcance: string;
  queHace: string;
  tirada: Tirada;
  danos?: Dano[];
  concentracion?: boolean;
  duracion?: string;
  cuando?: string;           // cuándo usarla
  ojo?: string;              // advertencia / cuándo NO
  delBuild?: boolean;        // true → no figura en character.json, es del build canónico
  destacado?: boolean;
}

export const GRUPOS: { id: Grupo; titulo: string; icono: string; desc: string }[] = [
  { id: "loop",     titulo: "Tu loop de combate",            icono: "⚔", desc: "Lo que hacés casi todos los turnos." },
  { id: "accion",   titulo: "Acción — daño y control",       icono: "✦", desc: "Una por turno. Cuesta tu acción." },
  { id: "reaccion", titulo: "Reacción",                       icono: "⟳", desc: "Fuera de tu turno, cuando se dispara." },
  { id: "defensa",  titulo: "Defensa",                        icono: "🛡", desc: "Para aguantar golpes." },
  { id: "utilidad", titulo: "Trucos y utilidad",             icono: "✧", desc: "Trucos gratis e ilimitados." },
  { id: "info",     titulo: "Información y exploración",      icono: "👁", desc: "Fuera de combate, sobre todo." },
  { id: "armas",    titulo: "Armas",                          icono: "🗡", desc: "Ataques con arma." },
  { id: "riders",   titulo: "Daño extra y situacional",       icono: "✚", desc: "Se suma a un golpe cuando aplica." },
  { id: "pasiva",   titulo: "Pasivas y permanentes",         icono: "∞", desc: "Siempre activas. No se tiran." },
];

// ════════════════════════════════════════════════════════════════
//  LAS HABILIDADES
// ════════════════════════════════════════════════════════════════
export const COMBAT: CombatAction[] = [
  // ── LOOP ──────────────────────────────────────────────────────
  {
    id: "eldritch-blast",
    nombre: "Eldritch Blast",
    grupo: "loop",
    coste: "Truco · gratis e ilimitado",
    accion: "Acción",
    alcance: "36 m",
    destacado: true,
    queHace:
      "Tu ataque a distancia básico. A nivel 5 disparás 2 rayos: cada rayo es un ataque aparte y podés mandarlos al mismo enemigo o a dos distintos.",
    tirada: {
      tipo: "ataque",
      bonus: 8,
      rayos: 2,
      nota: "Cada rayo: 1d20 + 8 contra la CA del enemigo. Si igualás o superás, pega. Un 20 natural es crítico (doblás los dados de daño de ESE rayo).",
    },
    danos: [
      { cantidad: 1, caras: 10, tipo: "fuerza", modificador: 5, modLabel: "Carisma", etiqueta: "por rayo" },
    ],
    cuando:
      "Tu acción por defecto casi todos los turnos. Si ya tenés Hex puesto, cada rayo suma además 1d6 necrótico.",
  },
  {
    id: "hex",
    nombre: "Hex",
    grupo: "loop",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Acción adicional",
    alcance: "27 m",
    destacado: true,
    queHace:
      "Maldecís a un enemigo. Cada vez que LE PEGUES con cualquier ataque, suma 1d6 de daño necrótico. Además elegís una característica (ej. Fuerza) y el enemigo tira con desventaja esas pruebas.",
    tirada: {
      tipo: "ninguna",
      nota: "No se tira nada para aplicarla: la maldición pega sola. El 1d6 extra se tira junto con el daño cada vez que le pegás.",
    },
    danos: [
      { cantidad: 1, caras: 6, tipo: "necrótico", etiqueta: "extra por cada golpe" },
    ],
    concentracion: true,
    duracion: "hasta 1 hora (concentración)",
    cuando:
      "Primer turno, sobre el enemigo más peligroso, y después Eldritch Blast. Si ese enemigo cae, podés mover la maldición a otro con tu acción adicional, sin gastar otro espacio.",
    ojo:
      "Usa concentración: no podés tener Hex y Hold Person / Hunger of Hadar / Fly al mismo tiempo.",
  },

  // ── ACCIÓN: daño y control ────────────────────────────────────
  {
    id: "toll-the-dead",
    nombre: "Toll the Dead",
    grupo: "accion",
    coste: "Truco · gratis e ilimitado",
    accion: "Acción",
    alcance: "18 m",
    queHace:
      "Hacés sonar una campana fúnebre invisible sobre un enemigo. Daño necrótico — pega más fuerte si ya está herido.",
    tirada: {
      tipo: "salvacion",
      stat: "Sabiduría",
      cd: 16,
      fallo: "recibe todo el daño.",
      exito: "no recibe nada (es un truco: si salva, falla del todo).",
    },
    danos: [
      {
        cantidad: 1, caras: 8, tipo: "necrótico",
        variante: { cantidad: 1, caras: 12, etiqueta: "Ya herido (le falta vida)", etiquetaBase: "Sano (vida llena)" },
      },
    ],
    cuando:
      "Cuando no querés gastar espacio y el enemigo YA está golpeado: ahí tirás 1d12 en vez de 1d8.",
  },
  {
    id: "dissonant-whispers",
    nombre: "Dissonant Whispers",
    grupo: "accion",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "Acción",
    alcance: "18 m",
    queHace:
      "Susurros psíquicos que aterran. El enemigo recibe daño y, si falla, usa su reacción para HUIR lo más lejos que pueda — y tus aliados pueden pegarle un ataque de oportunidad mientras escapa.",
    tirada: {
      tipo: "salvacion",
      stat: "Sabiduría",
      cd: 16,
      fallo: "daño completo + huye aterrorizado usando su reacción.",
      exito: "la mitad del daño y no huye.",
    },
    danos: [
      { cantidad: 3, caras: 6, tipo: "psíquico" },
    ],
    cuando:
      "Para sacar a un enemigo de encima de un aliado, o para abrir ataques de oportunidad del grupo.",
    ojo:
      "Las criaturas sordas pasan la salvación automáticamente. No cuenta contra tus hechizos conocidos (es de patrón).",
  },
  {
    id: "tashas",
    nombre: "Tasha's Hideous Laughter",
    grupo: "accion",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "Acción",
    alcance: "9 m",
    queHace:
      "El enemigo estalla en una risa incontrolable: cae al suelo, queda incapacitado y no puede moverse ni actuar. Control puro, sin daño.",
    tirada: {
      tipo: "salvacion",
      stat: "Sabiduría",
      cd: 16,
      fallo: "queda tumbado e incapacitado.",
      exito: "no pasa nada.",
      nota: "Repite la salvación al final de cada uno de sus turnos. Si recibe daño, repite con ventaja.",
    },
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando:
      "Para anular a un enemigo peligroso de bajo nivel mental.",
    ojo:
      "Solo afecta criaturas con Inteligencia 5 o más (no bestias tontas ni autómatas). No cuenta contra tus hechizos conocidos.",
  },
  {
    id: "phantasmal-force",
    nombre: "Phantasmal Force",
    grupo: "accion",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "Acción",
    alcance: "18 m",
    queHace:
      "Metés una ilusión en la mente de UNA criatura que la cree totalmente real. Mientras la sostenés, podés hacerle creer que algo la lastima (1d6 psíquico por turno).",
    tirada: {
      tipo: "salvacion",
      stat: "Inteligencia",
      cd: 16,
      fallo: "cree la ilusión y la sufre.",
      exito: "no le afecta.",
    },
    danos: [
      { cantidad: 1, caras: 6, tipo: "psíquico", etiqueta: "por turno" },
    ],
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando:
      "Contra un solo objetivo inteligente: daño sostenido + lo confundís. No cuenta contra tus hechizos conocidos.",
  },
  {
    id: "hold-person",
    nombre: "Hold Person",
    grupo: "accion",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Acción",
    alcance: "18 m",
    destacado: true,
    queHace:
      "Paralizás hasta 2 humanoides (lo lanzás con tu espacio de 3er nivel). Paralizado = no se mueve ni actúa, falla las salvaciones de Fuerza y Destreza, y TODO ataque cuerpo a cuerpo contra él es CRÍTICO automático.",
    tirada: {
      tipo: "salvacion",
      stat: "Sabiduría",
      cd: 16,
      fallo: "queda paralizado.",
      exito: "se libera.",
      nota: "Repite la salvación al inicio de cada uno de sus turnos; si la pasa, se suelta.",
    },
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando:
      "Contra un jefe humanoide. Avisá YA a los aliados cuerpo a cuerpo: cada golpe suyo será crítico.",
    ojo:
      "Solo funciona en humanoides (no bestias, no muertos vivientes, no dragones).",
  },
  {
    id: "hunger-of-hadar",
    nombre: "Hunger of Hadar",
    grupo: "accion",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Acción",
    alcance: "45 m · esfera de 6 m de radio",
    destacado: true,
    queHace:
      "Abrís una esfera de vacío del Reino Lejano: oscuridad mágica total y terreno difícil adentro. Niega la zona y atrapa a quien quede dentro.",
    tirada: {
      tipo: "salvacion",
      stat: "Destreza",
      cd: 16,
      fallo: "2d6 de ácido de los tentáculos del vacío.",
      exito: "esquiva los tentáculos (no recibe el ácido).",
      nota: "Esto es solo para quien TERMINA su turno dentro. El frío de abajo no tiene salvación.",
    },
    danos: [
      { cantidad: 2, caras: 6, tipo: "frío",  etiqueta: "al EMPEZAR el turno dentro · sin salvación" },
      { cantidad: 2, caras: 6, tipo: "ácido", etiqueta: "al TERMINAR el turno dentro · si falla salvación Des" },
    ],
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando:
      "Para frenar a un grupo, bloquear un pasillo o negar terreno.",
    ojo:
      "Vos tampoco ves adentro (no tenés Devil's Sight). Usalo para bloquear, no para disparar dentro de la zona.",
  },
  {
    id: "fly",
    nombre: "Fly",
    grupo: "accion",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Acción",
    alcance: "Toque (podés ser vos)",
    destacado: true,
    queHace:
      "Le das velocidad de vuelo de 18 m a una criatura dispuesta durante 10 minutos.",
    tirada: { tipo: "ninguna", nota: "No se tira nada: simplemente vuela." },
    concentracion: true,
    duracion: "10 minutos (concentración)",
    cuando:
      "Para reposicionarte, alcanzar lo inalcanzable o moverte en la ciudad flotante / el dungeon vertical.",
    ojo:
      "Si perdés la concentración en el aire, caés (daño de caída). No convive con Hex / Hold Person / Hunger.",
  },

  // ── REACCIÓN ──────────────────────────────────────────────────
  {
    id: "counterspell",
    nombre: "Counterspell",
    grupo: "reaccion",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Reacción",
    alcance: "18 m",
    destacado: true,
    queHace:
      "Cuando VES a una criatura lanzando un hechizo, la interrumpís y lo anulás antes de que ocurra.",
    tirada: {
      tipo: "especial",
      texto:
        "Automático si el hechizo enemigo es de 3er nivel o menos. Si es de 4.º o más: tirás 1d20 + 5 (Carisma) y tenés que igualar o superar CD 10 + el nivel del hechizo enemigo.",
    },
    duracion: "Instantáneo",
    cuando:
      "Guardá un espacio para cuando un cultista lance un ritual o una invocación peligrosa. No usa concentración, así que convive con Hex.",
  },

  // ── DEFENSA ───────────────────────────────────────────────────
  {
    id: "armor-of-agathys",
    nombre: "Armor of Agathys",
    grupo: "defensa",
    coste: "1 espacio (3er nivel)",
    usaEspacio: true,
    accion: "Acción",
    alcance: "Vos misma",
    queHace:
      "Te cubrís de hielo espectral: ganás 15 puntos de vida temporales. Mientras te duren, quien te pegue cuerpo a cuerpo recibe 15 de frío automáticamente.",
    tirada: { tipo: "ninguna", nota: "No se tira: la vida temporal y el daño al atacante son automáticos." },
    danos: [
      { cantidad: 0, caras: 0, tipo: "frío", flat: 15, etiqueta: "al que te pegue cuerpo a cuerpo" },
    ],
    duracion: "1 hora o hasta gastar la vida temporal · sin concentración",
    cuando:
      "Antes de meterte donde vas a recibir golpes cuerpo a cuerpo. Marca tus 15 de vida temporal en el tracker de arriba.",
  },

  // ── TRUCOS Y UTILIDAD ─────────────────────────────────────────
  {
    id: "guidance",
    nombre: "Guidance",
    grupo: "utilidad",
    coste: "Truco · gratis e ilimitado",
    accion: "Acción",
    alcance: "Toque",
    queHace:
      "Tocás a un aliado: antes de 1 minuto puede sumar 1d4 a UNA prueba de característica (no a ataques ni salvaciones).",
    tirada: { tipo: "ninguna", nota: "No se tira para aplicarla. El aliado tira el 1d4 cuando hace la prueba." },
    danos: [
      { cantidad: 1, caras: 4, tipo: "bonificación", etiqueta: "se suma a la prueba del aliado" },
    ],
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando:
      "Fuera de combate, en cada tirada importante del grupo (trabar cerraduras, persuadir, investigar...). Casi sin costo.",
  },
  {
    id: "minor-illusion",
    nombre: "Minor Illusion",
    grupo: "utilidad",
    coste: "Truco · gratis e ilimitado",
    accion: "Acción",
    alcance: "9 m",
    queHace:
      "Creás un sonido o una imagen falsa (del tamaño de un cubo de 1,5 m) durante 1 minuto. Sirve para distraer, confundir o crear oportunidades.",
    tirada: { tipo: "ninguna", nota: "Quien sospeche puede gastar su acción en una prueba de Investigación contra tu CD 16 para descubrir que es falsa." },
    duracion: "1 minuto",
    cuando: "Distraer guardias, simular ruidos, tapar una puerta a la vista.",
  },
  {
    id: "prestidigitation",
    nombre: "Prestidigitation",
    grupo: "utilidad",
    coste: "Truco · gratis e ilimitado",
    accion: "Acción",
    alcance: "3 m",
    queHace:
      "Efectos mágicos menores: chispas, sonidos, olores, limpiar o ensuciar, enfriar/calentar, marcar superficies.",
    tirada: { tipo: "ninguna" },
    duracion: "Hasta 1 hora según el efecto",
    cuando: "Detalles de rol y trucos chicos. Ideal para dejar marcas discretas de la Escritura del Umbral.",
  },
  {
    id: "mage-hand",
    nombre: "Mage Hand",
    grupo: "utilidad",
    coste: "Truco · gratis e ilimitado (del Pacto del Tomo)",
    accion: "Acción",
    alcance: "9 m",
    queHace:
      "Una mano arcana invisible que puede llevar, empujar o manipular objetos de hasta 5 kg, abrir puertas, activar mecanismos a distancia.",
    tirada: { tipo: "ninguna", nota: "No puede atacar ni cargar más de 5 kg." },
    duracion: "1 minuto",
    cuando: "Desactivar trampas a distancia, alcanzar palancas, robar sin acercarte.",
  },

  // ── INFORMACIÓN / EXPLORACIÓN ─────────────────────────────────
  {
    id: "detect-thoughts",
    nombre: "Detect Thoughts",
    grupo: "info",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "Acción",
    alcance: "9 m (la criatura)",
    queHace:
      "Leés los pensamientos superficiales de una criatura cercana. Podés sondear más profundo, pero ahí ella se resiste.",
    tirada: {
      tipo: "salvacion",
      stat: "Sabiduría",
      cd: 16,
      fallo: "le leés lo profundo (y se entera de que la sondeás).",
      exito: "el sondeo profundo falla y el hechizo termina.",
      nota: "Solo si querés sondear profundo. La lectura superficial no necesita tirada.",
    },
    concentracion: true,
    duracion: "1 minuto (concentración)",
    cuando: "Interrogatorios, detectar mentiras, encontrar criaturas pensantes ocultas. La que observa, literal.",
  },
  {
    id: "clairvoyance",
    nombre: "Clairvoyance",
    grupo: "info",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "1 minuto en lanzar (fuera de combate)",
    alcance: "1,5 km, un lugar que conozcas",
    queHace:
      "Creás un sensor invisible en un lugar conocido y ves U oís a distancia desde ahí.",
    tirada: { tipo: "ninguna" },
    concentracion: true,
    duracion: "10 minutos (concentración)",
    cuando: "Espionaje puro, perfecto para 'la que observa desde lejos'. No sirve en pleno combate (tarda 1 minuto).",
  },
  {
    id: "sending",
    nombre: "Sending",
    grupo: "info",
    coste: "1 espacio (3er nivel) · hechizo de patrón",
    usaEspacio: true,
    accion: "Acción",
    alcance: "Ilimitado (misma realidad)",
    queHace:
      "Enviás un mensaje de 25 palabras a alguien que conozcas, en cualquier parte, y recibís una respuesta corta.",
    tirada: { tipo: "ninguna" },
    duracion: "Instantáneo",
    cuando: "Coordinar con aliados lejanos, negociar, pedir ayuda.",
  },

  // ── ARMAS (emergencia) ────────────────────────────────────────
  {
    id: "daga",
    nombre: "Daga (×2)",
    grupo: "armas",
    coste: "Arma · gratis",
    accion: "Acción",
    alcance: "Cuerpo a cuerpo, o arrojada 6 / 18 m",
    delBuild: true,
    queHace:
      "Arma de emergencia. Es de precisión (finesse), así que usás tu Destreza. También se puede lanzar.",
    tirada: {
      tipo: "ataque",
      bonus: 5,
      rayos: 1,
      nota: "1d20 + 5 (Destreza +2 y competencia +3) contra la CA del enemigo.",
    },
    danos: [
      { cantidad: 1, caras: 4, tipo: "cortante", modificador: 2, modLabel: "Destreza" },
    ],
    cuando: "Solo si te quedás sin opciones mágicas. Eldritch Blast casi siempre es mejor.",
  },
  {
    id: "baston",
    nombre: "Bastón",
    grupo: "armas",
    coste: "Arma · gratis",
    accion: "Acción",
    alcance: "Cuerpo a cuerpo",
    delBuild: true,
    queHace: "Golpe contundente de último recurso.",
    tirada: {
      tipo: "ataque",
      bonus: 4,
      rayos: 1,
      nota: "1d20 + 4 (Fuerza +1 y competencia +3) contra la CA del enemigo.",
    },
    danos: [
      { cantidad: 1, caras: 6, tipo: "contundente", modificador: 1, modLabel: "Fuerza" },
    ],
    cuando: "Emergencia absoluta.",
  },

  // ── PASIVAS / PERMANENTES ─────────────────────────────────────
  {
    id: "agonizing-blast",
    nombre: "Agonizing Blast",
    grupo: "pasiva",
    coste: "Invocación · permanente",
    accion: "Pasiva",
    alcance: "—",
    queHace: "Sumás +5 (tu Carisma) al daño de CADA rayo de Eldritch Blast. Ya está incluido en el daño de arriba.",
    tirada: { tipo: "ninguna" },
  },
  {
    id: "eyes-rune-keeper",
    nombre: "Eyes of the Rune Keeper",
    grupo: "pasiva",
    coste: "Invocación · permanente",
    accion: "Pasiva",
    alcance: "—",
    queHace: "Podés leer cualquier escritura en cualquier idioma. La base de la Escritura del Umbral: no hay texto oculto para vos.",
    tirada: { tipo: "ninguna" },
  },
  {
    id: "book-ancient-secrets",
    nombre: "Book of Ancient Secrets",
    grupo: "pasiva",
    coste: "Invocación · rituales gratis",
    accion: "Ritual (10 min)",
    alcance: "—",
    queHace:
      "Lanzás rituales escritos en tu Libro de las Sombras SIN gastar espacios (tardan 10 minutos): Comprehend Languages, Detect Magic, Identify, Illusory Script, y cualquier ritual que encuentres.",
    tirada: { tipo: "ninguna", nota: "No gastan espacios de hechizo. Solo fuera de combate (tardan 10 min)." },
    delBuild: true,
  },
  {
    id: "awakened-mind",
    nombre: "Awakened Mind",
    grupo: "pasiva",
    coste: "Rasgo de patrón · permanente",
    accion: "Pasiva",
    alcance: "9 m",
    delBuild: true,
    queHace:
      "Podés hablar telepáticamente (en una sola dirección) con cualquier criatura a 9 m que entienda un idioma, sin que los demás lo oigan.",
    tirada: { tipo: "ninguna" },
    cuando: "Negociar en secreto, avisar a un aliado sin que el enemigo escuche.",
    ojo: "Es rasgo canónico del Brujo del Gran Antiguo a nivel 1. Si no lo anotaste, confirmá con el Master antes de usarlo.",
  },
  {
    id: "ring-mind-shielding",
    nombre: "Anillo de Protección Mental",
    grupo: "pasiva",
    coste: "Objeto mágico · sintonizado",
    accion: "Pasiva (volverte invisible: Acción)",
    alcance: "—",
    queHace:
      "Inmune a hechizos que leen pensamientos o detectan mentiras; oculta tu alineamiento y tipo de criatura. Con una acción podés volverte invisible. Si murieras, tu alma puede quedar en el anillo.",
    tirada: { tipo: "ninguna" },
    cuando: "Defensa permanente contra adivinación. La invisibilidad cuesta tu acción.",
  },
];

// ════════════════════════════════════════════════════════════════
//  Vitales y salvaciones — LEÍDOS EN VIVO desde character.json
// ════════════════════════════════════════════════════════════════
function buscarCombate(data: CharacterData, incluye: string): string {
  const hit = data.stats.combate.find((c) => c.label.toLowerCase().includes(incluye.toLowerCase()));
  return hit?.valor ?? "—";
}

export interface Vital { label: string; valor: string; nota?: string; icono: string; principal?: boolean }

export function vitalesDesde(data: CharacterData): Vital[] {
  const des = data.stats.base.find((b) => b.nombre === "Destreza");
  const iniciativa = des?.modificador ?? "+2";
  return [
    { label: "Vida máxima",       valor: buscarCombate(data, "vida"),        icono: "❤️", principal: true, nota: "Tus puntos de golpe totales." },
    { label: "Clase de Armadura", valor: buscarCombate(data, "armadura"),    icono: "🛡", principal: true, nota: "El enemigo necesita igualar o superar esto en su tirada de ataque para pegarte." },
    { label: "CD de hechizos",    valor: buscarCombate(data, "cd"),          icono: "✦", principal: true, nota: "Cuando TÚ atacás con un hechizo de salvación, el enemigo debe sacar este número o más para resistir." },
    { label: "Ataque arcano",    valor: buscarCombate(data, "ataque"),      icono: "🎯", principal: true, nota: "Lo que sumás a tu 1d20 cuando tirás para pegar con un hechizo (ej. Eldritch Blast)." },
    { label: "Iniciativa",        valor: iniciativa,                          icono: "⚡", nota: "Tirás 1d20 + esto al empezar el combate para ver el orden." },
    { label: "Velocidad",         valor: "9 m",                               icono: "👣", nota: "Lo que te movés por turno (30 pies)." },
    { label: "Competencia",       valor: buscarCombate(data, "competencia"), icono: "➕", nota: "El bono que ya está sumado en lo que sabés hacer." },
    { label: "Percepción pasiva", valor: data.stats.sabiduriaPasiva,          icono: "👁", nota: "Lo que notás sin tirar. El DM lo compara con el sigilo enemigo." },
    { label: "Espacios (3er niv)",valor: buscarCombate(data, "espacios"),    icono: "🔮", nota: "Tus espacios de hechizo, todos de 3er nivel. Se recuperan con un descanso corto (1 hora)." },
  ];
}

export interface SalvacionVital { stat: string; valor: string; competente: boolean; nota?: string }

export function salvacionesDesde(data: CharacterData): SalvacionVital[] {
  const out: SalvacionVital[] = [];
  for (const s of data.stats.salvacion.conComp) {
    out.push({ stat: s.stat, valor: s.valor, competente: true, nota: s.nota });
  }
  for (const s of data.stats.salvacion.sinComp) {
    out.push({ stat: s.stat, valor: s.valor, competente: false });
  }
  return out;
}

// Total de espacios de hechizo (para el tracker). Parseado de los vitales.
export function totalEspacios(data: CharacterData): number {
  const raw = buscarCombate(data, "espacios").replace(/[^\d]/g, "");
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

export function vidaMaxima(data: CharacterData): number {
  const raw = buscarCombate(data, "vida").replace(/[^\d]/g, "");
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 44;
}
