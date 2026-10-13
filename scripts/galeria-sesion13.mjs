// Convierte las imágenes de la Sesión 13 (sources/.../Sesion 13/img/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo. Además le
// pone a cada paso de la batalla (cronica → sesion-13 → combate) su imagen.
// Idempotente por url. Uso: node scripts/galeria-sesion13.mjs
//
// Sin imagen de la 146 (la ficha del grandote): Alan generó cinco.
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// después `node scripts/publicar-vaegrant.mjs`, porque producción lee de
// la base y no del archivo.
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 13/img";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-10-06";

// archivo original -> nº de prompt + caption + paso de la batalla, en orden narrativo
const MAP = [
  { file: "Asedio bajo la luna llena.png", prompt: 147, cap: "La palanca seis", paso: 4 },
  { file: "Huida en vagoneta sobre el abismo.png", prompt: 148, cap: "Tres ruedas sobre la brecha", paso: 6 },
  { file: "Batalla nocturna entre orcos y autómatas.png", prompt: 149, cap: "Gorko", paso: 7 },
  { file: "Control mágico ante el coloso.png", prompt: 150, cap: "Los botones", paso: 9 },
  { file: "Fuga a toda velocidad por la mina.png", prompt: 151, cap: "Salida no muy segura", paso: 10 },
];

const faltan = MAP.filter((m) => !fs.existsSync(`${srcDir}/${m.file}`));
if (faltan.length) {
  console.error("No encontré:", faltan.map((f) => f.file).join(" · "));
  process.exit(1);
}

const dataPath = "data/vaegrant.json";
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const sesion = data.cronica.find((s) => s.id === "sesion-13");
if (!sesion?.combate) {
  console.error("Falta la Sesión 13 en la crónica: correr antes scripts/patch-vaegrant-sesion13.mjs");
  process.exit(1);
}

// Si ya se corrió, se reusa el número que tiene cada caption; si no, se sigue la numeración.
const porCaption = new Map(data.galeria.imagenes.filter((i) => i.fecha === FECHA).map((i) => [i.prompt, i.url]));
const usados = data.galeria.imagenes
  .map((i) => Number((i.url.match(/mundo-(\d+)\.jpg$/) || [])[1]))
  .filter(Boolean);
let n = Math.max(...usados);

const nuevos = [];
for (const m of MAP) {
  const caption = `Mundo · ${m.cap}`;
  const url = porCaption.get(caption) ?? `/vaegrant-galeria/mundo-${++n}.jpg`;
  await sharp(`${srcDir}/${m.file}`)
    .resize(1536, null, { withoutEnlargement: true })
    .jpeg({ quality: 86 })
    .toFile(`${outDir}/${url.split("/").pop()}`);
  nuevos.push({ url, prompt: caption, fecha: FECHA });
  sesion.combate.pasos[m.paso - 1].imagen = { url, titulo: m.cap };
}

const yaEstan = new Set(data.galeria.imagenes.map((i) => i.url));
const agregar = nuevos.filter((i) => !yaEstan.has(i.url));
data.galeria.imagenes.push(...agregar);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`${agregar.length} imágenes agregadas (total galería: ${data.galeria.imagenes.length}).`);
for (const i of nuevos) console.log("  ", i.url, "|", i.prompt);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
