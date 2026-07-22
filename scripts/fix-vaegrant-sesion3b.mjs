// Ajustes de mapa Sesión 3 (segunda tanda):
//   - Portal de Veldorn: más a la derecha (este), en las planicies.
//   - Ojo de Arena: islita de arena a la izquierda de Moray, donde bajó Hakon
//     con la tripulación. Idempotente.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

const veldorn = data.mapa.marcadores.find((k) => k.id === "portal-veldorn");
if (veldorn) { veldorn.x = 89; veldorn.y = 55; }

if (!data.mapa.marcadores.some((k) => k.id === "ojo-arena")) {
  data.mapa.marcadores.push({
    id: "ojo-arena",
    nombre: "Ojo de Arena",
    x: 3.6,
    y: 47.4,
    tipo: "isla",
    sesiones: [3],
    estado: "aproximado",
    nota: "Pequeña islita de pura arena pegada a Moray, por el oeste. Ahí bajaron Hakon y los tripulantes, que se llevaron el armamento del barco para meter mano por Ámbar antes de que el Albatros entrara a puerto.",
  });
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(
  `OK - Veldorn -> (${veldorn?.x}, ${veldorn?.y}); Ojo de Arena agregado (${data.mapa.marcadores.find((k) => k.id === "ojo-arena")?.x}, ${data.mapa.marcadores.find((k) => k.id === "ojo-arena")?.y}).`
);
