import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Diario de Vaegrant",
  description: "El perfil de Vaegrant leído como un manuscrito antiguo",
};

// ── Mini-parser de Markdown (suficiente para el perfil) ──────────
type Block =
  | { t: "h1" | "h2" | "h3"; text: string }
  | { t: "p"; text: string }
  | { t: "quote"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "hr" };

function parsear(md: string): Block[] {
  // El diario termina donde empieza lo meta (ganchos y resumen mecánico).
  const corte = md.search(/^## Ganchos para el Master/m);
  const cuerpo = (corte >= 0 ? md.slice(0, corte) : md)
    .split("\n")
    // fuera: líneas de ficha y acotaciones de mesa entre paréntesis
    .filter((l) => !/^\*\*(Alineamiento|Trasfondo|Mundo):\*\*/.test(l.trim()))
    .filter((l) => !/^\*\(.*\)\*$/.test(l.trim()));

  const blocks: Block[] = [];
  let i = 0;
  while (i < cuerpo.length) {
    const line = cuerpo[i].trim();
    if (!line) { i++; continue; }
    if (line === "---") { blocks.push({ t: "hr" }); i++; continue; }
    if (line.startsWith("### ")) { blocks.push({ t: "h3", text: line.slice(4) }); i++; continue; }
    if (line.startsWith("## "))  { blocks.push({ t: "h2", text: line.slice(3) }); i++; continue; }
    if (line.startsWith("# "))   { blocks.push({ t: "h1", text: line.slice(2) }); i++; continue; }
    if (line.startsWith("> "))   { blocks.push({ t: "quote", text: line.slice(2) }); i++; continue; }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < cuerpo.length && /^- /.test(cuerpo[i].trim())) { items.push(cuerpo[i].trim().slice(2)); i++; }
      blocks.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < cuerpo.length && /^\d+\. /.test(cuerpo[i].trim())) { items.push(cuerpo[i].trim().replace(/^\d+\. /, "")); i++; }
      blocks.push({ t: "ol", items });
      continue;
    }
    // párrafo: juntar líneas consecutivas
    const partes: string[] = [];
    while (i < cuerpo.length && cuerpo[i].trim() && !/^(#|>|-|\d+\. |---)/.test(cuerpo[i].trim())) {
      partes.push(cuerpo[i].trim()); i++;
    }
    blocks.push({ t: "p", text: partes.join(" ") });
  }
  return blocks;
}

