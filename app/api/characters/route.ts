import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir, readdir } from "fs/promises";
import path from "path";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { BuilderCharacter, CharacterSummary } from "@/types/builder";

const DIR = path.join(process.cwd(), "data", "characters");

function slugify(name: string): string {
  return (name || "personaje")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "personaje";
}
function newId(name: string): string {
  return `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
}
const summary = (c: BuilderCharacter): CharacterSummary => ({
  id: c.id, name: c.name, classIndex: c.classIndex, raceIndex: c.raceIndex, level: c.level, updatedAt: c.updatedAt,
});

// ── GET: listar personajes del builder ──────────────────────────
export async function GET() {
  if (supabaseConfigured && supabase) {
    const { data, error } = await supabase.from("character").select("id, data, updated_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const list = (data ?? [])
      .map((row) => row.data as BuilderCharacter)
      .filter((d) => d && d.__type === "builder")
      .map(summary);
    return NextResponse.json(list);
  }
  // Fallback local
  try {
    await mkdir(DIR, { recursive: true });
    const files = await readdir(DIR);
    const list: CharacterSummary[] = [];
    for (const f of files.filter((x) => x.endsWith(".json"))) {
      try {
        const c = JSON.parse(await readFile(path.join(DIR, f), "utf-8")) as BuilderCharacter;
        if (c && c.__type === "builder") list.push(summary(c));
      } catch { /* skip */ }
    }
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}

// ── POST: crear / actualizar ────────────────────────────────────
export async function POST(req: Request) {
  let body: BuilderCharacter;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!body || body.__type !== "builder") return NextResponse.json({ error: "Falta __type: builder" }, { status: 400 });

  const now = new Date().toISOString();
  const char: BuilderCharacter = {
    ...body,
    id: body.id || newId(body.name),
    createdAt: body.createdAt || now,
    updatedAt: now,
  };

  if (supabaseConfigured && supabase) {
    const { error } = await supabase
      .from("character")
      .upsert({ id: char.id, data: char, updated_at: now });
    if (error) return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
    return NextResponse.json({ ok: true, id: char.id, store: "supabase" });
  }
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${char.id}.json`), JSON.stringify(char, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id: char.id, store: "file" });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar localmente" }, { status: 500 });
  }
}
