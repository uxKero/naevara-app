import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { supabase, supabaseConfigured, CHARACTER_ID } from "@/lib/supabase";

// Siempre dinámico: nunca cachear la lectura del personaje.
export const dynamic = "force-dynamic";

const DATA_PATH = path.join(process.cwd(), "data", "character.json");

async function readLocal() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function GET() {
  // Con Supabase configurado, es la fuente de verdad.
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("character")
        .select("data")
        .eq("id", CHARACTER_ID)
        .maybeSingle();
      if (error) throw error;

      if (data?.data) {
        return NextResponse.json(data.data);
      }

      // No hay fila todavía → sembrar desde el archivo local y devolverla.
      const seed = await readLocal();
      await supabase
        .from("character")
        .upsert({ id: CHARACTER_ID, data: seed, updated_at: new Date().toISOString() });
      return NextResponse.json(seed);
    } catch {
      // Si Supabase falla, intentamos el archivo local para no romper la app.
      try {
        return NextResponse.json(await readLocal());
      } catch {
        return NextResponse.json(
          { error: "No se pudo leer (Supabase y archivo local fallaron)" },
          { status: 500 }
        );
      }
    }
  }

  // Sin Supabase (dev) → archivo local.
  try {
    return NextResponse.json(await readLocal());
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Con Supabase → guardar ahí (persistente y a prueba de despliegues).
  if (supabaseConfigured && supabase) {
    const { error } = await supabase
      .from("character")
      .upsert({ id: CHARACTER_ID, data: body, updated_at: new Date().toISOString() });
    if (error) {
      return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString(), store: "supabase" });
  }

  // Sin Supabase (dev) → archivo local.
  try {
    await writeFile(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString(), store: "file" });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el archivo" }, { status: 500 });
  }
}
