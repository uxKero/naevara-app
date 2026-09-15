// ════════════════════════════════════════════════════════════════
//  El familiar del Pacto de la Cadena (Brujo, PHB 2014)
//
//  Las cuatro formas especiales que suma el pacto, con sus fichas
//  completas. Los números son del bicho y NO escalan con el nivel
//  del brujo: la CD de su veneno es suya, no la del lanzador.
//
//  La forma se elige en cada invocación, así que el personaje guarda
//  una preferida (BuilderCharacter.familiar) pero puede cambiarla
//  cada vez que hace el ritual.
// ════════════════════════════════════════════════════════════════
import type { CombatAction } from "./combatData";

export interface FamiliarRasgo {
  n: string;
  d: string;
}

export interface Familiar {
  id: string;
  nombre: string;
  tipo: string;
  ca: number;
  pv: number;
  velocidad: string;
  abilities: { fue: number; des: number; con: number; int: number; sab: number; car: number };
  habilidades: string;
  sentidos: string;
  idiomas: string;
  rasgos: FamiliarRasgo[];
  acciones: CombatAction[];
  paraQue: string;
}

// Las reglas que valen para cualquier familiar, elijas la forma que elijas.
export const REGLAS_FAMILIAR: FamiliarRasgo[] = [
  {
    n: "Se invoca con un ritual",
    d: "Find Familiar es tuyo gratis y no cuenta contra tus conjuros conocidos. El ritual tarda una hora y consume 10 piezas de oro en carbón, incienso y hierbas quemadas en un brasero de latón. No gasta espacio de conjuro.",
  },
  {
    n: "Actúa solo, pero te obedece",
    d: "Tiene su propia iniciativa y su propio turno. Puede moverse, esconderse, ayudar, empujar, agarrar cosas o activar mecanismos, y siempre hace lo que le pedís.",
  },
  {
    n: "No puede atacar por su cuenta",
    d: "Es la regla general de los familiares y casi nadie la recuerda. Tu excepción: cuando usás la acción de Atacar, podés renunciar a uno de tus ataques para que él use su reacción y pegue una vez. Como atacás con Eldritch Blast, que es un truco y no la acción de Atacar, en la práctica es o tirás vos o pega él.",
  },
  {
    n: "Hablan entre ustedes a 30 m",
    d: "Mientras esté a 30 metros, se comunican telepáticamente sin decir una palabra.",
  },
  {
    n: "Ojos prestados",
    d: "Con una acción, ves y oís por sus sentidos hasta el comienzo de tu próximo turno, incluidos sus sentidos especiales. Mientras dure, vos quedás ciego y sordo a lo tuyo. Nunca en medio de una pelea.",
  },
  {
    n: "Entrega conjuros de toque",
    d: "Si lanzás un conjuro de alcance Toque, él puede entregarlo por vos usando su reacción, estando a 30 metros. Hoy no te sirve: ninguno de tus cuatro conjuros es de toque.",
  },
  {
    n: "Se guarda y se llama",
    d: "Con una acción lo mandás a un bolsillo dimensional, y con otra acción vuelve a aparecer en un espacio libre a 9 metros tuyo. Sirve para entrar a lugares donde un dragón no es bienvenido.",
  },
  {
    n: "Si muere, no queda nada",
    d: "Al llegar a 0 puntos de vida desaparece sin dejar cadáver. Se vuelve a invocar con el mismo ritual, y las 10 piezas de oro se pagan de nuevo.",
  },
];

const ataque = (
  id: string,
  nombre: string,
  bonus: number,
  caras: number,
  mod: number,
  tipoDano: string,
  queHace: string,
  extra?: Partial<CombatAction>,
): CombatAction => ({
  id,
  nombre,
  grupo: "familiar",
  coste: "Su reacción · vos renunciás a un ataque",
  accion: "Reacción del familiar",
  alcance: "1,5 m",
  queHace,
  tirada: { tipo: "ataque", bonus },
  danos: [{ cantidad: 1, caras, modificador: mod, tipo: tipoDano }],
  ...extra,
});

