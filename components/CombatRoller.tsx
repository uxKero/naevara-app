"use client";
import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CombatAction, Dano } from "@/lib/combatData";

interface Props {
  action: CombatAction;
  onClose: () => void;
}

// ── Colores por tipo de daño ────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  fuerza:       { bg: "#FFF3E0", text: "#E65100", border: "#FFB74D", glow: "#FFB74D55" },
  necrótico:    { bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8", glow: "#CE93D855" },
  psíquico:     { bg: "#E8EAF6", text: "#1A237E", border: "#9FA8DA", glow: "#9FA8DA55" },
  bonificación: { bg: "#E8F5E9", text: "#1B5E20", border: "#A5D6A7", glow: "#A5D6A755" },
  frío:         { bg: "#E1F5FE", text: "#01579B", border: "#81D4FA", glow: "#81D4FA55" },
  ácido:        { bg: "#F1F8E9", text: "#33691E", border: "#C5E1A5", glow: "#C5E1A555" },
  cortante:     { bg: "#FBE9E7", text: "#BF360C", border: "#FFAB91", glow: "#FFAB9155" },
  contundente:  { bg: "#EFEBE9", text: "#4E342E", border: "#BCAAA4", glow: "#BCAAA455" },
};
const ATAQUE_COLOR = { bg: "#E3F2FD", text: "#0D47A1", border: "#64B5F6", glow: "#64B5F655" };
function col(tipo: string) {
  return TYPE_COLORS[tipo] ?? { bg: "#F5F5F5", text: "#333", border: "#ccc", glow: "#ccc33" };
}
function rollD(faces: number) { return Math.floor(Math.random() * faces) + 1; }

