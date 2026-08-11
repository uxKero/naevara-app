"use client";

import { ALBATROS } from "@/data/albatros";
import { areaDe, colorTipo, contornoCasco, factorAltura, nivelDe } from "@/lib/albatros";
import type { AlbatrosNivelId } from "@/types/albatros";

interface Props {
  nivel: AlbatrosNivelId;
  seleccion: string | null;
  onSeleccion: (id: string | null) => void;
  etiquetas: boolean;
  /** En pantallas angostas el barco se dibuja con la proa hacia arriba. */
  vertical: boolean;
}

const AMBAR = "#c99c5a";
const TENUE = "rgba(201,156,90,0.28)";

/**
 * Plano tipo arquitectónico, en metros reales: el viewBox está en metros, así
 * que el dibujo es 1:1 con el spec y con el 3D.
 *
 * En vertical no se rota el SVG entero (eso dejaría todos los textos de
 * costado): se mapean las coordenadas de barco a coordenadas de lámina, y los
 * textos se dibujan derechos sobre las posiciones ya mapeadas.
 *
 *   horizontal → proa a la derecha: (x, z) ↦ (x, z)
 *   vertical   → proa arriba:       (x, z) ↦ (z, −x)
 */
export default function Plano2D({ nivel, seleccion, onSeleccion, etiquetas, vertical }: Props) {
  const n = nivelDe(nivel);
  const f = factorAltura(n.y);

  const P = (x: number, z: number): [number, number] => (vertical ? [z, -x] : [x, z]);
  const pts = (lista: [number, number][]) => lista.map(([x, z]) => P(x, z).map((v) => v.toFixed(2)).join(",")).join(" ");

  /** Rectángulo de barco a rectángulo de lámina, ya normalizado. */
  const R = (x: [number, number], z: [number, number]) => {
    const a = P(x[0], z[0]);
    const b = P(x[1], z[1]);
    return {
      x: Math.min(a[0], b[0]),
      y: Math.min(a[1], b[1]),
      w: Math.abs(b[0] - a[0]),
      h: Math.abs(b[1] - a[1]),
      cx: (a[0] + b[0]) / 2,
      cy: (a[1] + b[1]) / 2,
    };
  };

  const viewBox = vertical ? "-5.6 -11 11.2 22" : "-11 -5.2 22 10.4";
  const contorno = pts(contornoCasco(64).map(([x, z]) => [x, z * f] as [number, number]));
  const contornoRegala = pts(contornoCasco(64));

  const comps = ALBATROS.compartimentos.filter((c) => c.nivel === nivel);
  const piezas = ALBATROS.piezas.filter((p) => p.nivel === nivel);

  // Anclas de cotas y rótulos, distintas según orientación.
  const proa = P(9.9, 0);
  const popa = P(-10.0, 0);
  const escala = vertical ? "translate(-5.0, 9.4)" : "translate(-10.4, -4.6)";
  const cabecera = vertical ? P(0, 5.2) : P(0, 0);

  return (
    <svg
      viewBox={viewBox}
      style={{ width: "100%", height: "100%", display: "block", background: "#10151c" }}
      onClick={(e) => { if ((e.target as SVGElement).tagName === "svg") onSeleccion(null); }}
    >
      <defs>
        <pattern id="rejilla" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0 L0 0 0 1" fill="none" stroke="rgba(201,156,90,0.09)" strokeWidth="0.02" />
        </pattern>
        <pattern id="rayado" width="0.35" height="0.35" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.35" stroke="rgba(216,160,224,0.45)" strokeWidth="0.07" />
        </pattern>
      </defs>

      <rect x="-11" y="-11" width="22" height="22" fill="url(#rejilla)" />

      <polygon points={contornoRegala} fill="none" stroke={TENUE} strokeWidth="0.05" strokeDasharray="0.3 0.25" />
      <polygon points={contorno} fill="rgba(58,42,30,0.55)" stroke={AMBAR} strokeWidth="0.09" />

      {/* compartimentos */}
      {comps.map((c) => {
        const sel = seleccion === c.id;
        const r = R(c.x, c.z);
        const cabe = (vertical ? r.h : r.w) > 1.4;
        return (
          <g key={c.id} onClick={() => onSeleccion(c.id)} style={{ cursor: "pointer" }}>
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h}
              fill={sel ? "rgba(201,156,90,0.34)" : `${colorTipo(c.tipo)}55`}
              stroke={sel ? AMBAR : c.secreto ? "#d8a0e0" : "rgba(201,156,90,0.6)"}
              strokeWidth={sel ? 0.1 : 0.055}
              strokeDasharray={c.secreto ? "0.28 0.2" : undefined}
            />
            {c.secreto && <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="url(#rayado)" pointerEvents="none" />}
            {etiquetas && cabe && (
              <>
                <text x={r.cx} y={r.cy - 0.1} textAnchor="middle" fontSize="0.34" fontWeight={600}
                  fill={sel ? "#f3ead9" : "#d9cdb8"} pointerEvents="none">
                  {c.nombre}
                </text>
                <text x={r.cx} y={r.cy + 0.36} textAnchor="middle" fontSize="0.26"
                  fill="rgba(201,156,90,0.85)" pointerEvents="none">
                  {areaDe(c).toFixed(1)} m²
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* piezas */}
      {piezas.map((p) => {
        const sel = seleccion === p.id;
        const [lx, , lz] = p.tam;
        const largo = p.giro === 90 ? lz : lx;
        const ancho = p.giro === 90 ? lx : lz;
        const r = R([p.pos[0] - largo / 2, p.pos[0] + largo / 2], [p.pos[2] - ancho / 2, p.pos[2] + ancho / 2]);
        const c = P(p.pos[0], p.pos[2]);
        return (
          <g key={p.id} onClick={() => onSeleccion(p.id)} style={{ cursor: "pointer" }}>
            {p.tipo === "palo" ? (
              <circle cx={c[0]} cy={c[1]} r={lx / 2 + 0.06} fill="#2a1e14"
                stroke={sel ? AMBAR : "#8a6a45"} strokeWidth="0.07" />
            ) : (
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="0.08"
                fill={sel ? "rgba(201,156,90,0.55)" : "rgba(138,106,69,0.6)"}
                stroke={sel ? AMBAR : "rgba(201,156,90,0.5)"} strokeWidth="0.05" />
            )}
          </g>
        );
      })}

      {/* cotas */}
      {vertical ? (
        <g stroke={TENUE} strokeWidth="0.035" fill="none">
          <line x1="4.6" y1="-9.5" x2="4.6" y2="9.5" />
          <line x1="4.45" y1="-9.5" x2="4.75" y2="-9.5" />
          <line x1="4.45" y1="9.5" x2="4.75" y2="9.5" />
        </g>
      ) : (
        <g stroke={TENUE} strokeWidth="0.035" fill="none">
          <line x1="-9.5" y1="4.4" x2="9.5" y2="4.4" />
          <line x1="-9.5" y1="4.25" x2="-9.5" y2="4.55" />
          <line x1="9.5" y1="4.25" x2="9.5" y2="4.55" />
          <line x1="-10.3" y1="-2.8" x2="-10.3" y2="2.8" />
          <line x1="-10.45" y1="-2.8" x2="-10.15" y2="-2.8" />
          <line x1="-10.45" y1="2.8" x2="-10.15" y2="2.8" />
        </g>
      )}

      {vertical ? (
        <text x="4.35" y="0" textAnchor="middle" fontSize="0.32" fill="rgba(201,156,90,0.9)"
          transform="rotate(-90 4.35 0)">eslora {ALBATROS.eslora} m</text>
      ) : (
        <>
          <text x="0" y="4.15" textAnchor="middle" fontSize="0.3" fill="rgba(201,156,90,0.9)">
            eslora {ALBATROS.eslora} m
          </text>
          <text x="-10.55" y="0" textAnchor="middle" fontSize="0.3" fill="rgba(201,156,90,0.9)"
            transform="rotate(-90 -10.55 0)">manga {ALBATROS.manga} m</text>
        </>
      )}

      {/* proa / popa, siempre derechos */}
      <text x={proa[0]} y={proa[1] + (vertical ? -0.35 : 0.12)} textAnchor="middle" fontSize="0.4" fontWeight={700}
        fill={AMBAR} transform={vertical ? undefined : `rotate(-90 ${proa[0]} ${proa[1]})`}>PROA</text>
      <text x={popa[0]} y={popa[1] + (vertical ? 0.6 : 0.12)} textAnchor="middle" fontSize="0.4" fontWeight={700}
        fill="rgba(201,156,90,0.55)" transform={vertical ? undefined : `rotate(-90 ${popa[0]} ${popa[1]})`}>POPA</text>

      {/* barra de escala */}
      <g transform={escala}>
        <line x1="0" y1="0" x2="5" y2="0" stroke={AMBAR} strokeWidth="0.07" />
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <line key={m} x1={m} y1="-0.12" x2={m} y2="0.12" stroke={AMBAR} strokeWidth="0.05" />
        ))}
        <text x="0" y="-0.28" fontSize="0.28" fill={AMBAR}>0</text>
        <text x="5" y="-0.28" fontSize="0.28" fill={AMBAR} textAnchor="middle">5 m</text>
      </g>

      {/* cabecera del nivel */}
      <text x={vertical ? 0 : 10.6} y={vertical ? -10.3 : -4.6} textAnchor={vertical ? "middle" : "end"}
        fontSize="0.42" fontWeight={600} fill="#d9cdb8">{n.nombre}</text>
      <text x={vertical ? 0 : 10.6} y={vertical ? -9.75 : -4.15} textAnchor={vertical ? "middle" : "end"}
        fontSize="0.3" fill="rgba(201,156,90,0.8)">
        cota {n.y > 0 ? "+" : ""}{n.y.toFixed(2)} m · puntal {n.puntal.toFixed(2)} m
      </text>
      <text x={cabecera[0]} y={cabecera[1]} fontSize="0" fill="none">.</text>
    </svg>
  );
}
