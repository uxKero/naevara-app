"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Pickaxe, Swords, Link2 } from "lucide-react";
import EscenaMina from "./EscenaMina";
import type { VCombate, VPiezaCampo, VTramoRecorrido } from "@/types/vaegrant";

const C = {
  bg: "#10151c",
  bgDeep: "#0b0f15",
  subtle: "#161d26",
  border: "rgba(141,163,184,0.16)",
  borderSoft: "rgba(141,163,184,0.09)",
  text: "#e6e9ec",
  muted: "#b4bec8",
  faint: "#78848f",
  steel: "#8da3b8",
  steelStrong: "#c2d1dd",
  amber: "#c99c5a",
  amberSoft: "rgba(201,156,90,0.14)",
  enemigo: "#c0705a",
  lava: "#e8692c",
  orco: "#7fa36a",
  vacio: "#7d6bc0",
};
const R = 3;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

// Curva suave por los tramos: el túnel no es una poligonal, es una galería cavada.
function curva(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return pts.length ? `M${pts[0].x} ${pts[0].y}` : "";
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let k = 0; k < pts.length - 1; k++) {
    const p0 = pts[k - 1] ?? pts[k], p1 = pts[k], p2 = pts[k + 1], p3 = pts[k + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function CombateSesion({ combate }: { combate: VCombate }) {
  const { pasos, recorrido, piezas } = combate;
  const [i, setI] = useState(0);
  // Si el cambio vino del teclado, no se anima: el que recorre con flechas quiere ver ya.
  const [instant, setInstant] = useState(false);

  const ir = useCallback((n: number, porTeclado = false) => {
    setInstant(porTeclado);
    setI(Math.max(0, Math.min(pasos.length - 1, n)));
  }, [pasos.length]);

  const p = pasos[i];
  const idxTramo = recorrido.findIndex((t) => t.id === p.tramo);
  const tramo = recorrido[idxTramo];
  const caidas = new Set(p.caidas ?? []);
  const presentes = new Set(p.presentes);
  const anterior = i > 0 ? new Set(pasos[i - 1].presentes) : presentes;
  const idxRueda = recorrido.findIndex((t) => t.id === "rueda");
  const idxPit = recorrido.findIndex((t) => t.id === "pit");
  const sinRueda = p.carro !== null && idxTramo >= idxRueda && idxTramo < idxPit;

  return (
    <div
      className={`vg-combate${instant ? " vg-instant" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); ir(i + 1, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); ir(i - 1, true); }
      }}
      style={{ outline: "none", margin: "8px 0 6px" }}
    >
      <style>{`
        .vg-combate .vg-t { transition: opacity 280ms ${EASE}, transform 280ms ${EASE}, width 280ms ${EASE}, fill 280ms ${EASE}, stroke 280ms ${EASE}, stroke-dashoffset 420ms ${EASE}; }
        .vg-combate.vg-instant .vg-t { transition: none; }
        .vg-combate .vg-paso-btn { transition: transform 140ms ${EASE}, background 160ms ${EASE}, color 160ms ${EASE}; }
        .vg-combate .vg-paso-btn:active:not(:disabled) { transform: scale(0.97); }
        .vg-combate .vg-seg { transition: background 200ms ${EASE}; }
        .vg-combate .vg-foto { animation: vg-foto-in 320ms ${EASE} both; }
        .vg-combate.vg-instant .vg-foto { animation: none; }
        @keyframes vg-foto-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes vg-hervor { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.9; } }
        .vg-combate .vg-lava { animation: vg-hervor 2.4s ease-in-out infinite; }
        @keyframes vg-giro { to { transform: rotate(360deg); } }
        .vg-combate .vg-giro { animation: vg-giro 9s linear infinite; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .vg-combate .vg-t { transition: opacity 200ms ease; }
          .vg-combate .vg-foto { animation: vg-fade 200ms ease both; }
          .vg-combate .vg-lava, .vg-combate .vg-giro { animation: none; }
          .vg-combate .vg-paso-btn:active:not(:disabled) { transform: none; }
        }
        @keyframes vg-fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Cabecera del paso */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: C.steel, letterSpacing: "0.04em" }}>
            Paso {i + 1} de {pasos.length}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: C.text, lineHeight: 1.25 }}>{p.titulo}</div>
        </div>
        <BotonPaso onClick={() => ir(i - 1)} disabled={i === 0} label="Paso anterior"><ChevronLeft size={18} /></BotonPaso>
        <BotonPaso onClick={() => ir(i + 1)} disabled={i === pasos.length - 1} label="Paso siguiente" primario><ChevronRight size={18} /></BotonPaso>
      </div>

      {/* Línea de pasos */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {pasos.map((ps, k) => (
          <button
            key={k}
            className="vg-seg"
            onClick={() => ir(k)}
            title={ps.titulo}
            aria-label={`Ir al paso ${k + 1}: ${ps.titulo}`}
            style={{
              flex: 1, height: 6, padding: 0, border: "none", borderRadius: 2, cursor: "pointer",
              background: k < i ? "rgba(201,156,90,0.45)" : k === i ? C.amber : C.border,
            }}
          />
        ))}
      </div>

      {p.imagen && (
        <figure key={p.imagen.url} className="vg-foto" style={{ margin: "0 0 14px" }}>
          <img
            src={p.imagen.url}
            alt={p.imagen.titulo}
            style={{ width: "100%", display: "block", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: R + 2 }}
          />
          <figcaption style={{ fontSize: 14, color: C.steel, marginTop: 7 }}>{p.imagen.titulo}</figcaption>
        </figure>
      )}

      <div style={{ display: "grid", gap: 14 }}>
        {/* ── Adentro: el carro ── */}
        <Panel icono={<Pickaxe size={16} />} titulo="Adentro · el carro">
          <div key={p.tramo} className="vg-foto">
            <EscenaMina tramo={p.tramo} paso={i} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Mina recorrido={recorrido} idx={idxTramo} carro={p.carro} sinRueda={sinRueda} />
          </div>
          <Medidor
            nombre="Carro"
            valor={p.carro}
            max={p.carroMax}
            etiqueta={p.carro === null ? "Destruido" : `${p.carro} de ${p.carroMax}`}
            color={p.carro === null ? C.enemigo : C.amber}
          />
          <p style={textoPanel}>{p.adentro}</p>
        </Panel>

        {/* ── Afuera: la explanada ── */}
        <Panel icono={<Swords size={16} />} titulo={`Afuera · ${combate.campo.nombre.toLowerCase()}`}>
          <svg viewBox="0 0 100 62" style={{ width: "100%", display: "block", borderRadius: R }}>
            <defs>
              <pattern id="vg-grilla" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
                <path d="M3.2 0H0V3.2" fill="none" stroke="rgba(214,226,120,0.10)" strokeWidth={0.18} />
              </pattern>
              <radialGradient id="vg-niebla">
                <stop offset="0%" stopColor="#8d7fb8" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#8d7fb8" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="vg-musgo">
                <stop offset="0%" stopColor="#7d8a3a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7d8a3a" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="vg-vacio">
                <stop offset="0%" stopColor="#05070a" stopOpacity={1} />
                <stop offset="65%" stopColor="#231a40" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#231a40" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="vg-aura">
                <stop offset="0%" stopColor={C.vacio} stopOpacity={0.5} />
                <stop offset="100%" stopColor={C.vacio} stopOpacity={0} />
              </radialGradient>
            </defs>
            {/* El tapete: fondo oliva, musgo y la niebla violeta de la mesa */}
            <rect width="100" height="62" fill="#1a1d17" />
            {[[12, 8, 20], [80, 12, 18], [44, 50, 22], [92, 52, 14]].map(([x, y, r], k) => (
              <circle key={`m${k}`} cx={x} cy={y} r={r} fill="url(#vg-musgo)" />
            ))}
            {[[30, 22, 26], [66, 30, 24], [8, 46, 18], [58, 6, 16], [86, 44, 16]].map(([x, y, r], k) => (
              <ellipse key={`n${k}`} cx={x} cy={y} rx={r} ry={r * 0.55} fill="url(#vg-niebla)" />
            ))}
            <rect width="100" height="62" fill="url(#vg-grilla)" />
            {/* Boca de la cueva, en piedra */}
            <g>
              <path d={`M${combate.campo.boca.x - 16} 62 L${combate.campo.boca.x - 13} 55 L${combate.campo.boca.x - 7} 51 L${combate.campo.boca.x} 49.5 L${combate.campo.boca.x + 8} 51 L${combate.campo.boca.x + 14} 55 L${combate.campo.boca.x + 17} 62 Z`}
                fill="#2a2a2c" stroke="#3b3b3e" strokeWidth={0.4} />
              <path d={`M${combate.campo.boca.x - 8} 62 Q${combate.campo.boca.x} 52 ${combate.campo.boca.x + 8} 62 Z`} fill="#050608" />
              <text x={combate.campo.boca.x} y={47.6} textAnchor="middle" fontSize={2.3} fill={C.faint}
                style={{ paintOrder: "stroke", stroke: "#1a1d17", strokeWidth: 0.8 }}>La cueva</text>
            </g>

            {piezas.map((pz) => {
              const enPie = presentes.has(pz.id);
              const cae = caidas.has(pz.id);
              const visible = enPie || cae;
              const nueva = enPie && !anterior.has(pz.id) && i > 0;
              return (
                <g key={pz.id} className="vg-t"
                  style={{
                    opacity: visible ? (cae ? 0.4 : 1) : 0,
                    transform: `translate(${pz.x}px, ${pz.y}px) scale(${visible ? 1 : 0.85})`,
                  }}>
                  <title>{pz.nombre}</title>
                  <Pieza pz={pz} />
                  {cae && (
                    <g stroke={C.text} strokeWidth={0.6} strokeLinecap="round">
                      <line x1={-pz.r * 0.6} y1={-pz.r * 0.6} x2={pz.r * 0.6} y2={pz.r * 0.6} />
                      <line x1={pz.r * 0.6} y1={-pz.r * 0.6} x2={-pz.r * 0.6} y2={pz.r * 0.6} />
                    </g>
                  )}
                  {pz.forma !== undefined && pz.forma !== "vortice" && !cae && (
                    <text y={pz.r + 3} textAnchor="middle" fontSize={2.2}
                      fill={nueva ? C.amber : C.muted}
                      style={{ paintOrder: "stroke", stroke: "#1a1d17", strokeWidth: 0.9 }}>
                      {pz.nombre}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <Medidor nombre="El grandote" valor={p.gigante} max={100} etiqueta={`${p.gigante} de 100`} color={C.enemigo} />
          <p style={textoPanel}>{p.afuera}</p>
        </Panel>
      </div>

      {/* Lo que cruza de un frente al otro */}
      <div style={{
        display: "grid",
        gridTemplateRows: p.enlace ? "1fr" : "0fr",
        opacity: p.enlace ? 1 : 0,
        marginTop: p.enlace ? 12 : 0,
        transition: instant ? "none" : `grid-template-rows 280ms ${EASE}, opacity 280ms ${EASE}, margin 280ms ${EASE}`,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
            background: C.amberSoft, borderRadius: R + 1, color: C.text, fontSize: 15,
          }}>
            <Link2 size={17} color={C.amber} style={{ flexShrink: 0 }} />
            <span>{p.enlace ?? pasos.slice(0, i).reverse().find((x) => x.enlace)?.enlace}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── La mina en corte ─────────────────────────────────────────────

function Mina({ recorrido, idx, carro, sinRueda }: {
  recorrido: VTramoRecorrido[]; idx: number; carro: number | null; sinRueda: boolean;
}) {
  const todo = curva(recorrido);
  const hecho = curva(recorrido.slice(0, idx + 1));
  const t = recorrido[idx];
  const visto = (id: string) => recorrido.findIndex((x) => x.id === id) <= idx;
  const en = (id: string) => recorrido.find((x) => x.id === id)!;
  const ancla = t.x > 78 ? "end" : t.x < 22 ? "start" : "middle";
  const lx = t.x > 78 ? t.x + 3 : t.x < 22 ? t.x - 3 : t.x;
  const etiquetaAbajo = t.y < 40;

  return (
    <svg viewBox="0 0 100 62" style={{ width: "100%", display: "block", borderRadius: R }}>
      <defs>
        <linearGradient id="vg-roca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1714" />
          <stop offset="100%" stopColor="#0d0b0a" />
        </linearGradient>
        <radialGradient id="vg-lava">
          <stop offset="0%" stopColor="#ffb347" stopOpacity={0.95} />
          <stop offset="45%" stopColor={C.lava} stopOpacity={0.7} />
          <stop offset="100%" stopColor={C.lava} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="vg-salida">
          <stop offset="0%" stopColor="#dfe9f2" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#8fb1cf" stopOpacity={0} />
        </radialGradient>
        <filter id="vg-brillo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* Roca y vetas */}
      <rect width="100" height="62" fill="url(#vg-roca)" />
      {[12, 21, 37, 46, 58].map((y, k) => (
        <path key={k} d={`M0 ${y} Q25 ${y + (k % 2 ? 2 : -2)} 50 ${y} T100 ${y + 1}`} fill="none" stroke="rgba(255,240,220,0.035)" strokeWidth={0.5} />
      ))}

      {/* La brecha volcánica: debajo del tramo, hierve */}
      <g>
        <ellipse className="vg-lava" cx={en("brecha").x} cy={en("brecha").y + 9} rx={13} ry={5.5} fill="url(#vg-lava)" />
        <path d={`M${en("brecha").x - 9} ${en("brecha").y + 9} Q${en("brecha").x} ${en("brecha").y + 6} ${en("brecha").x + 9} ${en("brecha").y + 9.5}`}
          fill="none" stroke="#ffcf73" strokeWidth={0.35} opacity={0.7} />
      </g>

      {/* La salida: luz de afuera */}
      <circle cx={en("salida").x + 6} cy={en("salida").y} r={9} fill="url(#vg-salida)" opacity={visto("salida") ? 1 : 0.35} className="vg-t" />

      {/* Galería cavada */}
      <path d={todo} fill="none" stroke="#050505" strokeWidth={7.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={todo} fill="none" stroke="#1f1b18" strokeWidth={5.6} strokeLinecap="round" strokeLinejoin="round" />
      {/* Antorchas encendidas por donde ya pasaron */}
      <path d={hecho} fill="none" stroke={C.amber} strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" filter="url(#vg-brillo)" className="vg-t" />
      {/* Durmientes y riel */}
      <path d={todo} fill="none" stroke="#4a3b2c" strokeWidth={2.4} strokeDasharray="0.45 1.1" />
      <path d={todo} fill="none" stroke="#5b5752" strokeWidth={0.45} />
      <path d={hecho} fill="none" stroke={C.amber} strokeWidth={0.7} className="vg-t" />

      {/* Lo que hay en cada estación */}
      <Puertas x={en("portones").x + 7} y={en("portones").y - 5.2} n={3} on={visto("portones")} />
      <Puertas x={en("desvio").x + 7} y={en("desvio").y - 5.2} n={5} on={visto("desvio")} />
      <Palancas x={en("palancas").x} y={en("palancas").y - 5.4} on={visto("palancas")} />
      <Espolones x={en("espolones").x} y={en("espolones").y} />
      {visto("rueda") && (
        <g transform={`translate(${en("rueda").x + 3.5} ${en("rueda").y + 5}) rotate(25)`}>
          <circle r={1.1} fill="none" stroke="#8c8781" strokeWidth={0.45} />
          <circle r={0.25} fill="#8c8781" />
        </g>
      )}
      <Pit x={en("pit").x} y={en("pit").y} on={visto("pit")} />
      <Estatuas x={en("salon").x} y={en("salon").y - 5.4} on={visto("salon")} />
      <Botonera x={en("botones").x} y={en("botones").y + 4.6} on={visto("botones")} />

      {recorrido.map((s, k) => (
        <circle key={s.id} cx={s.x} cy={s.y} r={k === idx ? 1.1 : 0.7}
          className="vg-t" fill={k <= idx ? C.amber : "#3a342e"}>
          <title>{s.nombre}</title>
        </circle>
      ))}

      {/* El carro */}
      <g className="vg-t" style={{ transform: `translate(${t.x}px, ${t.y}px)` }}>
        <Carro carro={carro} sinRueda={sinRueda} />
      </g>

      <g className="vg-t">
        <text x={lx} y={etiquetaAbajo ? t.y + 7 : t.y - 8.6} textAnchor={ancla} fontSize={2.7} fontWeight={600}
          fill={C.text} style={{ paintOrder: "stroke", stroke: "#0d0b0a", strokeWidth: 1.4 }}>
          {t.nombre}
        </text>
      </g>
    </svg>
  );
}

function Carro({ carro, sinRueda }: { carro: number | null; sinRueda: boolean }) {
  if (carro === null) {
    // Se estrelló contra el muro de resortes: chapa partida y una rueda suelta.
    return (
      <g transform="translate(0 -1.2)">
        <path d="M-3.6 -3 L-0.6 -3.6 L-1 -0.4 L-3.2 0 Z" fill="#6d665f" />
        <path d="M0.4 -4 L3.6 -2.6 L2.8 0.2 L0.2 -0.6 Z" fill="#6d665f" />
        <circle cx={-2.6} cy={1.4} r={0.8} fill="none" stroke="#a7a19a" strokeWidth={0.35} />
        <circle cx={3.4} cy={1.2} r={0.8} fill="none" stroke="#a7a19a" strokeWidth={0.35} />
        <path d="M-1 -4.6 l0.6 -1 M1.4 -5.2 l-0.3 -1.1 M3.6 -4.4 l0.8 -0.7" stroke={C.lava} strokeWidth={0.35} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`rotate(${sinRueda ? -9 : 0})`}>
      {/* chispas cuando va en tres ruedas */}
      {sinRueda && <path d="M-3.4 0.2 l-1.6 0.8 M-3.2 0.6 l-1.2 1.4 M-3.6 -0.2 l-1.8 -0.2" stroke="#ffd27a" strokeWidth={0.3} strokeLinecap="round" />}
      <path d="M-3.8 -4.6 L3.8 -4.6 L3.1 -1 L-3.1 -1 Z" fill="#7a7068" stroke="#a49a90" strokeWidth={0.3} />
      <path d="M-3.4 -3.4 H3.4" stroke="#5c534b" strokeWidth={0.3} />
      {/* cabezas: el elfo de pelo blanco y Jeremy */}
      <circle cx={-1.2} cy={-5.4} r={0.9} fill="#e8eef4" />
      <circle cx={1.3} cy={-5.2} r={0.8} fill="#9b7a55" />
      {!sinRueda && <circle cx={-2.1} cy={-0.4} r={0.85} fill="#141110" stroke="#c9c2b8" strokeWidth={0.35} />}
      <circle cx={2.1} cy={-0.4} r={0.85} fill="#141110" stroke="#c9c2b8" strokeWidth={0.35} />
    </g>
  );
}

function Puertas({ x, y, n, on }: { x: number; y: number; n: number; on: boolean }) {
  const w = 1.5, gap = 0.7, total = n * w + (n - 1) * gap;
  return (
    <g opacity={on ? 1 : 0.5} className="vg-t">
      {Array.from({ length: n }).map((_, k) => {
        const px = x - total / 2 + k * (w + gap);
        return <path key={k} d={`M${px} ${y + 2} V${y + 0.7} Q${px + w / 2} ${y - 0.4} ${px + w} ${y + 0.7} V${y + 2} Z`}
          fill="#050505" stroke={on ? "#8a6a42" : "#3a342e"} strokeWidth={0.3} />;
      })}
    </g>
  );
}

function Palancas({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g opacity={on ? 1 : 0.5} className="vg-t">
      {Array.from({ length: 6 }).map((_, k) => {
        const px = x - 4.4 + k * 1.75;
        const baja = on && k === 5;
        return (
          <g key={k}>
            <rect x={px - 0.35} y={y + 1.2} width={0.7} height={0.6} fill="#3a342e" />
            <line x1={px} y1={y + 1.3} x2={baja ? px + 1 : px - 0.3} y2={baja ? y + 0.6 : y - 0.4}
              stroke={baja ? C.amber : "#8c8781"} strokeWidth={0.32} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

function Espolones({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#3a342e">
      {[-6, -3, 0, 3, 6].map((dx, k) => (
        <g key={k}>
          <path d={`M${x + dx - 0.8} ${y - 2.9} L${x + dx} ${y - 1.2} L${x + dx + 0.8} ${y - 2.9} Z`} />
          <path d={`M${x + dx - 0.8 + 1.5} ${y + 2.9} L${x + dx + 1.5} ${y + 1.2} L${x + dx + 0.8 + 1.5} ${y + 2.9} Z`} />
        </g>
      ))}
    </g>
  );
}

function Pit({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g opacity={on ? 1 : 0.5} className="vg-t">
      <circle cx={x} cy={y} r={4.6} fill="#0a0908" stroke={on ? "#8a6a42" : "#3a342e"} strokeWidth={0.3} />
      {Array.from({ length: 12 }).map((_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <line key={k} x1={x + Math.cos(a) * 4.6} y1={y + Math.sin(a) * 4.6} x2={x + Math.cos(a) * 5.8} y2={y + Math.sin(a) * 5.8}
          stroke="#3a342e" strokeWidth={0.5} />;
      })}
      {/* el muro de resortes */}
      <path d={`M${x - 1.6} ${y - 1.8} q0.5 0.45 0 0.9 q-0.5 0.45 0 0.9 q0.5 0.45 0 0.9 q-0.5 0.45 0 0.9`} fill="none" stroke="#8c8781" strokeWidth={0.3} />
    </g>
  );
}

function Estatuas({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g opacity={on ? 1 : 0.5} className="vg-t" fill={on ? "#8a8070" : "#3a342e"}>
      {[-3.4, 0, 3.4].map((dx, k) => (
        <g key={k}>
          <circle cx={x + dx} cy={y - 0.6} r={0.55} />
          <path d={`M${x + dx - 0.9} ${y + 2} L${x + dx - 0.6} ${y} L${x + dx + 0.6} ${y} L${x + dx + 0.9} ${y + 2} Z`} />
        </g>
      ))}
    </g>
  );
}

function Botonera({ x, y, on }: { x: number; y: number; on: boolean }) {
  const colores = ["#9aa3ab", C.amber, "#d9572e", "#4f8fd1", C.vacio];
  return (
    <g opacity={on ? 1 : 0.5} className="vg-t">
      <rect x={x - 5} y={y - 1.4} width={10} height={2.8} rx={0.5} fill="#151311" stroke="#3a342e" strokeWidth={0.3} />
      {colores.map((c, k) => (
        <circle key={k} cx={x - 3.6 + k * 1.8} cy={y} r={0.6} fill={c}
          stroke={on && (k === 1 || k === 4) ? "#fff" : "none"} strokeWidth={0.25} />
      ))}
    </g>
  );
}

// ── Piezas del campo, como miniaturas sobre la peana ─────────────

function Pieza({ pz }: { pz: VPiezaCampo }) {
  if (pz.forma === "vortice") {
    return (
      <g>
        <circle r={pz.r} fill="url(#vg-vacio)" />
        <g className="vg-giro">
          <circle r={pz.r * 0.75} fill="none" stroke={C.vacio} strokeWidth={0.35} strokeDasharray="1.2 1" />
          <circle r={pz.r * 0.45} fill="none" stroke={C.vacio} strokeWidth={0.3} strokeDasharray="0.8 0.8" />
        </g>
      </g>
    );
  }
  if (pz.forma === "tropa") {
    const orco = pz.bando === "grupo";
    const w = pz.r * 2.3, h = pz.r * 1.45;
    const fig = orco ? C.orco : "#cfd3d6";
    return (
      <g>
        <rect x={-w / 2 + 0.3} y={-h / 2 + 0.5} width={w} height={h} rx={0.7} fill="rgba(0,0,0,0.45)" />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.7} fill="#0d0e10" stroke={orco ? C.orco : C.enemigo} strokeWidth={0.45} />
        {[-1, 0, 1].map((cx) => [-1, 1].map((cy) => (
          <g key={`${cx}${cy}`} transform={`translate(${cx * w * 0.28} ${cy * h * 0.22})`}>
            <circle r={0.75} fill={fig} />
            {orco ? <path d="M-0.4 -0.2 L-0.75 -0.75 M0.4 -0.2 L0.75 -0.75" stroke={fig} strokeWidth={0.25} />
              : <rect x={-0.35} y={-0.35} width={0.7} height={0.25} fill="#0d0e10" />}
          </g>
        )))}
      </g>
    );
  }
  if (pz.forma === "gigante" && pz.bando === "enemigo") {
    // El grandote: un esqueleto de hierro con aspas, frío violeta en el pecho.
    return (
      <g>
        <circle r={pz.r * 1.5} fill="url(#vg-aura)" />
        <circle r={pz.r} fill="#0d0e10" stroke={C.enemigo} strokeWidth={0.5} />
        {[-60, -30, 0, 30, 60].map((a) => (
          <path key={a} d={`M0 -1 L${Math.sin((a * Math.PI) / 180) * pz.r * 1.25} ${-Math.cos((a * Math.PI) / 180) * pz.r * 1.25}`}
            stroke="#8c8781" strokeWidth={0.5} strokeLinecap="round" />
        ))}
        <circle r={pz.r * 0.42} fill="#cfd3d6" />
        <circle cy={0.6} r={pz.r * 0.18} fill={C.vacio} />
        <circle cx={-0.7} cy={-0.8} r={0.35} fill={C.vacio} />
        <circle cx={0.7} cy={-0.8} r={0.35} fill={C.vacio} />
      </g>
    );
  }
  if (pz.forma === "gigante") {
    // El gólem goblin: piedra, raíces y chapa, un ojo ámbar.
    return (
      <g>
        <path d={`M${-pz.r} 0 L${-pz.r * 0.6} ${-pz.r * 0.85} L${pz.r * 0.3} ${-pz.r} L${pz.r} ${-pz.r * 0.3} L${pz.r * 0.8} ${pz.r * 0.7} L${-pz.r * 0.4} ${pz.r} Z`}
          fill="#4a4036" stroke="#8a6a42" strokeWidth={0.45} />
        <path d={`M${-pz.r * 0.7} ${pz.r * 0.3} q1.5 -1 2.6 0.4 M${pz.r * 0.1} ${pz.r * 0.7} q0.8 -1.6 2.2 -1.2`} fill="none" stroke="#6e5a3d" strokeWidth={0.35} />
        <circle r={pz.r * 0.32} fill="#ffb347" />
        <circle r={pz.r * 0.14} fill="#fff1c9" />
      </g>
    );
  }
  if (pz.forma === "artefacto" && pz.bando === "enemigo") {
    // El fantasma: una voluta violeta.
    return (
      <g>
        <circle r={pz.r * 1.6} fill="url(#vg-aura)" />
        <path d={`M0 ${-pz.r} C${pz.r} ${-pz.r} ${pz.r} ${pz.r * 0.4} ${pz.r * 0.5} ${pz.r} L0 ${pz.r * 0.6} L${-pz.r * 0.5} ${pz.r} C${-pz.r} ${pz.r * 0.4} ${-pz.r} ${-pz.r} 0 ${-pz.r} Z`}
          fill="#b8a9ee" fillOpacity={0.75} />
        <circle cx={-0.6} cy={-0.6} r={0.3} fill="#1a1d17" />
        <circle cx={0.6} cy={-0.6} r={0.3} fill="#1a1d17" />
      </g>
    );
  }
  if (pz.forma === "artefacto") {
    // Tirasobras: madera enrejada, raíces y metal, con su caño.
    const s = pz.r;
    return (
      <g>
        <path d={`M0 ${-s} L${s} 0 L0 ${s} L${-s} 0 Z`} fill="#3d2f22" stroke="#9a7448" strokeWidth={0.4} />
        <path d={`M${-s / 2} ${-s / 2} L${s / 2} ${s / 2} M${s / 2} ${-s / 2} L${-s / 2} ${s / 2}`} stroke="#9a7448" strokeWidth={0.3} />
        <line x1={0} y1={0} x2={s * 1.3} y2={s * 0.9} stroke="#8c8781" strokeWidth={0.6} strokeLinecap="round" />
      </g>
    );
  }
  // Personaje suelto: miniatura en peana redonda con su inicial.
  return (
    <g>
      <circle r={pz.r} cy={0.3} fill="rgba(0,0,0,0.5)" />
      <circle r={pz.r} fill="#0d0e10" stroke={C.steelStrong} strokeWidth={0.5} />
      <text y={0.95} textAnchor="middle" fontSize={2.6} fontWeight={700} fill={C.steelStrong}>{pz.nombre[0]}</text>
    </g>
  );
}

// ── Piezas de la interfaz ────────────────────────────────────────

const textoPanel: React.CSSProperties = { fontSize: 15, lineHeight: 1.6, color: C.muted, margin: "10px 0 0" };

function Panel({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.subtle, border: `1px solid ${C.borderSoft}`, borderRadius: R + 2, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.steelStrong, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
        <span style={{ color: C.amber, display: "inline-flex" }}>{icono}</span>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function Medidor({ nombre, valor, max, etiqueta, color }: {
  nombre: string; valor: number | null; max: number; etiqueta: string; color: string;
}) {
  const pct = valor === null ? 0 : Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.steel, marginBottom: 5 }}>
        <span>{nombre}</span>
        <span style={{ color: valor === null ? C.enemigo : C.steelStrong, fontVariantNumeric: "tabular-nums" }}>{etiqueta}</span>
      </div>
      <div style={{ height: 6, background: C.bgDeep, borderRadius: 3, overflow: "hidden" }}>
        <div className="vg-t" style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function BotonPaso({ onClick, disabled, label, primario, children }: {
  onClick: () => void; disabled: boolean; label: string; primario?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      className="vg-paso-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: 38, height: 38, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: R + 1, cursor: disabled ? "default" : "pointer", flexShrink: 0,
        border: primario ? "none" : `1px solid ${C.border}`,
        background: primario ? (disabled ? C.subtle : C.amber) : "transparent",
        color: primario ? (disabled ? C.faint : C.bg) : (disabled ? C.faint : C.steelStrong),
      }}
    >
      {children}
    </button>
  );
}
