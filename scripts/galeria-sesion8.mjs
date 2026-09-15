// Convierte las imágenes de la Sesión 8 (sources/.../Sesion 8/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion8.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// Supabase y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 8/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-09-08";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "ChatGPT Image 8 sept 2026, 12_32_58 a.m..png", prompt: 90, cap: "El sacerdote de Tromm" },
  { file: "ChatGPT Image 8 sept 2026, 12_33_27 a.m..png", prompt: 92, cap: "Adentro del pasaje de bribón" },
  { file: "ChatGPT Image 8 sept 2026, 12_33_37 a.m..png", prompt: 93, cap: "La Ciudad de los Muertos" },
  { file: "ChatGPT Image 8 sept 2026, 12_35_48 a.m..png", prompt: 95, cap: "A todos lados me atrevo a entrar" },
  { file: "ChatGPT Image 8 sept 2026, 12_33_51 a.m..png", prompt: 99, cap: "Los dos coliseos" },
  { file: "ChatGPT Image 8 sept 2026, 12_33_19 a.m..png", prompt: 91, cap: "Gorko" },
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
