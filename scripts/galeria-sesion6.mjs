// Convierte las imágenes de la Sesión 6 (sources/.../Sesion 6/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion6.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// Supabase y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 6/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-08-18";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "ChatGPT Image 18 ago 2026, 02_18_17 p.m..png", prompt: 69, cap: "Puerto Corona y el muro" },
  { file: "ChatGPT Image 18 ago 2026, 02_18_24 p.m..png", prompt: 70, cap: "La plaza del cadalso" },
  { file: "ChatGPT Image 18 ago 2026, 02_18_10 p.m..png", prompt: 68, cap: "Bragan y la pila de chatarra" },
  { file: "ChatGPT Image 18 ago 2026, 02_18_29 p.m..png", prompt: 71, cap: "Los que viven abajo" },
  { file: "ChatGPT Image 18 ago 2026, 02_20_22 p.m..png", prompt: 72, cap: "Kada, el jefe del bajo mundo" },
  { file: "ChatGPT Image 18 ago 2026, 02_22_23 p.m..png", prompt: 74, cap: "Las dos naves" },
  { file: "ChatGPT Image 18 ago 2026, 02_31_12 p.m..png", prompt: 75, cap: "La mesa de capitanes" },
  { file: "ChatGPT Image 18 ago 2026, 02_24_26 p.m..png", prompt: 76, cap: "El pasaje de bribón" },
];

const faltan = MAP.filter((m) => !fs.existsSync(`${srcDir}/${m.file}`));
if (faltan.length) {
  console.error("No encontré:", faltan.map((f) => f.file).join(" · "));
  process.exit(1);
}

const dataPath = "data/vaegrant.json";
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

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
