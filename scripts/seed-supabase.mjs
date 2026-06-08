// Sube el contenido actual de data/character.json a la tabla `character` de Supabase.
// Uso: cargar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno y correr:
//   node scripts/seed-supabase.mjs
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const id = process.env.CHARACTER_ID || "naevara";

if (!url || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const data = JSON.parse(
  await readFile(new URL("../data/character.json", import.meta.url), "utf-8")
);

const { error } = await supabase
  .from("character")
  .upsert({ id, data, updated_at: new Date().toISOString() });

if (error) {
  console.error("SEED ERROR:", error.message);
  process.exit(1);
}
console.log(`OK — fila '${id}' sembrada en Supabase.`);
