// Convierte las imágenes de la Sesión 5 (sources/.../Sesion 5/images/*.png) a jpg
// optimizado en public/vaegrant-galeria/ y las suma a data/vaegrant.json →
// galeria.imagenes como estampas "Mundo · ...", en orden narrativo.
// Además fija el retrato de Haddrek en personajes.
// Idempotente por url. Uso: node scripts/galeria-sesion5.mjs
import sharp from "sharp";
import fs from "node:fs";

const srcDir = "sources/Vaegrant/Sesion 5/images";
const outDir = "public/vaegrant-galeria";
const FECHA = "2026-08-10";

// archivo original -> nº de prompt (orden narrativo) + caption de galería
const MAP = [
  { file: "cápsula_de_ensueño_luminosa.png", prompt: 48, cap: "Gunnlod, el alma del Albatros" },
  { file: "caja.png", prompt: 49, cap: "Caja, el guardián de la bodega" },
  { file: "barriles.png", prompt: 50, cap: "Los diez barriles" },
  { file: "extra_1_a_detailed_cinematic_fantasy_illustration_charact_1.png", prompt: 51, cap: "Haddrek, cobrador de Iron Keep", retrato: "haddrek" },
  { file: "vaegrantllave.png", prompt: 52, cap: "La puerta que se desgrana" },
  { file: "waterdeepque.png", prompt: 57, cap: "«¿Waterdeep?»" },
  { file: "cuidandolaplanta.png", prompt: 58, cap: "Njröun en la bodega" },
  { file: "saliendo de moray.png", prompt: 59, cap: "Zarpar mientras llegan" },
  { file: "buscandoayuda.png", prompt: 60, cap: "El puerto de Iron Keep" },
  { file: "ChatGPT Image 10 ago 2026, 07_13_28 p.m..png", prompt: 62, cap: "La balista de proa" },
  { file: "adiospesquerito.png", prompt: 63, cap: "El pesquero" },
  { file: "escudodehielo.png", prompt: 64, cap: "El escudo de hielo" },
  { file: "puertocorona.png", prompt: 66, cap: "Puerto Corona" },
];

const faltantes = MAP.filter((m) => !fs.existsSync(`${srcDir}/${m.file}`));
if (faltantes.length) {
  console.error("No encontré:", faltantes.map((f) => f.file).join(", "));
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

  // el retrato de personaje va aparte, en vertical y con su propio nombre
  if (m.retrato) {
    const pUrl = `/vaegrant-galeria/personaje-${m.retrato}.jpg`;
    await sharp(`${srcDir}/${m.file}`)
      .resize(1024, null, { withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(`${outDir}/personaje-${m.retrato}.jpg`);
    const pj = data.personajes.find((p) => p.nombre.toLowerCase().includes(m.retrato));
    if (pj && !pj.imagen) {
      pj.imagen = pUrl;
      console.log(`retrato fijado: ${pj.nombre} -> ${pUrl}`);
    }
  }
}

const yaEstan = new Set(data.galeria.imagenes.map((i) => i.url));
const agregar = nuevos.filter((i) => !yaEstan.has(i.url));
data.galeria.imagenes.push(...agregar);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`${agregar.length} imágenes agregadas (total galería: ${data.galeria.imagenes.length}).`);
