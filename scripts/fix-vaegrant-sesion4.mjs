// Correcciones sobre data/vaegrant.json después de confirmar en mesa las dudas
// de la Sesión 4:
//   - el gnomo se llama Zariff, con doble efe (venía como Zarif/Zerif/Sarif/
//     Sharif en todo el canon, desde la Sesión 1) -> rename global
//   - las islas del norte son las islas de Val, no de Baal -> rename global,
//     incluido el id del marcador y la ruta que lo referencia
//   - el viaje Moray-Val es "un día más que el tramo Ioma-Moray", no seis días
//   - la armera de las bodegas se llama Alara
//   - Haddrek mide 2,90 m y pesa 190 kg
//   - James/Deadlock era chiste de mesa: sale del canon
//   - Río fue quien les pasó la descripción del gnomo (el "Willy" del audio)
//   - Brina viene del archipiélago de Colín (confirmado)
//   - la deuda con Omán es de Zariff; Haddrek es quien se la reclama
//   - Jeremy es el que interroga a Haddrek en la puerta (confirmado en mesa)
//   - dudas[] de la Sesión 4 reemplazadas por las que siguen abiertas
// Idempotente: si el canon ya dice "Zariff", no hace nada.
//
// Uso: node scripts/fix-vaegrant-sesion4.mjs
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

const sesion4 = (data.cronica || []).find((s) => s.id === "sesion-4");
if (!sesion4) {
  console.error("No existe cronica 'sesion-4'. Corré antes patch-vaegrant-sesion4.mjs.");
  process.exit(1);
}
if (JSON.stringify(data).includes("Zariff")) {
  console.log("El canon ya dice 'Zariff'. Nada que hacer.");
  process.exit(0);
}

// ── Ediciones puntuales (antes del rename global) ────────────────
const cap = (titulo) => sesion4.capitulos.find((c) => c.titulo === titulo);

// 1. James/Deadlock era joda de mesa: la coartada sí es canon, el alias no.
const c1 = cap("Día de luna nueva en Moray");
c1.texto = c1.texto.replace(
  "preguntas de mostrador, precios, mercadería, y nombres que no eran los suyos cuando alguien preguntaba de más.",
  "preguntas de mostrador, precios y mercadería, sin soltar más datos de los necesarios sobre de dónde venían.",
);

// 2. Haddrek: medidas confirmadas.
const c2 = cap("El semiorco de la puerta");
c2.texto = c2.texto.replace(
  "un semiorco enorme, robusto, con uniforme de cobrador de Iron Keep",
  "un semiorco de dos metros noventa y ciento noventa kilos, con uniforme de cobrador de Iron Keep",
);

// 3. Río fue el que les pasó la descripción del gnomo.
const c4 = cap("Una testigo comprada en la calle");
c4.texto = c4.texto.replace(
  "Zarif entró después, estirándose los tirantes,",
  "Lo reconocieron por la descripción que les había dado Río en el muelle, aunque en una feria llena de gnomos eso sirve menos de lo que parece. Zarif entró estirándose los tirantes,",
);

// 4. La deuda con Omán: es de Zarif, y Haddrek es quien se la reclama.
const c6 = cap("Las siete piedras");
c6.texto = c6.texto.replace(
  "La deuda con Omán la va a ir a pagar él en persona, que Omán va a entender.",
  "Y la deuda que Haddrek le venía reclamando hace tres días la va a ir a pagar él mismo a Omán, en persona, que para eso son amigos: Omán va a entender.",
);

// 5. La armera tiene nombre.
const c7 = cap("El Albatros como oficio");
c7.texto = c7.texto
  .replace(
    "En unas bodegas grandes, con cava enorme y gente armando cajas y preparando armas de fuego, cerraron dos cabillas",
    "En unas bodegas grandes, con cava enorme y gente armando cajas y preparando armas de fuego, cerraron con Alara dos cabillas",
  )
  .replace("y la armera devolvió una", "y Alara devolvió una");
for (const d of c7.dialogo) if (d.quien === "La armera") d.quien = "Alara";

// 6. Viaje relativo, no seis días.
const arreglarDias = (s) =>
  s.replace(/a unos seis días de Moray/g, "a un día más de navegación que el tramo Ioma-Moray");

// 7. Brina: origen confirmado.
const brina = data.personajes.find((p) => p.id === "brina");
const rDonde = brina.rasgos.find((r) => r.label === "De dónde");
rDonde.texto =
  "Del archipiélago de Colín, en los pueblos arbóreos del sur: islas donde todavía hay biomas de ents y vestigios de mundos antiguos. Es nativa de este plano y vive de esos vestigios.";

// 8. Haddrek: medidas en la ficha.
const haddrek = data.personajes.find((p) => p.id === "haddrek");
haddrek.rasgos.find((r) => r.label === "Raza").texto =
  "Dos metros noventa y ciento noventa kilos de semiorco, de los pocos que quedan. Los humanos usaron a los suyos como guerreros en las Guerras de los Magos, por su fuerza y su fortaleza, y ahí casi se extinguen.";
haddrek.descripcion[0] = haddrek.descripcion[0].replace(
  "un semiorco enorme sentado en un banquito",
  "dos metros noventa de semiorco sentados en un banquito",
);

// 9. Alara en el gancho y en nombres[].
const gPiedra = data.mundo.ganchos.find((g) => g.label === "Piedra lunar en las armas");
gPiedra.texto = gPiedra.texto.replace(
  "La armera de Moray lleva",
  "Alara, la armera de Moray, lleva",
);
const nArmera = sesion4.nombres.find((n) => n.nombre === "La armera de las bodegas");
nArmera.nombre = "Alara";
nArmera.rol =
  "Armera de las bodegas de Moray, con trolls de carga a sueldo. Cobró noventa monedas por dos cabillas y veinticuatro balas y devolvió el vuelto sin que se lo pidieran. Lleva un arma como un trabuco pero con un cristal en la punta: piedra lunar fusionada directamente con el arma, cosa que el grupo no había visto ni en Sambar.";

// ── Renames globales ─────────────────────────────────────────────
// Un solo pase por alternancia, para que el resultado ("Zariff") no vuelva a
// matchear el patrón ("Zarif" es prefijo de "Zariff").
const NOMBRE = /Sharif|Zarif|Zerif|Sarif/g;

function walk(node) {
  if (typeof node === "string") {
    return arreglarDias(node).replace(NOMBRE, "Zariff").replace(/Baal/g, "Val").replace(/baal/g, "val");
  }
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v);
    return out;
  }
  return node;
}

const fixed = walk(data);

// ── Dudas que siguen abiertas ────────────────────────────────────
const s4 = fixed.cronica.find((s) => s.id === "sesion-4");
s4.dudas = [
  "Los transcripts llegaron concatenados y no uno por nota de voz: veintiún archivos con reinicio de reloj para treinta y cuatro audios, así que varias notas venían pegadas. Los saltos de la narración son entonces cortes naturales de la mesa y no material perdido.",
  "Aun así, no quedó registrado el arranque de la sesión, el momento en que Haddrek acepta subir al Albatros ni el cierre de la noche. Puede haber pasado fuera de micrófono.",
  "El orden de los audios no es del todo cronológico: el tramo en que Zariff interroga a Brina parece ir antes del tramo en que se despide de la mesa.",
];

await writeFile(path, JSON.stringify(fixed, null, 2) + "\n", "utf-8");
console.log("Canon corregido: Zariff, islas de Val, Alara, medidas de Haddrek y dudas al día.");
