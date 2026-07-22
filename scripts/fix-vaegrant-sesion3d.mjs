// Ajuste fino final de mapa Sesión 3 (coordenadas que fijó el usuario):
//   - Magraje -> (8.7, 55.4)
//   - Ojo de Arena -> (3.6, 49.1)
//   - Ruta S3 reencaminada para pasar por las posiciones nuevas, sobre mar.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

const mag = data.mapa.marcadores.find((k) => k.id === "magraje");
if (mag) { mag.x = 8.7; mag.y = 55.4; }
const ojo = data.mapa.marcadores.find((k) => k.id === "ojo-arena");
if (ojo) { ojo.x = 3.6; ojo.y = 49.1; }

const ruta3 = data.mapa.rutas.find((r) => r.sesion === 3);
if (ruta3) {
  ruta3.via = [
    { x: 11.5, y: 57 },   // salir de Ioma hacia el noroeste
    { x: 8.7, y: 55.4 },  // Magraje
    { x: 5.5, y: 53.5 },  // mar abierto al suroeste del racimo Moonshae
    { x: 3.6, y: 51 },    // canal oeste, al oeste de Gwynneth
    { x: 3.6, y: 49.1 },  // Ojo de Arena, antes de entrar a Moray
  ];
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`OK - Magraje (${mag?.x}, ${mag?.y}); Ojo de Arena (${ojo?.x}, ${ojo?.y}); ruta S3 reencaminada.`);