export const FAMILIARES: Familiar[] = [
  {
    id: "pseudodragon",
    nombre: "Pseudodragón",
    tipo: "Dragón diminuto, del tamaño de un gato con alas",
    ca: 13,
    pv: 7,
    velocidad: "4,5 m · volando 18 m",
    abilities: { fue: 6, des: 15, con: 13, int: 10, sab: 12, car: 10 },
    habilidades: "Percepción +3 (pasiva 13) · Sigilo +4",
    sentidos: "Visión ciega 3 m · visión en la oscuridad 18 m",
    idiomas: "Entiende común y dracónico, pero no puede hablarlos",
    rasgos: [
      { n: "Sentidos agudos", d: "Ventaja en Percepción por vista, oído u olfato." },
      { n: "Resistencia a la magia", d: "Ventaja en todas las salvaciones contra conjuros y efectos mágicos. Enorme para algo de 7 puntos de vida." },
      { n: "Telepatía limitada", d: "Se comunica con cualquier criatura a 30 metros que entienda un idioma, mandándole ideas simples, emociones e imágenes. Es lo que lo separa de los otros tres: puede hablarle a un guardia, no solo a vos." },
      { n: "Tiene opinión", d: "Los pseudodragones son orgullosos, se comportan como gatos y no toleran que los traten como mascotas." },
    ],
    acciones: [
      ataque("psd-mordisco", "Mordisco", 4, 4, 2, "perforante", "Un mordisco y nada más. Daño chico, sin efecto."),
      ataque(
        "psd-aguijon",
        "Aguijón",
        4,
        4,
        2,
        "perforante",
        "Si pega, además del daño el objetivo tira salvación de Constitución CD 11. Si falla, queda envenenado una hora. Si falla por 5 o más, cae inconsciente esa misma hora, o hasta que reciba daño o alguien use una acción para sacudirlo.",
        {
          cuando: "Contra un centinela solo, con el pseudodragón escondido. Es la única forma que tiene el grupo de sacar a alguien de la ecuación sin ruido y sin sangre.",
          ojo: "La CD 11 es del bicho y no sube con tu nivel. Y usarlo cuesta tu acción entera: cambiás un Eldritch Blast seguro por una chance.",
          destacado: true,
        },
      ),
    ],
    paraQue: "El equilibrado. No es el más duro ni el más sigiloso, pero es el único que habla con otros y el que menos se muere.",
  },
  {
    id: "diablillo",
    nombre: "Diablillo",
    tipo: "Infernal diminuto, cambiaformas",
    ca: 13,
    pv: 10,
    velocidad: "6 m · volando 12 m",
    abilities: { fue: 6, des: 17, con: 13, int: 11, sab: 12, car: 14 },
    habilidades: "Engaño +4 · Perspicacia +3 · Persuasión +4 · Sigilo +5",
    sentidos: "Visión en la oscuridad 36 m, y ve en la oscuridad mágica",
    idiomas: "Infernal y común",
    rasgos: [
      { n: "Cambiaformas", d: "Se transforma en rata, cuervo o araña, y vuelve. Mantiene sus estadísticas." },
      { n: "Invisibilidad a voluntad", d: "Se vuelve invisible cuando quiere, hasta que ataque o hasta que rompa la concentración." },
      { n: "Resistente de verdad", d: "Resistencia al frío y al daño contundente, perforante y cortante de armas no mágicas ni de plata. Inmune al fuego y al veneno." },
      { n: "Resistencia a la magia", d: "Ventaja en las salvaciones contra conjuros." },
      { n: "Telepatía a 1,5 km", d: "Como familiar, se comunica con vos telepáticamente mientras esté a un kilómetro y medio, mucho más lejos que los 30 metros del resto." },
    ],
    acciones: [
      ataque("imp-aguijon", "Aguijón", 5, 4, 3, "perforante", "Además del daño perforante suma 1d6 de veneno.", {
        danos: [
          { cantidad: 1, caras: 4, modificador: 3, tipo: "perforante" },
          { cantidad: 1, caras: 6, tipo: "veneno" },
        ],
      }),
    ],
    paraQue: "El explorador. Diez puntos de vida, resistencias, invisible a voluntad y telepatía a un kilómetro y medio. Para meterse en lugares peligrosos.",
  },
  {
    id: "cuasit",
    nombre: "Cuasit",
    tipo: "Demonio diminuto, cambiaformas",
    ca: 13,
    pv: 7,
    velocidad: "12 m",
    abilities: { fue: 5, des: 17, con: 10, int: 7, sab: 10, car: 10 },
    habilidades: "Sigilo +5",
    sentidos: "Visión en la oscuridad 36 m",
    idiomas: "Abisal y común",
    rasgos: [
      { n: "Cambiaformas", d: "Se transforma en murciélago, ciempiés o sapo." },
      { n: "Invisibilidad a voluntad", d: "Igual que el diablillo." },
      { n: "Resistencias", d: "Al frío, al fuego, al relámpago y al daño de armas no mágicas. Inmune al veneno." },
      { n: "Resistencia a la magia", d: "Ventaja en las salvaciones contra conjuros." },
      { n: "Asustar, una vez por día", d: "Una criatura a 6 metros tira salvación de Sabiduría CD 10 o queda asustada un minuto, repitiendo la salvación al final de cada uno de sus turnos." },
    ],
    acciones: [
      ataque("qua-garras", "Garras", 4, 4, 3, "cortante", "Si pega, el objetivo tira salvación de Constitución CD 10 o recibe 2d4 de veneno y queda envenenado un minuto, repitiendo la salvación al final de cada uno de sus turnos.", {
        danos: [
          { cantidad: 1, caras: 4, modificador: 3, tipo: "cortante" },
          { cantidad: 2, caras: 4, tipo: "veneno", etiqueta: "si falla la salvación" },
        ],
      }),
    ],
    paraQue: "El que pelea sucio. Veneno que sigue haciendo daño y un susto por día.",
  },
  {
    id: "duende",
    nombre: "Duende",
    tipo: "Feérico diminuto",
    ca: 15,
    pv: 2,
    velocidad: "3 m · volando 12 m",
    abilities: { fue: 3, des: 18, con: 10, int: 14, sab: 13, car: 11 },
    habilidades: "Percepción +3 (pasiva 13) · Sigilo +8",
    sentidos: "Normales",
    idiomas: "Común, élfico y silvano",
    rasgos: [
      { n: "Invisibilidad a voluntad", d: "Se vuelve invisible cuando quiere." },
      { n: "Vista del corazón", d: "Lo toca y sabe qué siente y cuál es su alineamiento. Con una salvación de Carisma CD 10 el objetivo puede evitarlo, salvo que sea un infernal o un celestial, que fallan siempre." },
      { n: "Sigilo +8", d: "El mejor de las cuatro formas, por lejos." },
    ],
    acciones: [
      {
        id: "spr-arco",
        nombre: "Arco corto",
        grupo: "familiar",
        coste: "Su reacción · vos renunciás a un ataque",
        accion: "Reacción del familiar",
        alcance: "12 m (hasta 48 con desventaja)",
        queHace:
          "Hace 1 punto de daño, que es nada, pero el objetivo tira salvación de Constitución CD 10 o queda envenenado un minuto. Si el veneno lo deja en 0 puntos de vida, cae inconsciente ese minuto o hasta que reciba daño o lo sacudan.",
        tirada: { tipo: "ataque", bonus: 6 },
        danos: [{ cantidad: 1, caras: 1, tipo: "perforante", etiqueta: "fijo" }],
      },
    ],
    paraQue: "El conversador. Sigilo altísimo y detecta mentiras con el tacto. Pero tiene 2 puntos de vida: es para negociaciones, no para cuevas.",
  },
];

