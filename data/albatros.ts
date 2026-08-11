import type { AlbatrosSpec } from "@/types/albatros";

// El Albatros, a escala real. Carabela chica de dos mástiles, cubierta amplia
// y castillo de popa. Las medidas son las de una carabela latina pequeña, que
// es lo que cierra con el canon: "un barco de verdad para seis", chico y veloz,
// que se puede hacer pasar por mercante.
//
// El dato que ordena toda la bodega viene de la Sesión 5: en los planos la
// bodega mide X y cuando se cuenta hay menos. La diferencia son los 5,5 metros
// de popa que estaban tapiados detrás de una pared de madera baja.

export const ALBATROS: AlbatrosSpec = {
  nombre: "El Albatros",
  clase: "Carabela latina de dos mástiles · correo modificado",
  eslora: 19,
  manga: 5.6,
  puntal: 4.6,
  calado: 1.9,

  // Perfil del casco, de popa a proa.
  cuadernas: [
    { x: -9.5, semimanga: 1.1 },
    { x: -8.0, semimanga: 1.65 },
    { x: -6.0, semimanga: 2.2 },
    { x: -4.0, semimanga: 2.55 },
    { x: -2.0, semimanga: 2.75 },
    { x: 0.0, semimanga: 2.8 },
    { x: 2.0, semimanga: 2.78 },
    { x: 4.0, semimanga: 2.6 },
    { x: 6.0, semimanga: 2.05 },
    { x: 8.0, semimanga: 1.05 },
    { x: 9.5, semimanga: 0.18 },
  ],

  niveles: [
    {
      id: "alcazar",
      nombre: "Alcázar",
      y: 1.3,
      puntal: 2.1,
      nota: "El castillo de popa: el timón y el puesto de mando. Desde acá se ve toda la cubierta.",
    },
    {
      id: "cubierta",
      nombre: "Cubierta principal",
      y: 0,
      puntal: 2.3,
      nota: "Faena, aparejos y las dos cabillas compradas en Moray. Es lo único que ve un inspector de puerto.",
    },
    {
      id: "entrepuente",
      nombre: "Entrepuente",
      y: -2.3,
      puntal: 2.0,
      nota: "Camarotes y comedor. Cada uno tiene el suyo, cosa rara en un barco de este tamaño.",
    },
    {
      id: "bodega",
      nombre: "Bodega",
      y: -4.5,
      puntal: 1.9,
      nota: "Carga, pañoles y, detrás de la pared tapiada, la cámara del motor.",
    },
  ],

  compartimentos: [
    // ── Alcázar ────────────────────────────────────────────────
    {
      id: "puesto-timon",
      nombre: "Puesto del timón",
      nivel: "alcazar",
      tipo: "exterior",
      x: [-9.0, -5.0],
      z: [-2.0, 2.0],
      nota: "La rueda tiene la brújula que lleva a donde uno quiere ir, salvo que Gunnlod tenga algo en contra tuya. Acá Haddrek pasó la noche al timón mientras el capitán dormía.",
      sesion: 5,
    },

    // ── Cubierta principal ─────────────────────────────────────
    {
      id: "castillo-proa",
      nombre: "Castillo de proa",
      nivel: "cubierta",
      tipo: "exterior",
      x: [6.0, 9.3],
      z: [-2.0, 2.0],
      nota: "La proa. Acá las raíces de las cabillas se entretejieron solas hasta formar la balista con la que Gunnlod hundió el pesquero.",
      sesion: 5,
    },
    {
      id: "cubierta-faena",
      nombre: "Cubierta de faena",
      nivel: "cubierta",
      tipo: "exterior",
      x: [-4.5, 6.0],
      z: [-2.8, 2.8],
      nota: "El grueso del trabajo: aparejos, cabos y la escotilla principal. Los barriles se reparten por acá cuando hay maniobra.",
    },

    // ── Entrepuente ────────────────────────────────────────────
    {
      id: "camarote-capitan",
      nombre: "Camarote del capitán",
      nivel: "entrepuente",
      tipo: "camarote",
      x: [-9.0, -5.2],
      z: [-2.2, 2.2],
      nota: "El de Iscandar desde que Hakon se bajó. Es el único con cama de dos plazas. Acá apagó la vela y un barril se la volvió a encender, hasta que entendió que se la estaba acomodando en la mesa de luz.",
      sesion: 5,
    },
    {
      id: "camarote-vaegrant",
      nombre: "Camarote de Vaegrant",
      nivel: "entrepuente",
      tipo: "camarote",
      x: [-5.0, -2.6],
      z: [-2.4, -0.9],
      nota: "Cama estrecha y una vela que se enciende cada noche, esté donde esté, haga falta luz o no.",
    },
    {
      id: "camarote-jeremy",
      nombre: "Camarote de Jeremy",
      nivel: "entrepuente",
      tipo: "camarote",
      x: [-5.0, -2.6],
      z: [0.9, 2.4],
      nota: "El más cargado de papeles del barco: bitácora, inventarios y las notas para la serie de libros que quiere escribir sobre este mundo.",
    },
    {
      id: "camarote-haddrek",
      nombre: "Camarote de Haddrek",
      nivel: "entrepuente",
      tipo: "camarote",
      x: [-2.4, 0.0],
      z: [-2.5, -0.9],
      nota: "Dos metros noventa de semiorco en una cucheta pensada para un humano. El tricornio cuelga de un clavo.",
      sesion: 5,
    },
    {
      id: "camarote-brina",
      nombre: "Camarote de Brina",
      nivel: "entrepuente",
      tipo: "camarote",
      x: [-2.4, 0.0],
      z: [0.9, 2.5],
      nota: "Con el kit de herboristería montado como laboratorio. En la Sesión 5 quedó vacío: Brina no viajó.",
      sesion: 4,
    },
    {
      id: "pasillo-entrepuente",
      nombre: "Pasillo de crujía",
      nivel: "entrepuente",
      tipo: "servicio",
      x: [-5.0, 2.2],
      z: [-0.9, 0.9],
      nota: "Corre de proa a popa por el medio. La escalera a cubierta cae acá, justo debajo de la escotilla.",
    },
    {
      id: "comedor",
      nombre: "Comedor y fogón",
      nivel: "entrepuente",
      tipo: "servicio",
      x: [2.2, 5.8],
      z: [-2.3, 2.3],
      nota: "La mesa larga donde Jeremy levantó los planos del barco para buscar dónde estaba el motor, y donde después se sentó a planear cómo evadir la competencia.",
      sesion: 5,
    },

    // ── Bodega ─────────────────────────────────────────────────
    {
      id: "panol-proa",
      nombre: "Pañol de proa",
      nivel: "bodega",
      tipo: "carga",
      x: [4.6, 7.8],
      z: [-1.8, 1.8],
      nota: "Cabos, lona, repuestos y el cordaje de respeto.",
    },
    {
      id: "bodega-carga",
      nombre: "Bodega de carga",
      nivel: "bodega",
      tipo: "carga",
      x: [0.0, 4.6],
      z: [-2.4, 2.4],
      nota: "Acá viajaban el oro y las armas disfrazadas de coles que encontró Jeremy en la Sesión 2. Hoy lleva la mercadería sacada de Ámbar antes del bloqueo.",
      sesion: 2,
    },
    {
      id: "santabarbara",
      nombre: "Santabárbara",
      nivel: "bodega",
      tipo: "carga",
      x: [-3.0, 0.0],
      z: [-2.3, -0.3],
      nota: "Pólvora y las veinticuatro balas que Alara vendió en Moray junto con las cabillas.",
      sesion: 4,
    },
    {
      id: "despensa",
      nombre: "Despensa",
      nivel: "bodega",
      tipo: "carga",
      x: [-3.0, 0.0],
      z: [0.3, 2.3],
      nota: "Provisiones y agua. Es lo de Jeremy: bitácora, provisiones y secretos de carga.",
    },
    {
      id: "camara-motor",
      nombre: "La cámara del motor",
      nivel: "bodega",
      tipo: "oculto",
      x: [-8.6, -3.0],
      z: [-2.3, 2.3],
      nota: "Los cinco metros y medio que faltaban. Detrás de una pared de madera baja que suena hueca, con una cerradura chica que abre la llave de Ioma: al meterla la madera se desgrana en el aire, y al sacarla se reintegra. Adentro estaban la cápsula de Gunnlod, la maquinaria, Caja y los diez barriles.",
      sesion: 5,
      secreto: true,
    },
  ],

  piezas: [
    // ── Arboladura y gobierno ──────────────────────────────────
    { id: "palo-mayor", nombre: "Palo mayor", tipo: "palo", nivel: "cubierta", pos: [-0.5, 0, 0], tam: [0.42, 14.5, 0.42] },
    { id: "palo-trinquete", nombre: "Palo trinquete", tipo: "palo", nivel: "cubierta", pos: [4.8, 0, 0], tam: [0.34, 11.5, 0.34] },
    { id: "timon", nombre: "Rueda del timón", tipo: "timon", nivel: "alcazar", pos: [-6.2, 0, 0], tam: [0.25, 1.3, 1.3], nota: "Con la brújula que lleva a donde uno quiere ir." },
    { id: "cabrestante", nombre: "Cabrestante", tipo: "cabrestante", nivel: "cubierta", pos: [6.6, 0, 0], tam: [0.9, 0.9, 0.9] },
    { id: "ancla", nombre: "Ancla", tipo: "ancla", nivel: "cubierta", pos: [8.2, 0, 1.5], tam: [0.4, 1.6, 0.9] },

    // ── Aberturas y circulación ────────────────────────────────
    { id: "escotilla", nombre: "Escotilla principal", tipo: "escotilla", nivel: "cubierta", pos: [1.2, 0, 0], tam: [1.6, 0.2, 1.6], nota: "Por acá se baja al entrepuente y de ahí a la bodega." },
    { id: "escalera-1", nombre: "Escala a cubierta", tipo: "escalera", nivel: "entrepuente", pos: [1.2, 0, 0], tam: [1.4, 2.0, 1.0] },
    { id: "escalera-2", nombre: "Escala a bodega", tipo: "escalera", nivel: "bodega", pos: [2.4, 0, 0], tam: [1.4, 2.0, 1.0] },

    // ── Armamento de cubierta (Sesión 4) ───────────────────────
    { id: "cabilla-babor", nombre: "Cabilla de babor", tipo: "cabilla", nivel: "cubierta", pos: [2.4, 0, -2.35], tam: [1.7, 0.6, 0.6], giro: 90, nota: "Comprada a Alara en Moray. Amaneció enraizada a la cubierta, con florcitas de lis.", sesion: 4 },
    { id: "cabilla-estribor", nombre: "Cabilla de estribor", tipo: "cabilla", nivel: "cubierta", pos: [2.4, 0, 2.35], tam: [1.7, 0.6, 0.6], giro: 90, nota: "La segunda de las dos que cargaron los trolls hasta la cubierta.", sesion: 4 },
    { id: "balista", nombre: "Balista de madera viva", tipo: "balista", nivel: "cubierta", pos: [7.6, 0, 0], tam: [3.4, 1.5, 1.6], nota: "No la construyó nadie: las raíces de las cabillas se soltaron, treparon hasta la proa y se entretejieron solas. Dispara saetas de hielo.", sesion: 5 },
    { id: "red-babor", nombre: "Red de profundidad", tipo: "red", nivel: "cubierta", pos: [0, -0.9, -2.9], tam: [7.0, 2.0, 0.15], nota: "Pantalla de pesquero de altamar. No sirven para pescar: son de adorno.", sesion: 5 },
    { id: "red-estribor", nombre: "Red de profundidad", tipo: "red", nivel: "cubierta", pos: [0, -0.9, 2.9], tam: [7.0, 2.0, 0.15], nota: "La segunda red, la de estribor. Las dio Telgar en Iron Keep con el permiso a Puerto Corona.", sesion: 5 },

    // ── Camas ──────────────────────────────────────────────────
    { id: "cama-capitan", nombre: "Cama del capitán", tipo: "cama", nivel: "entrepuente", pos: [-7.6, 0, 0], tam: [2.0, 0.5, 1.5] },
    { id: "cama-vaegrant", nombre: "Cucheta", tipo: "cama", nivel: "entrepuente", pos: [-3.9, 0, -1.9], tam: [1.9, 0.5, 0.8] },
    { id: "cama-jeremy", nombre: "Cucheta", tipo: "cama", nivel: "entrepuente", pos: [-3.9, 0, 1.9], tam: [1.9, 0.5, 0.8] },
    { id: "cama-haddrek", nombre: "Cucheta reforzada", tipo: "cama", nivel: "entrepuente", pos: [-1.2, 0, -2.0], tam: [2.2, 0.5, 0.9] },
    { id: "cama-brina", nombre: "Cucheta", tipo: "cama", nivel: "entrepuente", pos: [-1.2, 0, 2.0], tam: [1.9, 0.5, 0.8] },
    { id: "mesa-comedor", nombre: "Mesa larga", tipo: "mesa", nivel: "entrepuente", pos: [4.0, 0, 0], tam: [2.6, 0.8, 1.2] },

    // ── La cámara del motor (Sesión 5) ─────────────────────────
    {
      id: "capsula",
      nombre: "La cápsula de Gunnlod",
      tipo: "capsula",
      nivel: "bodega",
      pos: [-5.6, 0, 0],
      tam: [2.4, 1.1, 1.3],
      nota: "Una cápsula-cama de cristal horizontal, empotrada entre las cuadernas y llena de líquido luminoso. Adentro reposa Gunnlod, el alma del barco. Debajo hay una boca orgánica: ahí se le apoyan los barriles de piedra lunar.",
      sesion: 5,
    },
    {
      id: "maquinaria",
      nombre: "Maquinaria de engranajes",
      tipo: "maquinaria",
      nivel: "bodega",
      pos: [-7.8, 0, 0],
      tam: [1.4, 1.7, 3.4],
      nota: "El fondo de la cámara. Engranajes de latón girando lento, conectados a la cápsula por un par de mangueras orgánicas.",
      sesion: 5,
    },
    {
      id: "barriles",
      nombre: "Los diez barriles",
      tipo: "barril",
      nivel: "bodega",
      pos: [-3.9, 0, -1.5],
      tam: [1.8, 0.9, 1.2],
      nota: "Barry uno, Barry dos, y así hasta diez. Grumetes, limpiacubiertas y falange defensiva, todo a la vez.",
      sesion: 5,
    },
    {
      id: "retonio",
      nombre: "Njröun",
      tipo: "retonio",
      nivel: "bodega",
      pos: [-3.9, 0, 1.5],
      tam: [0.6, 0.9, 0.6],
      nota: "El retoño que entregó Kyro. Lo dejaron acá porque crece más rápido cerca de energía faérica, y porque Gunnlod está contenta de tener compañía.",
      sesion: 5,
    },
  ],

  notas: [
    "Las medidas son de carabela latina chica: diecinueve metros de eslora por cinco con seis de manga. Entra en la definición de la mesa —un barco de verdad para seis, chico y veloz— y puede hacerse pasar por mercante sin llamar la atención.",
    "La bodega de carga termina en una pared a tres metros de la crujía, pero el casco sigue cinco metros y medio más hacia popa. Esa diferencia es exactamente lo que el grupo contó de menos en la Sesión 2 y lo que abrieron en la Sesión 5.",
    "El alcázar está un metro treinta por encima de la cubierta principal, así que desde el timón se ve toda la faena de un vistazo.",
  ],
};
