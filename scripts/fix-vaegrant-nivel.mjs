// Pone el nivel de Vaegrant en el perfil publico: heroStats y meta.subtitle.
// La hoja de combate ya lo saca del personaje del builder, pero el perfil lo
// tiene escrito a mano y se quedo en el nivel 1.
//
// Uso: node scripts/fix-vaegrant-nivel.mjs 3
//
// OJO: esto solo toca el repo. Para que se vea en la web hay que correr
// despues `node scripts/publicar-vaegrant.mjs`.
import { readFile, writeFile } from "node:fs/promises";

const nivel = process.argv[2];
if (!/^\d+$/.test(nivel ?? "")) {
  console.error("Uso: node scripts/fix-vaegrant-nivel.mjs <nivel>");
  process.exit(1);
}

const path = new URL("../data/vaegrant.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf-8"));

const stat = (data.heroStats ?? []).find((s) => s.label === "Nivel");
if (!stat) {
  console.error("No encontre el heroStat 'Nivel'. Abortado.");
  process.exit(1);
}

const antes = { heroStat: stat.value, subtitle: data.meta.subtitle };
stat.value = nivel;
data.meta.subtitle = data.meta.subtitle.replace(/^Nivel \d+/, `Nivel ${nivel}`);

if (antes.heroStat === stat.value && antes.subtitle === data.meta.subtitle) {
  console.log(`Ya estaba en nivel ${nivel}. Nada que hacer.`);
  process.exit(0);
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`heroStat Nivel : ${antes.heroStat} -> ${stat.value}`);
console.log(`meta.subtitle  : ${data.meta.subtitle}`);
console.log("\nAcordate de publicar: node scripts/publicar-vaegrant.mjs");
