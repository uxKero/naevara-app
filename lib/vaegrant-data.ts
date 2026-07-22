import { readFile } from "fs/promises";
import path from "path";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { VaegrantData } from "@/types/vaegrant";

// Carga de datos de Vaegrant EN EL SERVIDOR: fila única "vaegrant" de la tabla
// `character` en Supabase (mergeada con la semilla bundleada para completar
// campos nuevos), o la semilla local si no hay credenciales. Misma lógica que el
// GET de /api/vaegrant, pero reutilizable para el render SSR de la ruta (así el
// HTML llega con el contenido y lo pueden leer los crawlers y NotebookLM).
const ROW_ID = "vaegrant";
const FILE = path.join(process.cwd(), "data", "vaegrant.json");

async function readSeed(): Promise<VaegrantData> {
  return JSON.parse(await readFile(FILE, "utf-8")) as VaegrantData;
}

function mergeConSeed<T>(seed: T, stored: unknown): T {
  if (stored === undefined || stored === null) return seed;
  if (Array.isArray(seed) || Array.isArray(stored)) return stored as T;
  if (typeof seed === "object" && typeof stored === "object") {
    const out: Record<string, unknown> = { ...(stored as Record<string, unknown>) };
    for (const [k, v] of Object.entries(seed as Record<string, unknown>)) {
      out[k] = mergeConSeed(v, (stored as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return stored as T;
}

export async function getVaegrantData(): Promise<VaegrantData> {
  if (supabaseConfigured && supabase) {
    const { data } = await supabase
      .from("character")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (data?.data) {
      try {
        return mergeConSeed(await readSeed(), data.data);
      } catch {
        return data.data as VaegrantData;
      }
    }
  }
  return readSeed();
}
