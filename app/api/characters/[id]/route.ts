import { NextResponse } from "next/server";
import { readFile, writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { BuilderCharacter } from "@/types/builder";

const DIR = path.join(process.cwd(), "data", "characters");
const filePath = (id: string) => path.join(DIR, `${id.replace(/[^a-z0-9-]/gi, "")}.json`);

// ── GET ─────────────────────────────────────────────────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from("character").select("data").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(data.data);
  }
  try {
    const c = JSON.parse(await readFile(filePath(id), "utf-8"));
    return NextResponse.json(c);
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}

// ── PUT (actualizar) ────────────────────────────────────────────
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: BuilderCharacter;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const now = new Date().toISOString();
  const char: BuilderCharacter = { ...body, id, __type: "builder", updatedAt: now, createdAt: body.createdAt || now };

  if (supabaseConfigured && supabase) {
    const { error } = await supabase.from("character").upsert({ id, data: char, updated_at: now });
    if (error) return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
    return NextResponse.json({ ok: true, id, store: "supabase" });
  }
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(filePath(id), JSON.stringify(char, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id, store: "file" });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}

// ── DELETE ──────────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (supabaseConfigured && supabase) {
    const { error } = await supabase.from("character").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  try { await unlink(filePath(id)); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ ok: true }); }
}
