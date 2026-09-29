// Convierte las imágenes de la Sesión 11 (sources/.../Sesion 11/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Idempotente por url. Uso: node scripts/galeria-sesion11.mjs
//
// La 130, "La embestida", no llegó: si aparece, se suma con otro script.
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 11/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-09-29";

// archivo original -> nº de prompt + caption, en orden narrativo
const MAP = [
  { file: "5c575cb8-69b9-44bb-8478-0990d427b9bc.png", prompt: 127, cap: "Esperan órdenes" },
  { file: "26aedbac-e4ea-47eb-a176-64d68bf6dd65.png", prompt: 128, cap: "La sinapsis" },
  { file: "a408f036-2dd9-4f4c-9fd4-02d1e310c949.png", prompt: 129, cap: "Lo agarró en el aire" },
  { file: "c2fa7215-3c58-4910-84e6-7238bf351443.png", prompt: 131, cap: "El cañón prisma" },
  { file: "7df44d5f-8167-46ea-ad65-858e103bc72f.png", prompt: 132, cap: "El elfo al timón" },
  { file: "05ab7e6d-bd53-4a08-9004-888c45c81fbd.png", prompt: 133, cap: "Berserker" },
  { file: "29ea4d8d-c9c7-46dd-bafe-93a8f3c80602.png", prompt: 134, cap: "Las campanillas" },
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
