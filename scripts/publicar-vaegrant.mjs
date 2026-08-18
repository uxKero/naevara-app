// Publica data/vaegrant.json en Supabase, que es de donde lee la web en
// producción. Ojo: commitear y deployar NO alcanza. El archivo del repo es
// solo la semilla; /api/vaegrant sirve la fila `vaegrant` de la tabla
// `character` cuando hay credenciales, y su merge devuelve los arrays enteros
// desde lo guardado. Si la fila no se actualiza, la web sigue mostrando la
// versión vieja por más que el deploy haya salido bien.
//
// Uso:
//   npx vercel env pull --environment=production .env.produccion
//   node scripts/publicar-vaegrant.mjs [--dry]
//
// Lee SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.produccion o del entorno.

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ROW_ID = "vaegrant";
const DRY = process.argv.includes("--dry");

for (const archivo of [".env.produccion", ".env.local"]) {
  if (!existsSync(archivo)) continue;
  for (const linea of readFileSync(archivo, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "").trim();
  }
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Corré primero: npx vercel env pull --environment=production .env.produccion");
  process.exit(1);
}

const local = JSON.parse(readFileSync("data/vaegrant.json", "utf8"));
if (local.__type !== "vaegrant") {
  console.error("data/vaegrant.json no tiene __type: vaegrant. Abortado.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const resumen = (d) => ({
  sesiones: (d.cronica ?? []).map((c) => c.numero).join(","),
  personajes: (d.personajes ?? []).length,
  imagenes: (d.galeria?.imagenes ?? []).length,
  marcadores: (d.mapa?.marcadores ?? []).length,
  lugares: (d.mundo?.lugares ?? []).length,
});

const { data: previo, error: errLectura } = await supabase
  .from("character")
  .select("data, updated_at")
  .eq("id", ROW_ID)
  .maybeSingle();
if (errLectura) {
  console.error("No pude leer la fila:", errLectura.message);
  process.exit(1);
}

console.log("EN SUPABASE :", previo?.data ? JSON.stringify(resumen(previo.data)) : "(fila vacía)");
console.log("EN EL REPO  :", JSON.stringify(resumen(local)));

if (DRY) {
  console.log("\n--dry: no se escribió nada.");
  process.exit(0);
}

const ahora = new Date().toISOString();
const { error } = await supabase
  .from("character")
  .upsert({ id: ROW_ID, data: local, updated_at: ahora });
if (error) {
  console.error("ERROR al publicar:", error.message);
  process.exit(1);
}

const { data: verif } = await supabase
  .from("character")
  .select("data")
  .eq("id", ROW_ID)
  .maybeSingle();

console.log("\nPUBLICADO   :", JSON.stringify(resumen(verif.data)));
console.log("updated_at  :", ahora);
