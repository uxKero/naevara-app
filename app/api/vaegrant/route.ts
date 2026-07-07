import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { VaegrantData } from "@/types/vaegrant";

// Perfil narrativo de Vaegrant: fila única "vaegrant" en la tabla `character`.
// Mismo esquema de persistencia que /api/save (Naevara): Supabase si hay
// credenciales, archivo local si no (dev sin .env).
const ROW_ID = "vaegrant";
const FILE = path.join(process.cwd(), "data", "vaegrant.json");

async function readSeed(): Promise<VaegrantData> {
  return JSON.parse(await readFile(FILE, "utf-8")) as VaegrantData;
}

// Completa con la semilla los campos que falten en lo guardado (p. ej. cuando
// el esquema crece y la fila de Supabase quedó con una versión anterior).
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

export async function GET() {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("character")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.data) {
      try {
        return NextResponse.json(mergeConSeed(await readSeed(), data.data));
      } catch {
        return NextResponse.json(data.data);
      }
    }
    // Primera vez: servir la semilla bundleada (se persiste en el primer POST).
    try {
      return NextResponse.json(await readSeed());
    } catch {
      return NextResponse.json({ error: "Sin datos de Vaegrant" }, { status: 404 });
    }
  }
  try {
    return NextResponse.json(await readSeed());
  } catch {
    return NextResponse.json({ error: "No se pudo leer data/vaegrant.json" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: VaegrantData;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!body || body.__type !== "vaegrant") {
    return NextResponse.json({ error: "Falta __type: vaegrant" }, { status: 400 });
  }

  const now = new Date().toISOString();
  if (supabaseConfigured && supabase) {
    const { error } = await supabase
      .from("character")
      .upsert({ id: ROW_ID, data: body, updated_at: now });
    if (error) return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
    return NextResponse.json({ ok: true, savedAt: now, store: "supabase" });
  }
  try {
    await writeFile(FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true, savedAt: now, store: "file" });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar localmente" }, { status: 500 });
  }
}
