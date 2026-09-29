// Convierte las imágenes de la Sesión 12 (sources/.../Sesion 12/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion12.mjs
//
// Sin imagen de la 136, 138, 140, 143 ni 144: Alan generó seis.
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 12/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-09-29";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "9b30a4e8-7ee6-44e1-a67a-6c7eefee0d41.png", prompt: 145, cap: "Antes del primer golpe" },
  { file: "dc7bd4d2-e4b7-4eeb-81e1-e9fb4c04af3b.png", prompt: 137, cap: "Polizones" },
  { file: "f995f9bf-37d1-4583-ade1-80f8d8affc89.png", prompt: 135, cap: "La sombra" },
  { file: "9bfa23ab-3e74-4ec9-91f9-edba7d00cff9.png", prompt: 139, cap: "Soldado o esclavo" },
  { file: "c65763f0-82dd-428b-bd13-f3a0be7a77a9.png", prompt: 141, cap: "La carga" },
  { file: "a56b78a4-f217-4f3a-bec0-ce496711bceb.png", prompt: 142, cap: "Esto lleva adentro" },
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
