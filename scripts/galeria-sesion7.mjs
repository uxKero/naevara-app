// Convierte las imágenes de la Sesión 7 (sources/.../Sesion 7/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion7.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// Supabase y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 7/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-08-25";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "ChatGPT Image 25 ago 2026, 02_10_56 p.m..png", prompt: 79, cap: "La moneda de media luna" },
  { file: "ChatGPT Image 25 ago 2026, 02_09_56 p.m..png", prompt: 78, cap: "Pyros, el alma de la Tortuga Veloz" },
  { file: "ChatGPT Image 25 ago 2026, 02_12_08 p.m..png", prompt: 84, cap: "El Albatros con manzanillas" },
  { file: "ChatGPT Image 25 ago 2026, 02_12_24 p.m..png", prompt: 85, cap: "La Virgen Marchita" },
  { file: "ChatGPT Image 25 ago 2026, 02_12_29 p.m..png", prompt: 86, cap: "La torre del reloj de arena" },
  { file: "ChatGPT Image 25 ago 2026, 02_12_45 p.m..png", prompt: 87, cap: "El pueblo de los Grandes Fauces" },
  { file: "ChatGPT Image 25 ago 2026, 02_12_56 p.m..png", prompt: 88, cap: "La trenza de Ungor" },
  { file: "ChatGPT Image 25 ago 2026, 02_16_41 p.m..png", prompt: 89, cap: "Grun y la guerra vieja" },
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
