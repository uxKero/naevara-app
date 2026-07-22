// Ajustes de mapa Sesión 3 (tercera tanda):
//   - Portal de Veldorn: coordenada fina que pidió el usuario.
//   - Ruta: elimina la línea "planeado" Ioma->Moray de la Sesión 2 (duplicaba el
//     viaje y parecía ida y vuelta). Deja solo el "recorrido" de la Sesión 3.
//   - Reencamina ese recorrido por mar abierto (sin pisar tierra): sale de Ioma,
//     pasa por Magraje, barre al sur y oeste del racimo Moonshae y sube por el
//     canal oeste hasta Moray, pasando por el Ojo de Arena.
import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

// 1) Veldorn fino
const veldorn = data.mapa.marcadores.find((k) => k.id === "portal-veldorn");
if (veldorn) { veldorn.x = 90.8; veldorn.y = 54.9; }

// 2) Sacar la ruta planeada Ioma->Moray de la Sesión 2 (duplicado)
const antes = data.mapa.rutas.length;
data.mapa.rutas = data.mapa.rutas.filter(
  (r) => !(r.sesion === 2 && r.estado === "planeado" && (r.puntos || []).includes("moray"))
);

// 3) Reencaminar el recorrido de la Sesión 3 por mar abierto
const ruta3 = data.mapa.rutas.find((r) => r.sesion === 3);
if (ruta3) {
  ruta3.puntos = ["ioma", "moray"];
  ruta3.via = [
    { x: 11.5, y: 57 },   // salir de Ioma hacia el noroeste
    { x: 10.5, y: 56 },   // Magraje
    { x: 7, y: 54.5 },    // mar abierto al oeste, al sur del racimo Moonshae
    { x: 3.6, y: 51 },    // canal oeste, al oeste de Gwynneth
    { x: 3.6, y: 47.6 },  // subir a Moray pasando por el Ojo de Arena
  ];
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(
  `OK - Veldorn (${veldorn?.x}, ${veldorn?.y}); rutas ${antes} -> ${data.mapa.rutas.length} (fuera la planeada duplicada); recorrido S3 reencaminado por mar (${ruta3?.via.length} waypoints).`
);
