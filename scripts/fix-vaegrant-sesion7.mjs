// Correcciones sobre data/vaegrant.json después de confirmar en mesa las dudas
// de la Sesión 7:
//   - el hermano del vacío es Ginnungagap, y su galeón, la Virgen Marchita
//   - Illevor y "Hildebrand" eran el mismo nombre mal transcripto -> queda Illevor
//   - el talabartero es Aldor (no Aldo) -> rename global, incluida la sesión 6
//   - el enano de la parte alta es Corben (no Korvon) -> rename global
//   - los Garradehierro del High Forest NO son los Garra de Hierro del norte
//     de la sesión 4: son clanes distintos -> rename solo del clan de Krenko,
//     incluida la mención de la sesión 6
//   - el chamán de los Grandes Fauces es Grun, el líder anotado en la sesión 6
//   - José Antonio de Castel es el jefe esquivo del bajo mundo de Waterdeep:
//     no son dos personas, es una -> se fusionan las dos entradas
//   - Anton de Lake es el oráculo consejero del drow, no el drow
//   - Haddrek es Erlac Haddrek: nombre y apellido, no alias
//   - Jeremy es Jeremy James: "James" es su segundo nombre, no una coartada
//   - Iscandar se presentó con la casa Selindar y la Fetron (mala transcripción)
//   - dudas[] de la Sesión 7 reemplazadas por las que siguen abiertas
// Idempotente: si el canon ya dice "Ginnungagap", no hace nada.
//
// Uso: node scripts/fix-vaegrant-sesion7.mjs
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
let data = JSON.parse(await readFile(path, "utf-8"));

const sesion7 = (data.cronica || []).find((s) => s.id === "sesion-7");
if (!sesion7) {
  console.error("No existe cronica 'sesion-7'. Corré antes patch-vaegrant-sesion7.mjs.");
  process.exit(1);
}
if (JSON.stringify(data).includes("Ginnungagap")) {
  console.log("El canon ya dice 'Ginnungagap'. Nada que hacer.");
  process.exit(0);
}

const cap = (titulo) => {
  const c = sesion7.capitulos.find((x) => x.titulo === titulo);
  if (!c) throw new Error(`No encontré el capítulo "${titulo}"`);
  return c;
};
const reemplazar = (obj, campo, de, a) => {
  if (!obj[campo].includes(de)) throw new Error(`No encontré para reemplazar: ${de.slice(0, 60)}…`);
  obj[campo] = obj[campo].replace(de, a);
};

// ── 1. Ediciones puntuales (antes de los renames globales) ───────

// El galeón del vacío tiene nombre.
{
  const c = cap("Un barco viejo y con flores");
  reemplazar(
    c,
    "texto",
    "Su galeón fue destruido hace más de seiscientos años y del otro lado del muro están juntando los pedazos",
    "Su galeón, la Virgen Marchita, fue destruido hace más de seiscientos años y del otro lado del muro están juntando los pedazos",
  );
}

// El chamán de los Grandes Fauces tiene nombre: es Grun.
{
  const c = cap("La guerra vieja");
  reemplazar(
    c,
    "texto",
    "trenzas largas ya canosas y un moño alto en la cabeza, más samurái que jefe de horda. Es el chamán de los Grandes Fauces.",
    "trenzas largas ya canosas y un moño alto en la cabeza, más samurái que jefe de horda. Es Grun, el chamán que dirige a los Grandes Fauces.",
  );
  for (const l of c.dialogo) if (l.quien === "El chamán") l.quien = "Grun";
}

// Iscandar se presenta con la casa y el dios que ya están en el canon.
{
  const c = cap("El enano del reloj de arena");
  reemplazar(
    c,
    "texto",
    "En el patio hay fuentes, animales exóticos y salamandras del tamaño de ponis.",
    "Los jardineros los frenan en el patio, entre fuentes, animales exóticos y salamandras del tamaño de ponis, y ahí Iscandar se presenta con todo el peso de la casa Selindar y del culto de la Fetron, que es la llave que abre la puerta.",
  );
  reemplazar(
    c,
    "texto",
    "y pasan a la oficina, que es la única habitación austera de la casa.",
    "y pasan a la oficina, que es la única habitación austera de la casa. Iscandar presenta a Jeremy por su segundo nombre, James, y aclara que se puede hablar delante de él.",
  );
}

// José Antonio de Castel es el jefe del bajo mundo, no un contacto aparte.
{
  const c = cap("El enano del reloj de arena");
  reemplazar(
    c,
    "texto",
    "eso lo maneja un solo jefe de gremio, un hombre esquivo que muchos dicen que no es un hombre, y el que le ve la cara verdadera ve el cielo por última vez.\n\nDe ahí sale el salvoconducto. Un nombre para tocar puertas del otro lado: José Antonio de Castel, de una pequeña sociedad llamada las Hojas de la Noche, cuyo emblema es una daga con una media luna encima. Que vaya de su parte, que va a entender.",
    "eso lo maneja un solo jefe de gremio, un hombre esquivo que muchos dicen que no es un hombre, y el que le ve la cara verdadera o le es leal, o ve el cielo por última vez.\n\nY después le da el nombre de ese mismo hombre, que es lo más caro que suelta en toda la tarde: José Antonio de Castel, de una pequeña sociedad llamada las Hojas de la Noche, cuyo emblema es una daga con una media luna encima. Que vaya de su parte, que va a entender. Ese es el salvoconducto para transitar Waterdeep, aclara, no una garantía de que ahí adentro les vaya bien.",
  );
}