// Inline: **negrita** y *cursiva*
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default async function DiarioPage() {
  const md = await readFile(path.join(process.cwd(), "Vaegrant_Perfil.md"), "utf-8");
  const blocks = parsear(md);

  return (
    <div className="diario-fondo">
      <style>{`
        .diario-fondo {
          min-height: 100vh; background: #0b0f15; padding: 28px 14px 60px;
        }
        .diario-volver {
          display: block; max-width: 740px; margin: 0 auto 14px;
          color: #78848f; font-size: 12px; text-decoration: none;
        }
        .diario-volver:hover { color: #c99c5a; }
        .diario-papel {
          max-width: 740px; margin: 0 auto; padding: 64px 68px 80px;
          color: #3b3226; border-radius: 3px;
          background:
            radial-gradient(ellipse at 12% 8%, rgba(120,90,40,0.10) 0%, transparent 40%),
            radial-gradient(ellipse at 90% 30%, rgba(120,90,40,0.08) 0%, transparent 35%),
            radial-gradient(ellipse at 30% 95%, rgba(100,70,30,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at center, #ece0c6 0%, #e4d5b4 55%, #d8c69e 100%);
          box-shadow:
            inset 0 0 60px rgba(90,65,30,0.28),
            inset 0 0 6px rgba(90,65,30,0.25),
            0 20px 60px rgba(0,0,0,0.55);
          font-family: var(--font-body), Georgia, serif;
          font-size: 16px; line-height: 1.75;
        }
        .diario-papel h1 {
          font-family: var(--font-display), serif; font-weight: 600;
          font-size: 44px; text-align: center; margin: 0 0 2px; color: #46351b;
          letter-spacing: 0.06em;
        }
        .diario-sub {
          text-align: center; font-style: italic; font-size: 17px;
          color: #6b573a; margin: 0 0 6px;
        }
        .diario-papel h2 {
          font-family: var(--font-display), serif; font-weight: 600;
          font-size: 26px; text-align: center; color: #46351b;
          margin: 54px 0 6px; letter-spacing: 0.08em;
        }
        .diario-papel h2::after {
          content: "❧"; display: block; font-size: 15px; color: #a5824d; margin-top: 6px;
        }
        .diario-papel h3 {
          font-family: var(--font-body), serif; font-style: italic; font-weight: 600;
          font-size: 19px; color: #55432a; margin: 34px 0 8px;
        }
        .diario-papel p { margin: 0 0 14px; text-align: justify; }
        .diario-papel h2 + p::first-letter, .diario-papel h2 + .diario-orn + p::first-letter {
          font-family: var(--font-display), serif;
          font-size: 46px; float: left; line-height: 0.85;
          padding: 4px 8px 0 0; color: #7a5a2b;
        }
        .diario-papel blockquote {
          font-style: italic; text-align: center; font-size: 18px; color: #5d4a2e;
          margin: 26px 30px; padding: 0;
        }
        .diario-papel blockquote::before, .diario-papel blockquote::after {
          content: ""; display: block; width: 90px; height: 1px;
          background: #a5824d; margin: 10px auto; opacity: 0.6;
        }
        .diario-papel ul, .diario-papel ol { margin: 0 0 14px; padding-left: 26px; }
        .diario-papel li { margin-bottom: 7px; }
        .diario-papel ul { list-style: none; padding-left: 8px; }
        .diario-papel ul li::before { content: "✦"; color: #a5824d; font-size: 11px; margin-right: 10px; }
        .diario-orn {
          text-align: center; color: #a5824d; font-size: 14px;
          letter-spacing: 14px; margin: 40px 0; user-select: none;
        }
        .diario-cierre {
          text-align: center; font-style: italic; color: #6b573a;
          margin-top: 56px; font-size: 15px;
        }
        .diario-firma {
          font-family: var(--font-display), serif; font-size: 24px;
          color: #46351b; margin-top: 6px; letter-spacing: 0.1em;
        }
        @media (max-width: 640px) {
          .diario-papel { padding: 40px 26px 56px; font-size: 15px; }
          .diario-papel h1 { font-size: 32px; }
          .diario-papel h2 { font-size: 22px; }
        }
      `}</style>

      <Link href="/vaegrant" className="diario-volver">← Volver al perfil</Link>

      <article className="diario-papel">
        {blocks.map((b, i) => {
          switch (b.t) {
            case "h1": return (
              <div key={i}>
                <h1>{b.text}</h1>
                <p className="diario-sub">Apuntes de un quebrado, escritos en Silvapor</p>
              </div>
            );
            case "h2": return <h2 key={i}>{b.text}</h2>;
            case "h3": {
              // el subtítulo del .md ("(Aeril Tirael) · Alto Elfo...") ya está en la cabecera
              if (b.text.startsWith("(Aeril")) return <p key={i} className="diario-sub">{b.text}</p>;
              return <h3 key={i}>{inline(b.text)}</h3>;
            }
            case "quote": return <blockquote key={i}>{inline(b.text)}</blockquote>;
            case "ul": return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
            case "ol": return <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>;
            case "hr": return <div key={i} className="diario-orn">✦ ✦ ✦</div>;
            case "p": return <p key={i}>{inline(b.text)}</p>;
          }
        })}
        <div className="diario-cierre">
          Estoy acá.
          <div className="diario-firma">V.</div>
        </div>
      </article>
    </div>
  );
}
