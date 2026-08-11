"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALBATROS } from "@/data/albatros";
import { areaDe, colorTipo, NIVELES_ORDEN, nivelDe } from "@/lib/albatros";
import type { AlbatrosNivelId } from "@/types/albatros";
import Plano2D from "./Plano2D";
import { hayWebGL } from "@/lib/albatros-materiales";

// three toca WebGL, así que la escena solo se monta en el cliente.
const Escena3D = dynamic(() => import("./Escena3D"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#8b9199", fontSize: 13 }}>
      Cargando el Albatros…
    </div>
  ),
});

const C = {
  fondo: "#0b0f14",
  panel: "#10151c",
  borde: "rgba(201,156,90,0.22)",
  ambar: "#c99c5a",
  texto: "#e8dfd2",
  tenue: "#8b9199",
};

type Vista = "plano" | "3d";

export default function AlbatrosViewer() {
  const [vista, setVista] = useState<Vista>("plano");
  const [nivel, setNivel] = useState<AlbatrosNivelId>("bodega");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [etiquetas, setEtiquetas] = useState(false);
  const [mostrarCasco, setMostrarCasco] = useState(true);
  const [mostrarVelas, setMostrarVelas] = useState(true);
  const [visibles, setVisibles] = useState<Record<AlbatrosNivelId, boolean>>({
    alcazar: true, cubierta: true, entrepuente: true, bodega: true,
  });

  // En pantallas angostas el plano se dibuja con la proa hacia arriba: un barco
  // de 19 m de eslora en horizontal queda ilegible en un teléfono.
  // Sin WebGL no hay 3D posible: el visor se queda en el plano y lo avisa.
  const [webgl, setWebgl] = useState(true);
  useEffect(() => { setWebgl(hayWebGL()); }, []);

  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const aplicar = () => setVertical(mq.matches);
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  const sel = useMemo(() => {
    if (!seleccion) return null;
    const c = ALBATROS.compartimentos.find((x) => x.id === seleccion);
    if (c) {
      return {
        nombre: c.nombre,
        nivel: nivelDe(c.nivel).nombre,
        nota: c.nota,
        sesion: c.sesion,
        secreto: c.secreto,
        medidas: `${(c.x[1] - c.x[0]).toFixed(2)} × ${(c.z[1] - c.z[0]).toFixed(2)} m · ${areaDe(c).toFixed(1)} m²`,
        color: colorTipo(c.tipo),
      };
    }
    const p = ALBATROS.piezas.find((x) => x.id === seleccion);
    if (p) {
      return {
        nombre: p.nombre,
        nivel: nivelDe(p.nivel).nombre,
        nota: p.nota ?? "",
        sesion: p.sesion,
        secreto: false,
        medidas: `${p.tam[0].toFixed(2)} × ${p.tam[1].toFixed(2)} × ${p.tam[2].toFixed(2)} m`,
        color: C.ambar,
      };
    }
    return null;
  }, [seleccion]);

  const btn = (activo: boolean) => ({
    padding: "6px 13px",
    fontSize: 11.5,
    fontWeight: 600 as const,
    borderRadius: 4,
    cursor: "pointer",
    background: activo ? "rgba(201,156,90,0.9)" : "transparent",
    color: activo ? "#10151c" : C.tenue,
    border: `1px solid ${activo ? C.ambar : C.borde}`,
  });

  return (
    <div style={{ minHeight: "100dvh", background: C.fondo, color: C.texto, padding: "18px 20px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* cabecera */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 4 }}>
          <Link href="/vaegrant" style={{ fontSize: 11, color: C.tenue, textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ← Vaegrant
          </Link>
          <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>{ALBATROS.nombre}</h1>
          <span style={{ fontSize: 12, color: C.tenue }}>{ALBATROS.clase}</span>
        </div>
        <p style={{ fontSize: 12.5, color: C.tenue, margin: "0 0 14px" }}>
          {ALBATROS.eslora} m de eslora · {ALBATROS.manga} m de manga · {ALBATROS.puntal} m de puntal · calado {ALBATROS.calado} m.
          Plano y modelo salen del mismo spec, así que están siempre a la misma escala.
        </p>

        {/* controles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <button style={btn(vista === "plano")} onClick={() => setVista("plano")}>Plano 2D</button>
          <button
            style={{ ...btn(vista === "3d"), opacity: webgl ? 1 : 0.4, cursor: webgl ? "pointer" : "not-allowed" }}
            onClick={() => webgl && setVista("3d")}
            disabled={!webgl}
            title={webgl ? "Modelo navegable" : "Tu navegador no tiene WebGL disponible"}
          >Modelo 3D</button>

          <span style={{ width: 1, height: 20, background: C.borde, margin: "0 4px" }} />

          {vista === "plano" ? (
            NIVELES_ORDEN.map((id) => (
              <button key={id} style={btn(nivel === id)} onClick={() => { setNivel(id); setSeleccion(null); }}>
                {nivelDe(id).nombre}
              </button>
            ))
          ) : (
            NIVELES_ORDEN.map((id) => (
              <button
                key={id}
                style={btn(visibles[id])}
                onClick={() => setVisibles((v) => ({ ...v, [id]: !v[id] }))}
                title="Mostrar u ocultar este nivel para ver adentro"
              >
                {visibles[id] ? "◉" : "○"} {nivelDe(id).nombre}
              </button>
            ))
          )}

          {vista === "3d" && (
            <>
              <span style={{ width: 1, height: 20, background: C.borde, margin: "0 4px" }} />
              <button style={btn(mostrarCasco)} onClick={() => setMostrarCasco((v) => !v)} title="Apagalo para abrir el casco por la crujía y ver el interior">{mostrarCasco ? "◉" : "○"} Casco entero</button>
              <button style={btn(mostrarVelas)} onClick={() => setMostrarVelas((v) => !v)} title="Ocultar el velamen">{mostrarVelas ? "◉" : "○"} Velas</button>
            </>
          )}

          <span style={{ width: 1, height: 20, background: C.borde, margin: "0 4px" }} />
          <button style={btn(etiquetas)} onClick={() => setEtiquetas((e) => !e)} title={vista === "3d" ? "Mostrar todos los rótulos a la vez" : "Nombres y superficies sobre el plano"}>Etiquetas</button>
        </div>

        {/* lienzo + ficha */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 14, alignItems: "start" }} className="alb-grid">
          <div style={{ border: `1px solid ${C.borde}`, borderRadius: 6, overflow: "hidden", height: vertical ? "min(76dvh, 720px)" : "min(66dvh, 640px)", background: C.panel }}>
            {vista === "plano" || !webgl ? (
              <Plano2D nivel={nivel} seleccion={seleccion} onSeleccion={setSeleccion} etiquetas={etiquetas} vertical={vertical} />
            ) : (
              <Escena3D visibles={visibles} seleccion={seleccion} onSeleccion={setSeleccion} etiquetas={etiquetas} mostrarCasco={mostrarCasco} mostrarVelas={mostrarVelas} />
            )}
          </div>

          <aside style={{ border: `1px solid ${C.borde}`, borderRadius: 6, padding: "14px 15px", background: C.panel, minHeight: 200 }}>
            {sel ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: sel.color, flexShrink: 0 }} />
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{sel.nombre}</h2>
                </div>
                <div style={{ fontSize: 10.5, color: C.ambar, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  {sel.nivel}
                  {sel.secreto ? " · oculto" : ""}
                  {sel.sesion ? ` · sesión ${sel.sesion}` : ""}
                </div>
                <div style={{ fontSize: 11.5, color: C.tenue, marginBottom: 10, fontVariantNumeric: "tabular-nums" }}>{sel.medidas}</div>
                {sel.nota && <p style={{ fontSize: 13, lineHeight: 1.65, color: "#c9bfae", margin: 0 }}>{sel.nota}</p>}
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
                  {vista === "plano" ? nivelDe(nivel).nombre : "El barco entero"}
                </h2>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: C.tenue, margin: "0 0 14px" }}>
                  {vista === "plano" ? nivelDe(nivel).nota : "El casco es un modelo real y trae su propio interior: forro, cuadernas y cubierta. Apagá Casco entero y se abre por la crujía, como una maqueta seccionada. Los rombos son los puntos de canon y se ven a través del casco; el violeta es la cámara secreta del motor. Con cámara libre podés meterte adentro. El reparto de compartimentos vive en el plano 2D."}
                </p>
                <div style={{ fontSize: 10.5, color: C.ambar, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  Del canon
                </div>
                {ALBATROS.notas.map((n, i) => (
                  <p key={i} style={{ fontSize: 12, lineHeight: 1.6, color: "#9aa1a9", margin: "0 0 9px" }}>{n}</p>
                ))}
              </>
            )}
          </aside>
        </div>
      </div>

        <p style={{ fontSize: 10.5, color: C.tenue, margin: "14px 0 0", opacity: 0.75 }}>
          Casco basado en <em>Dutch Ship Large 02</em> de Poly Haven (CC0). El reparto interno, las medidas y las notas son del canon de la campaña.
        </p>

      <style>{`@media (max-width: 900px){ .alb-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
