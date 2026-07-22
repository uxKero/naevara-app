// Correcciones sobre la Sesión 3 ya integrada (pedidas por el usuario):
//   - Cap "El reparto del Albatros": kit de herborista es de Vaegrant (no de Jeremy),
//     y se saca la nota meta "ausente esta sesión" del Paladín.
//   - nombres[]: se elimina "Christian" (es el Paladín, no un PNJ tripulante).
//   - dudas[]: se elimina la de "Aidacel" (Jeremy es Jeremy).
//   - mapa: se reubica Magraje sobre el mar (más abajo), con esquema correcto
//     (tipo/portal, sesiones, nota) y se agregan los portales de Vaasa y Veldorn
//     como tipo "portal". Se reencamina la ruta por Magraje.
// Idempotente por pasos.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));
const s3 = (data.cronica || []).find((s) => s.id === "sesion-3");
if (!s3) {
  console.error("No existe cronica 'sesion-3'. Corré antes patch-vaegrant-sesion3.mjs.");
  process.exit(1);
}

// 1) Texto del capítulo "El reparto del Albatros"
const cap = s3.capitulos.find((c) => c.titulo === "El reparto del Albatros");
cap.texto =
  "Navegaron un día más. En el Ojo de Arena, un islote de pura arena pegado a Moray, bajaron los tripulantes con Hakon a la cabeza: se iban a meter mano por Ámbar, a hacer contrabando, y se llevaron el armamento del barco, las armas, las lanzas y los cañones que estaban disfrazados de coles en la bodega. Dejaron comida, bebida, mercancía y el oro de la nave, cerca de cuatrocientas treinta monedas, y el Albatros entero al mando de los tres PJ, reconvertido en urca mercante.\n\nSin capitán de oficio, se repartieron el barco. Vaegrant, por su oreja de mensajero y su labia, quedó de oficial diplomático, la voz hacia afuera, y como es el que carga con el kit de herborista se hizo cargo de la semilla. Jeremy tomó la bodega y la carga, la contabilidad y la cartografía. El Paladín, Iscandar, quedó de navegante y capitán del barco: es el que sabe de mar, rutas y tripulaciones, y todavía le deben contar en detalle lo de la isla y el brote, porque se quedó a bordo mientras los otros dos bajaban. Hubo un regateo largo de mesa sobre cuánto oro bajar; quedaron en llevar alrededor de ciento treinta en una bolsa común y dejar el resto bajo llave.";

// 2) nombres: fuera Christian
const antesNombres = s3.nombres.length;
s3.nombres = s3.nombres.filter((n) => !/^christian/i.test(n.nombre));

// 3) dudas: fuera Aidacel
const antesDudas = s3.dudas.length;
s3.dudas = s3.dudas.filter((d) => !/aidacel/i.test(d));

// 4) mapa: reemplazar el marcador magraje por el esquema correcto (tipo portal, sobre mar, más abajo)
data.mapa.marcadores = data.mapa.marcadores.filter((k) => k.id !== "magraje");
const portales = [
  {
    id: "magraje",
    nombre: "Magraje",
    x: 10.5,
    y: 56,
    tipo: "portal",
    sesiones: [3],
    estado: "aproximado",
    nota: "La isla que no está en las cartas, sobre el mar entre Ioma y Moray: el sueño del titán Kyro. En su cráter hay uno de los tres portales primigenios que comunican todos los planos. Secreto del grupo; ubicación tentativa sobre mar abierto.",
  },
  {
    id: "portal-vaasa",
    nombre: "Portal de Vaasa",
    x: 55,
    y: 4,
    tipo: "portal",
    sesiones: [3],
    estado: "aproximado",
    nota: "Uno de los tres portales primigenios, según Kyro: un poco al norte de Vaasa y Delhalls. El grupo no lo visitó; ubicación aproximada contra el mapa.",
  },
  {
    id: "portal-veldorn",
    nombre: "Portal de Veldorn",
    x: 85,
    y: 55,
    tipo: "portal",
    sesiones: [3],
    estado: "aproximado",
    nota: "Uno de los tres portales primigenios, según Kyro: arriba de Veldorn, en las planicies, sin llegar al desierto (las Plains of Purple Dust). El grupo no lo visitó; ubicación aproximada.",
  },
];
data.mapa.marcadores.push(...portales);

// 5) ruta de la Sesión 3: reencaminar por Magraje
const ruta3 = data.mapa.rutas.find((r) => r.sesion === 3);
if (ruta3) {
  ruta3.via = [
    { x: 12, y: 57.2 },
    { x: 10.5, y: 56 },
    { x: 7.5, y: 50.5 },
  ];
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(
  `OK - correcciones aplicadas:\n` +
    `  cap "El reparto del Albatros": herborista -> Vaegrant, sin nota meta de ausencia\n` +
    `  nombres: ${antesNombres} -> ${s3.nombres.length} (fuera Christian)\n` +
    `  dudas: ${antesDudas} -> ${s3.dudas.length} (fuera Aidacel)\n` +
    `  mapa: Magraje reubicado a (10.5, 56) tipo portal + Portal de Vaasa (55,4) + Portal de Veldorn (85,55)\n` +
    `  ruta sesión 3 reencaminada por Magraje`
);
