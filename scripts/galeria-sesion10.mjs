// Convierte las imágenes de la Sesión 10 (sources/.../Sesion 10/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion10.mjs
//
// Queda afuera a propósito la versión vieja de "Salen de abajo" (la del
// 12:58, terreno abierto y máquinas lejanas): Alan pidió la versión de
// trampa, que es la del 13:02.
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 10/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-09-22";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "ChatGPT Image 22 sept 2026, 12_57_06 p.m..png", prompt: 119, cap: "Caltor" },
  { file: "ChatGPT Image 22 sept 2026, 12_57_27 p.m..png", prompt: 121, cap: "Las ofrendas" },
  { file: "ChatGPT Image 22 sept 2026, 12_57_38 p.m..png", prompt: 122, cap: "Un mal chiste" },
  { file: "ChatGPT Image 22 sept 2026, 12_57_56 p.m..png", prompt: 123, cap: "Llueven latas de atún" },
  { file: "Spinel.png", prompt: 118, cap: "Spinel" },
  { file: "ChatGPT Image 22 sept 2026, 01_02_24 p.m..png", prompt: 125, cap: "Salen de abajo" },
  { file: "ChatGPT Image 22 sept 2026, 01_00_08 p.m..png", prompt: 126, cap: "Un hermoso día para morir" },
];

const faltan = MAP.filter((m) => !fs.existsSync(`${srcDir}/${m.file}`));
if (faltan.length) {
  console.error("No encontré:", faltan.map((f) => f.file).join(" · "));
  process.exit(1);
}

const dataPath = "data/vaegrant.json";
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// continuar la numeración mundo-NN existente
const usados = data.galeria.imagenes
  .map((i) => Number((i.url.match(/mundo-(\d+)\.jpg$/) || [])[1]))
  .filter(Boolean);
let n = Math.max(...usados);

const nuevos = [];
for (const m of MAP) {
  n += 1;
  const url = `/vaegrant-galeria/mundo-${n}.jpg`;
  await sharp(`${srcDir}/${m.file}`)
    .resize(1536, null, { withoutEnlargement: true })
    .jpeg({ quality: 86 })
    .toFile(`${outDir}/mundo-${n}.jpg`);
  nuevos.push({ url, prompt: `Mundo · ${m.cap}`, fecha: FECHA });
}

const yaEstan = new Set(data.galeria.imagenes.map((i) => i.url));
const agregar = nuevos.filter((i) => !yaEstan.has(i.url));
data.galeria.imagenes.push(...agregar);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`${agregar.length} imágenes agregadas (total galería: ${data.galeria.imagenes.length}).`);
for (const i of agregar) console.log("  ", i.url, "|", i.prompt);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
