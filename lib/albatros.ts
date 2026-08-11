import { ALBATROS } from "@/data/albatros";
import type { AlbatrosNivelId, AlbatrosSpec } from "@/types/albatros";

/**
 * Media manga del casco a la altura x, interpolando entre cuadernas.
 * La usan las dos vistas: el plano para dibujar el contorno y el 3D para
 * extruir el casco. Así la silueta es literalmente la misma.
 */
export function semimangaEn(x: number, spec: AlbatrosSpec = ALBATROS): number {
  const c = spec.cuadernas;
  if (x <= c[0].x) return c[0].semimanga;
  if (x >= c[c.length - 1].x) return c[c.length - 1].semimanga;
  for (let i = 0; i < c.length - 1; i++) {
    const a = c[i];
    const b = c[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      // suavizado coseno: evita los quiebres duros entre cuadernas
      const s = (1 - Math.cos(t * Math.PI)) / 2;
      return a.semimanga + (b.semimanga - a.semimanga) * s;
    }
  }
  return 0;
}

/** Contorno cerrado del casco en planta, en metros. */
export function contornoCasco(pasos = 60, spec: AlbatrosSpec = ALBATROS): [number, number][] {
  const x0 = spec.cuadernas[0].x;
  const x1 = spec.cuadernas[spec.cuadernas.length - 1].x;
  const estribor: [number, number][] = [];
  const babor: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = x0 + ((x1 - x0) * i) / pasos;
    const s = semimangaEn(x, spec);
    estribor.push([x, s]);
    babor.push([x, -s]);
  }
  return [...estribor, ...babor.reverse()];
}

/**
 * Estrechamiento del casco a una altura dada. Abajo el casco es más angosto
 * que en la regala, así que la bodega no llega nunca a la manga máxima.
 */
export function factorAltura(y: number, spec: AlbatrosSpec = ALBATROS): number {
  const prof = Math.max(0, -y) / spec.puntal; // 0 en cubierta, 1 en la sentina
  return 1 - 0.42 * prof * prof;
}

/**
 * Arrufo: altura de la regala sobre la cubierta a lo largo de la eslora.
 * Un casco sin arrufo se lee como una tabla. Que la borda suba hacia proa y
 * popa es lo que da la silueta de barco, y en las carabelas era muy marcado.
 */
export function alturaRegala(x: number, spec: AlbatrosSpec = ALBATROS): number {
  const t = x / (spec.eslora / 2); // −1 en popa, +1 en proa
  const base = 0.34;
  const proa = 1.15 * Math.pow(Math.max(0, t), 2.2);
  const popa = 0.78 * Math.pow(Math.max(0, -t), 2.4);
  return base + proa + popa;
}

/** Semimanga aprovechable a una x y una altura dadas, descontando el forro. */
export function semimangaUtil(x: number, y: number, spec: AlbatrosSpec = ALBATROS): number {
  return Math.max(0, semimangaEn(x, spec) * factorAltura(y, spec) - 0.12);
}

/**
 * Contorno de un compartimento YA RECORTADO contra el casco a la altura de su
 * nivel. Los rectángulos del spec se escriben cómodos, contra la manga máxima;
 * acá se los muerde con la forma real del barco. Sin esto los tabiques
 * atraviesan el casco y se ven cajas flotando fuera del barco.
 */
export function poligonoCompartimento(
  c: { x: [number, number]; z: [number, number] },
  y: number,
  pasos = 14,
  spec: AlbatrosSpec = ALBATROS,
): [number, number][] {
  const [x0, x1] = c.x;
  const zMin = Math.min(c.z[0], c.z[1]);
  const zMax = Math.max(c.z[0], c.z[1]);
  const arriba: [number, number][] = [];
  const abajo: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = x0 + ((x1 - x0) * i) / pasos;
    const lim = semimangaUtil(x, y, spec);
    arriba.push([x, Math.min(zMax, lim)]);
    abajo.push([x, Math.max(zMin, -lim)]);
  }
  return [...arriba, ...abajo.reverse()];
}

/** ¿Este borde del compartimento es un tabique real o lo define el casco? */
export function esTabique(
  c: { x: [number, number]; z: [number, number] },
  y: number,
  lado: "babor" | "estribor",
  spec: AlbatrosSpec = ALBATROS,
): boolean {
  const z = lado === "estribor" ? Math.max(c.z[0], c.z[1]) : Math.min(c.z[0], c.z[1]);
  const medio = (c.x[0] + c.x[1]) / 2;
  return Math.abs(z) < semimangaUtil(medio, y, spec) - 0.05;
}

export const NIVELES_ORDEN: AlbatrosNivelId[] = ["alcazar", "cubierta", "entrepuente", "bodega"];

export function nivelDe(id: AlbatrosNivelId, spec: AlbatrosSpec = ALBATROS) {
  return spec.niveles.find((n) => n.id === id)!;
}

/** Paleta compartida entre plano y 3D, alineada con el design system del sitio. */
export const COLOR = {
  casco: "#3a2a1e",
  cascoClaro: "#5b4230",
  cubierta: "#8a6a45",
  madera: "#6b4f34",
  linea: "#c99c5a",
  agua: "#16212b",
  camarote: "#7d6a52",
  servicio: "#5f6b6b",
  carga: "#6d5a3f",
  maquina: "#4a5a68",
  oculto: "#7a4a6a",
  exterior: "#7f6a4a",
  cristal: "#7fc7e8",
  faerico: "#a8d8b0",
} as const;

export function colorTipo(tipo: string): string {
  switch (tipo) {
    case "camarote": return COLOR.camarote;
    case "servicio": return COLOR.servicio;
    case "carga": return COLOR.carga;
    case "maquina": return COLOR.maquina;
    case "oculto": return COLOR.oculto;
    default: return COLOR.exterior;
  }
}

/** Superficie en m² de un compartimento, para la ficha del plano. */
export function areaDe(c: { x: [number, number]; z: [number, number] }): number {
  return Math.abs(c.x[1] - c.x[0]) * Math.abs(c.z[1] - c.z[0]);
}