export const familiarPorId = (id: string | null | undefined) =>
  FAMILIARES.find((f) => f.id === id) ?? null;

// Para la hoja de combate: la ficha y las reglas entran como tarjetas del
// mismo grupo, así se leen en la mesa sin cambiar de pantalla.
export function accionesFamiliarCombate(fam: Familiar): CombatAction[] {
  const ficha: CombatAction = {
    id: `fam-${fam.id}-ficha`,
    nombre: `${fam.nombre} · ${fam.pv} PV, CA ${fam.ca}`,
    grupo: "familiar",
    coste: "Ritual de 1 hora · 10 po",
    accion: "Pasiva",
    alcance: fam.velocidad,
    queHace: `${fam.tipo}. ${fam.paraQue} Sentidos: ${fam.sentidos}. Idiomas: ${fam.idiomas}. ${fam.habilidades}. ${fam.rasgos.map((r) => `${r.n}: ${r.d}`).join(" ")}`,
    tirada: { tipo: "ninguna", nota: "Es su ficha, no se tira." },
    destacado: true,
  };
  const reglas: CombatAction = {
    id: `fam-${fam.id}-reglas`,
    nombre: "Cómo funciona un familiar",
    grupo: "familiar",
    coste: "Referencia",
    accion: "Pasiva",
    alcance: "Telepatía a 30 m",
    queHace: REGLAS_FAMILIAR.map((r) => `${r.n}: ${r.d}`).join(" "),
    tirada: { tipo: "ninguna", nota: "Referencia de reglas." },
  };
  return [ficha, ...fam.acciones, reglas];
}

export const PACT_BOON_ES: Record<string, string> = {
  chain: "Pacto de la Cadena",
  blade: "Pacto de la Hoja",
  tome: "Pacto del Tomo",
};
