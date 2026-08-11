// Spec del Albatros. Una sola fuente de verdad, en METROS REALES, de la que
// salen tanto el plano 2D como la escena 3D: si cambia acá, cambian las dos.
//
// Ejes (convención náutica adaptada a three.js):
//   x → eslora. Positivo hacia PROA, negativo hacia POPA. Origen en el medio.
//   y → altura. 0 = cubierta principal. Negativo hacia la sentina.
//   z → manga. Positivo a ESTRIBOR, negativo a BABOR. 0 = crujía.

/** Media manga del casco a una distancia x dada. Define la silueta del barco. */
export interface AlbatrosCuaderna {
  x: number;
  /** Media manga en ese punto (la manga total es el doble). */
  semimanga: number;
}

export type AlbatrosNivelId = "alcazar" | "cubierta" | "entrepuente" | "bodega";

export interface AlbatrosNivel {
  id: AlbatrosNivelId;
  nombre: string;
  /** Altura del piso de este nivel respecto de la cubierta principal. */
  y: number;
  /** Altura libre entre piso y techo. */
  puntal: number;
  /** Descripción corta para el plano. */
  nota: string;
}

export type AlbatrosCompartimentoTipo =
  | "camarote"
  | "servicio"
  | "carga"
  | "maquina"
  | "oculto"
  | "exterior";

export interface AlbatrosCompartimento {
  id: string;
  nombre: string;
  nivel: AlbatrosNivelId;
  tipo: AlbatrosCompartimentoTipo;
  /** Rectángulo en planta: [xPopa, xProa] × [zBabor, zEstribor]. */
  x: [number, number];
  z: [number, number];
  /** Nota de canon que se muestra al seleccionar el compartimento. */
  nota: string;
  /** Sesión en la que aparece o se descubre. */
  sesion?: number;
  /** Solo se conoce después de abrir la pared tapiada. */
  secreto?: boolean;
}

export type AlbatrosPiezaTipo =
  | "palo"
  | "timon"
  | "escotilla"
  | "escalera"
  | "cabilla"
  | "balista"
  | "capsula"
  | "maquinaria"
  | "barril"
  | "retonio"
  | "cama"
  | "mesa"
  | "red"
  | "cabrestante"
  | "ancla";

export interface AlbatrosPieza {
  id: string;
  nombre: string;
  tipo: AlbatrosPiezaTipo;
  nivel: AlbatrosNivelId;
  /** Posición del centro de la pieza, en metros. */
  pos: [number, number, number];
  /** Caja envolvente aproximada [largo, alto, ancho]. */
  tam: [number, number, number];
  /** Rotación sobre el eje vertical, en grados. */
  giro?: number;
  nota?: string;
  sesion?: number;
}

export interface AlbatrosSpec {
  nombre: string;
  clase: string;
  eslora: number;
  manga: number;
  puntal: number;
  calado: number;
  /** Perfil del casco de popa a proa. */
  cuadernas: AlbatrosCuaderna[];
  niveles: AlbatrosNivel[];
  compartimentos: AlbatrosCompartimento[];
  piezas: AlbatrosPieza[];
  notas: string[];
}