// ════════════════════════════════════════════════════════════════
//  Sección: tirada de ataque (1d20 + bono), uno por rayo
// ════════════════════════════════════════════════════════════════
function AtaqueSection({ bonus, rayos }: { bonus: number; rayos: number }) {
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  function tirar() {
    if (rolling) return;
    setRolling(true);
    let tick = 0;
    const iv = setInterval(() => {
      setRolls(Array.from({ length: rayos }, () => rollD(20)));
      if (++tick >= 6) { clearInterval(iv); setRolling(false); }
    }, 70);
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <SectionTitle icono="🎯" titulo={rayos > 1 ? `Tirá para pegar — ${rayos} ataques` : "Tirá para pegar"} hint={`1d20 + ${bonus} contra la CA del enemigo`} />
      <motion.button
        onClick={tirar} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        style={{ width: "100%", padding: 12, borderRadius: 12, background: ATAQUE_COLOR.text, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: rolls.length ? 12 : 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        🎲 {rolls.length === 0 ? "Tirar ataque" : "Volver a tirar"}
      </motion.button>

      <AnimatePresence>
        {rolls.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {rolls.map((nat, i) => {
              const total = nat + bonus;
              const crit = nat === 20;
              const pifia = nat === 1;
              const c = crit ? { bg: "#E8F5E9", text: "#1B5E20", border: "#66BB6A" }
                      : pifia ? { bg: "#FFEBEE", text: "#B71C1C", border: "#EF9A9A" }
                      : ATAQUE_COLOR;
              return (
                <motion.div key={i} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ flex: rayos > 1 ? "1 1 120px" : "1 1 100%", minWidth: 110, textAlign: "center", background: c.bg, border: `2px solid ${c.border}`, borderRadius: 12, padding: "10px 8px" }}>
                  {rayos > 1 && <div style={{ fontSize: 9, color: c.text, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Rayo {i + 1}</div>}
                  <div style={{ fontSize: 30, fontWeight: 900, color: c.text, lineHeight: 1.1 }}>{total}</div>
                  <div style={{ fontSize: 10, color: c.text, opacity: 0.7, fontFamily: "monospace" }}>{nat} + {bonus}</div>
                  {crit  && <div style={{ fontSize: 10, fontWeight: 800, color: c.text, marginTop: 2 }}>★ ¡CRÍTICO!</div>}
                  {pifia && <div style={{ fontSize: 10, fontWeight: 800, color: c.text, marginTop: 2 }}>✗ Pifia (20 nat = falla)</div>}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {rolls.length > 0 && (
        <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, textAlign: "center" }}>
          ¿El número iguala o supera la CA del enemigo? → pega. Si pegaste, tirá el daño abajo.
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Sección: tirada de daño (digital + manual)
// ════════════════════════════════════════════════════════════════
function DanoSection({ dano, instancias, etiquetaInstancia }: { dano: Dano; instancias: number; etiquetaInstancia?: string }) {
  const [variante, setVariante] = useState<"base" | "alt">("base");
  const [mode, setMode] = useState<"digital" | "manual">("digital");

  const usaAlt = !!dano.variante && variante === "alt";
  const cantidad = usaAlt ? dano.variante!.cantidad : dano.cantidad;
  const caras    = usaAlt ? dano.variante!.caras    : dano.caras;
  const mod      = dano.modificador ?? 0;
  const colors   = col(dano.tipo);

  // total de dados a tirar = cantidad por instancia × instancias
  const totalDados = cantidad * instancias;

  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [manual, setManual] = useState<string[]>(() => Array(totalDados).fill(""));
  const [manualOut, setManualOut] = useState<number | null>(null);

  useEffect(() => {
    setRolls([]); setManual(Array(totalDados).fill("")); setManualOut(null);
  }, [totalDados, variante]);

  // Daño fijo (sin dado)
  if (dano.flat !== undefined) {
    return (
      <div style={{ marginBottom: 16 }}>
        <SectionTitle icono="💥" titulo="Daño fijo" hint={dano.etiqueta} />
        <div style={{ textAlign: "center", background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1 }}>{dano.flat}</div>
          <div style={{ fontSize: 11, color: colors.text, opacity: 0.7 }}>de {dano.tipo} · automático, no se tira</div>
        </div>
      </div>
    );
  }

  function tirar() {
    if (rolling) return;
    setRolling(true);
    let tick = 0;
    const iv = setInterval(() => {
      setRolls(Array.from({ length: totalDados }, () => rollD(caras)));
      if (++tick >= 6) { clearInterval(iv); setRolling(false); }
    }, 70);
  }

  const modTotal = mod * instancias;
  const digitalTotal = rolls.length ? rolls.reduce((a, b) => a + b, 0) + modTotal : null;
  const manualFilled = manual.every((v) => v.trim() !== "" && !isNaN(parseInt(v)));
  function resolver() {
    if (!manualFilled) return;
    setManualOut(manual.map(Number).reduce((a, b) => a + b, 0) + modTotal);
  }

  const formula = `${totalDados}d${caras}${modTotal ? ` + ${modTotal}` : ""}`;

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle icono="💥" titulo="Tirá el daño" hint={dano.etiqueta ? `${formula} · ${dano.etiqueta}` : formula} />

      {/* Variante (Toll the Dead) */}
      {dano.variante && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {([["base", dano.variante.etiquetaBase, `${dano.cantidad}d${dano.caras}`], ["alt", dano.variante.etiqueta, `${dano.variante.cantidad}d${dano.variante.caras}`]] as const).map(([val, label, dice]) => (
            <button key={val} onClick={() => setVariante(val)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: variante === val ? 700 : 400,
                background: variante === val ? colors.bg : "var(--bg-subtle)", border: `1.5px solid ${variante === val ? colors.border : "var(--border)"}`, color: variante === val ? colors.text : "var(--text-muted)" }}>
              <div style={{ fontWeight: 700 }}>{dice}</div><div style={{ fontSize: 10, opacity: 0.85 }}>{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Modo */}
      <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: 10, padding: 3, marginBottom: 14, gap: 3 }}>
        {([["digital", "🎲 Tirar acá"], ["manual", "✋ Poner número"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => { setMode(id); setRolls([]); setManualOut(null); }}
            style={{ flex: 1, padding: "7px 6px", borderRadius: 8, cursor: "pointer", border: "none", fontSize: 12, fontWeight: mode === id ? 700 : 500,
              background: mode === id ? "#fff" : "transparent", color: mode === id ? "#1a1830" : "var(--text-faint)", boxShadow: mode === id ? "0 1px 5px rgba(0,0,0,0.12)" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      {mode === "digital" ? (
        <>
          <motion.button onClick={tirar} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: 11, borderRadius: 11, background: "#1a1830", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: rolls.length ? 12 : 0 }}>
            🎲 {rolls.length ? "Volver a tirar" : `Tirar ${formula}`}
          </motion.button>
          <AnimatePresence>
            {rolls.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  {rolls.map((r, i) => (
                    <motion.div key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.03 }}
                      style={{ width: 46, height: 46, borderRadius: 9, background: colors.bg, border: `2px solid ${colors.border}`, color: colors.text, fontWeight: 800, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px ${colors.glow}` }}>
                      {r}
                    </motion.div>
                  ))}
                </div>
                <ResultPanel total={digitalTotal!} breakdown={`(${rolls.join(" + ")})${modTotal ? ` + ${modTotal}${dano.modLabel ? ` (${dano.modLabel})` : ""}` : ""}`} tipo={dano.tipo} colors={colors} etiqueta={etiquetaInstancia} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 10 }}>Ingresá el resultado de cada dado (d{caras}):</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {manual.map((v, i) => (
              <input key={i} type="number" min={1} max={caras} value={v} placeholder={`1–${caras}`}
                onChange={(e) => { const n = [...manual]; n[i] = e.target.value; setManual(n); setManualOut(null); }}
                style={{ width: 56, height: 48, textAlign: "center", fontSize: 19, fontWeight: 700, borderRadius: 9,
                  border: `2px solid ${v ? colors.border : "var(--border)"}`, background: v ? colors.bg : "var(--bg-subtle)", color: v ? colors.text : "var(--text-faint)", outline: "none" }} />
            ))}
            {modTotal !== 0 && (
              <div style={{ width: 48, height: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--accent-bg)", borderRadius: 9, border: "2px solid var(--accent-border)" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-strong)" }}>+{modTotal}</span>
                {dano.modLabel && <span style={{ fontSize: 7, color: "var(--text-faint)" }}>{dano.modLabel}</span>}
              </div>
            )}
          </div>
          <motion.button onClick={resolver} disabled={!manualFilled} whileTap={manualFilled ? { scale: 0.97 } : {}}
            style={{ width: "100%", padding: 11, borderRadius: 11, background: manualFilled ? "#1a1830" : "var(--bg-subtle)", color: manualFilled ? "#fff" : "var(--text-faint)", border: "none", fontSize: 14, fontWeight: 700, cursor: manualFilled ? "pointer" : "not-allowed", marginBottom: manualOut !== null ? 12 : 0 }}>
            ✓ Resolver
          </motion.button>
          <AnimatePresence>
            {manualOut !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ResultPanel total={manualOut} breakdown={`(${manual.join(" + ")})${modTotal ? ` + ${modTotal}${dano.modLabel ? ` (${dano.modLabel})` : ""}` : ""}`} tipo={dano.tipo} colors={colors} etiqueta={etiquetaInstancia} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function ResultPanel({ total, breakdown, tipo, colors, etiqueta }: { total: number; breakdown: string; tipo: string; colors: ReturnType<typeof col>; etiqueta?: string }) {
  return (
    <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 24 }}
      style={{ textAlign: "center", background: colors.bg, border: `2px solid ${colors.border}`, borderRadius: 14, padding: "14px 18px", boxShadow: `0 0 18px ${colors.glow}` }}>
      <div style={{ fontSize: 10, color: colors.text, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7 }}>Daño total</div>
      <div style={{ fontSize: 46, fontWeight: 900, color: colors.text, lineHeight: 1 }}>{total}</div>
      <div style={{ fontSize: 11, color: colors.text, opacity: 0.7, marginTop: 4, fontFamily: "monospace" }}>{breakdown} = {total} de {tipo}</div>
      {etiqueta && <div style={{ fontSize: 10, color: colors.text, opacity: 0.6, marginTop: 3 }}>{etiqueta}</div>}
    </motion.div>
  );
}

function SectionTitle({ icono, titulo, hint }: { icono: string; titulo: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>{icono} {titulo}</div>
      {hint && <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "monospace", marginTop: 1 }}>{hint}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Modal principal
// ════════════════════════════════════════════════════════════════
export default function CombatRoller({ action, onClose }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  const t = action.tirada;
  const esAtaque = t.tipo === "ataque";
  const rayos = esAtaque ? (t.rayos ?? 1) : 1;
  const danosTirable = (action.danos ?? []).filter((d) => d.flat !== undefined || d.caras > 0);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,8,30,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflowY: "auto" }}>
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.96 }} transition={{ type: "spring", stiffness: 360, damping: 28 }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ background: "var(--bg-card)", borderRadius: 20, width: "100%", maxWidth: 480, margin: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "#1a1830", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 10, color: "#AFA9EC", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>{action.accion} · {action.coste}</p>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0 }}>{action.nombre}</h2>
              <p style={{ fontSize: 11, color: "#AFA9EC", margin: "3px 0 0" }}>Alcance: {action.alcance}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 18, flexShrink: 0, marginLeft: 12 }}>×</button>
          </div>

          <div style={{ padding: "18px 20px 22px" }}>
            {/* Qué hace */}
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>{action.queHace}</p>

            {/* Cómo se resuelve */}
            <TiradaBox action={action} />

            {/* Tirada de ataque */}
            {esAtaque && t.tipo === "ataque" && <AtaqueSection bonus={t.bonus} rayos={rayos} />}

            {/* Tiradas de daño */}
            {danosTirable.map((d, i) => {
              const inst = esAtaque && d.etiqueta?.includes("por rayo") ? rayos : 1;
              const etq = esAtaque && rayos > 1 && d.etiqueta?.includes("por rayo")
                ? `Incluye los ${rayos} rayos juntos`
                : undefined;
              return <DanoSection key={i} dano={d} instancias={inst} etiquetaInstancia={etq} />;
            })}

            {/* Notas finales */}
            {(action.cuando || action.ojo) && (
              <div style={{ marginTop: 4 }}>
                {action.cuando && (
                  <div style={{ background: "var(--bg-subtle)", borderRadius: 10, padding: "10px 12px", borderLeft: "3px solid var(--accent-border)", marginBottom: action.ojo ? 8 : 0 }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}><strong style={{ color: "var(--accent-strong)" }}>Cuándo: </strong>{action.cuando}</p>
                  </div>
                )}
                {action.ojo && (
                  <div style={{ background: "rgba(216,192,138,0.08)", borderRadius: 10, padding: "10px 12px", borderLeft: "3px solid var(--gold)" }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}><strong style={{ color: "var(--gold)" }}>Ojo: </strong>{action.ojo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Caja que explica QUÉ se tira para que funcione
function TiradaBox({ action }: { action: CombatAction }) {
  const t = action.tirada;
  let color = "#9990ad", icono = "•", titulo = "", cuerpo: ReactNode = null;

  if (t.tipo === "ataque") {
    color = "#64B5F6"; icono = "🎯"; titulo = "Tirás vos para pegar";
    cuerpo = <>1d20 + {t.bonus} contra la <strong>CA del enemigo</strong>. Si igualás o superás, pega.{t.nota ? ` ${t.nota}` : ""}</>;
  } else if (t.tipo === "salvacion") {
    color = "#FFB74D"; icono = "🛡"; titulo = "El enemigo tira para salvarse";
    cuerpo = <>Tira 1d20 + su <strong>{t.stat}</strong> y necesita sacar <strong>{t.cd} o más</strong>.<br />
      <span style={{ color: "#EF9A9A" }}>Si falla:</span> {t.fallo}<br />
      <span style={{ color: "#A5D6A7" }}>Si salva:</span> {t.exito}{t.nota ? <><br /><em style={{ opacity: 0.8 }}>{t.nota}</em></> : null}</>;
  } else if (t.tipo === "especial") {
    color = "#CE93D8"; icono = "✦"; titulo = "Caso especial";
    cuerpo = <>{t.texto}</>;
  } else {
    color = "#A5D6A7"; icono = "✓"; titulo = "No se tira para que funcione";
    cuerpo = <>{t.nota ?? "Pasa automáticamente."}</>;
  }

  return (
    <div style={{ background: "var(--bg-subtle)", borderRadius: 12, padding: "12px 14px", borderLeft: `4px solid ${color}`, marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>{icono} {titulo}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{cuerpo}</div>
      {action.concentracion && <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 6 }}>◈ Concentración{action.duracion ? ` · ${action.duracion}` : ""} — solo un hechizo de concentración a la vez.</div>}
    </div>
  );
}
