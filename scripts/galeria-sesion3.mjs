// Convierte las imágenes de la Sesión 3 (sources/.../images/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion3.mjs
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 3/images";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-07-22";

const files = fs.readdirSync(srcDir).filter((f) => /\.png$/i.test(f)).sort();

// índice cronológico (1-based, orden por nombre) -> nº de mundo + caption
const MAP = {
  1:  { n: 32, cap: "Magraje, la isla que no existe" },
  2:  { n: 33, cap: "La playa imposible" },
  3:  { n: 34, cap: "Adentrándose en la jungla" },
  4:  { n: 35, cap: "El corazón de la isla" },
  5:  { n: 39, cap: "El portal de Vaasa" },
  6:  { n: 40, cap: "El portal de Veldorn" },
  7:  { n: 37, cap: "Kyro y los dos viajeros" },
  8:  { n: 36, cap: "El despertar de Kyro" },
  9:  { n: 38, cap: "La semilla Njröun" },
  10: { n: 41, cap: "El arribo a Moray" },
  11: { n: 42, cap: "La feria de Moray" },
  12: { n: 43, cap: "Moray, el pueblo de barro" },
};

const nuevos = [];
for (let i = 0; i < files.length; i++) {
  const m = MAP[i + 1];
  if (!m) continue;
  const url = `/vaegrant-galeria/mundo-${m.n}.jpg`;
  await sharp(`${srcDir}/${files[i]}`)
    .resize(1536, null, { withoutEnlargement: true })
    .jpeg({ quality: 86 })
    .toFile(`${outDir}/mundo-${m.n}.jpg`);
  nuevos.push({ n: m.n, url, prompt: `Mundo · ${m.cap}` });
}

nuevos.sort((a, b) => a.n - b.n); // orden narrativo en la galería

const dataPath = "data/vaegrant.json";
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const have = new Set(data.galeria.imagenes.map((x) => x.url));
let added = 0;
for (const e of nuevos) {
  if (!have.has(e.url)) {
    data.galeria.imagenes.push({ url: e.url, prompt: e.prompt, fecha: FECHA });
    added++;
  }
}
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
console.log(
  `Convertidas ${files.length} imágenes a ${outDir}. Galería: +${added} (total ${data.galeria.imagenes.length}).`,
);
