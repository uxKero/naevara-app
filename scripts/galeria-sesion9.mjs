// Convierte las imágenes de la Sesión 9 (sources/.../Sesion 9/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion9.mjs
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 9/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-09-15";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "chapoteadero.png", prompt: 104, cap: "El Chapoteadero" },
  { file: "5bb31a20-a2c6-4f95-8c65-b5487d7dfd52.png", prompt: 115, cap: "El masaje" },
  { file: "81c04ada-f676-40a1-b07d-a8c02dfedcda.png", prompt: 116, cap: "Jeremy no vuelve" },
  { file: "e040236b-d337-49f4-8fba-dbb2de49050a.png", prompt: 106, cap: "La oficina del balde" },
  { file: "crestaroja.png", prompt: 103, cap: "Gonagal Crestarroja" },
  { file: "5b99013d-fdec-48f5-8b6e-87d0db8dc421.png", prompt: 109, cap: "El barril" },
  { file: "f6ad1596-9120-4758-87b2-bd778a3b7d2f.png", prompt: 111, cap: "La torre de reloj de Hellgate" },
  { file: "fastboys.png", prompt: 112, cap: "Los Fast Boy" },
  { file: "97c8b595-cf5f-4821-8566-6098b4ea2df0.png", prompt: 114, cap: "El palco rojo" },
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
