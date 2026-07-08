// Empuja a la fila `vaegrant` de Supabase los campos nuevos y actualizados
// de la Sesión 1, leyéndolos de data/vaegrant.json (la semilla):
//   - cronica  (crónica de sesiones, campo nuevo)
//   - mapa     (mapa de campaña con pines, campo nuevo)
//   - mundo.contexto y mundo.lugares (canon confirmado en mesa)
//   - historia.notaMesa
// El resto de la fila (perfil, galería, ediciones hechas desde la UI) queda intacto.
//
// Nota: los campos NUEVOS (cronica, mapa) no necesitan este script: el GET los
// completa desde la semilla vía mergeConSeed. Este script hace falta para que
// los campos EXISTENTES (mundo, notaMesa) se actualicen en la fila guardada.
//
// Uso: node --env-file=.env.local scripts/patch-vaegrant-sesion1.mjs
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROW_ID = "vaegrant";

if (!url || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (correr con node --env-file=.env.local).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(
  await readFile(new URL("../data/vaegrant.json", import.meta.url), "utf-8")
);

const { data: row, error: readError } = await supabase
  .from("character")
  .select("data")
  .eq("id", ROW_ID)
  .maybeSingle();

if (readError) {
  console.error("LECTURA ERROR:", readError.message);
  process.exit(1);
}

if (!row?.data) {
  console.log("No hay fila 'vaegrant' guardada: la app va a servir la semilla tal cual. Nada que parchear.");
  process.exit(0);
}

// Rename global en lo ya guardado: el mundo-plano se llama Silvapor, no Silverun.
const data = JSON.parse(JSON.stringify(row.data).replaceAll("Silverun", "Silvapor"));
data.cronica = seed.cronica;
data.mapa = seed.mapa;
data.mundo = { ...data.mundo, contexto: seed.mundo.contexto, lugares: seed.mundo.lugares };
data.historia = { ...data.historia, notaMesa: seed.historia.notaMesa };

const { error: writeError } = await supabase
  .from("character")
  .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() });

if (writeError) {
  console.error("ESCRITURA ERROR:", writeError.message);
  process.exit(1);
}
console.log("OK — fila 'vaegrant' parcheada: cronica, mapa, mundo (contexto y lugares) y notaMesa.");