// ── 2. Nombres de la sesión ──────────────────────────────────────
const nombre = (n) => {
  const x = sesion7.nombres.find((e) => e.nombre === n);
  if (!x) throw new Error(`No encontré el nombre "${n}"`);
  return x;
};

nombre("Cinnungaga").rol =
  "El hermano del vacío y el primero de los cinco en nacer. No tiene el concepto de bien y de mal; es caprichoso y voraz. Su galeón, la Virgen Marchita, fue destruido hace más de seiscientos años, y en un astillero escondido de Waterdeep están juntando los pedazos y reponiendo con magia oscura lo que falta. Él, el núcleo, está guardado en los bajos fondos de la ciudad.";

nombre("Anton de Lake").rol =
  "El consejero del drow de Waterdeep: un oráculo capaz de profetizar una traición. Nadie lo vio nunca, y es la razón por la que el drow siempre va un paso adelante y huele el peligro antes de que llegue.";

nombre("José Antonio de Castel · Hojas de la Noche").rol =
  "El jefe del bajo mundo de Waterdeep, donde las leyes están dadas vuelta. Un hombre esquivo del que muchos dicen que no es un hombre: el que le ve la cara verdadera o le es leal, o no vuelve a ver el cielo. Manda una pequeña sociedad llamada las Hojas de la Noche, cuyo emblema es una daga con una media luna encima. Corben lo dio como salvoconducto para transitar Waterdeep, que no es lo mismo que una garantía.";

nombre("El chamán de los Grandes Fauces").nombre = "Grun";
nombre("Grun").rol =
  "El líder de los Grandes Fauces: orco entrado en años, trenzas canosas y moño alto, más samurái que jefe de horda. Dirige el pueblo orco del bosque y otorga los permisos. Responde al llamado de Omán sin dudarlo, pero deja clara la diferencia: son incondicionales ante Omán, no ante Iron Keep. Es quien pone precio a la alianza con Krenko.";

nombre("Krenko y los Garrahierro").rol =
  "El clan del noreste de los Picos Perdidos, junto al Gran Árbol Padre, en el High Forest: orcos, goblins, hobgoblins y trolls. Krenko nació en libertad y no le debe nada a Omán. Levantó la resistencia contra los elfos con guerra de guerrillas y les fue robando la tecnología. Hoy está en guerra con los constructos de Hellgate y no puede responder a ningún llamado. No confundir con los Garra de Hierro del norte, que son otro clan.";

// ── 3. Dudas que siguen abiertas ─────────────────────────────────
sesion7.dudas = [
  "Del quinto hermano elemental, el de tierra, todavía no se dijo el nombre. De los otros cuatro ya están los cuatro: Ginnungagap el vacío, Pyros el fuego, Illevor el viento y Gunnlod el agua.",
  "El pasaje de la muralla se escuchó como «del hurón» en esta sesión y como «de bribón» en la sesión 6. Queda «de bribón», que es lo registrado, hasta que alguien lo diga de nuevo en mesa.",
  "Korvon dijo que el drow tiene un consejero oráculo llamado Anton de Lake, y por otro lado Benetton había nombrado al Consejo de los Tres. No se sabe si hay relación entre el oráculo y ese consejo, ni cómo encaja Babruk, que en la sesión 4 figuraba como el señor oscuro detrás de los velas negras.",
  "Grun mandó mover el piso al elfo de Waterdeep para que Krenko empiece a confiar, pero no dijo cómo se hace eso ni qué cuenta como suficiente. Tampoco quedó claro cuánto tiempo hay: en Iron Keep las cosas ya están pasando y el High Forest queda lejos y no se llega por mar.",
];

// ── 4. Renames globales ──────────────────────────────────────────
let json = JSON.stringify(data, null, 2);
const rename = (de, a, esperados) => {
  const n = (json.match(de) || []).length;
  if (esperados != null && n !== esperados) {
    throw new Error(`Esperaba ${esperados} ocurrencias de ${de}, encontré ${n}`);
  }
  json = json.replace(de, a);
  console.log(`  ${String(n).padStart(3)} × ${de} -> ${a}`);
};

console.log("Renames:");
rename(/Cinnungaga/g, "Ginnungagap");
rename(/\bAldo\b/g, "Aldor");
rename(/Korvon/g, "Corben");
// El clan de Krenko: Garrahierro -> Garradehierro. Los Garra de Hierro del
// norte (sesión 4) son otros y quedan como están; la única mención suelta que
// hay que arreglar es la de la sesión 6, que hablaba del clan del High Forest.
rename(/Garrahierro/g, "Garradehierro");
rename(
  /los Garra de Hierro, en los Picos Perdidos del High Forest/g,
  "los Garradehierro, en los Picos Perdidos del High Forest",
  1,
);

data = JSON.parse(json);

// Jeremy es Jeremy James.
{
  const j = data.personajes.find((p) => p.id === "jeremy");
  if (j.nombre === "Jeremy") j.nombre = "Jeremy James";
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");

console.log("\nSesión 7 corregida:");
console.log(`  dudas abiertas : ${sesion7.dudas.length}`);
console.log(`  nombres        : ${sesion7.nombres.map((n) => n.nombre).join(" · ")}`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
