"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DiceDado } from "@/types/character";

interface Props {
  dado: DiceDado;
  spellName: string;
  onClose: () => void;
}

// ── Colors per damage type ──────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  fuerza:       { bg: "#FFF3E0", text: "#E65100", border: "#FFB74D", glow: "#FFB74D55" },
  necrótico:    { bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8", glow: "#CE93D855" },
  psíquico:     { bg: "#E8EAF6", text: "#1A237E", border: "#9FA8DA", glow: "#9FA8DA55" },
  bonificación: { bg: "#E8F5E9", text: "#1B5E20", border: "#A5D6A7", glow: "#A5D6A755" },
};
function col(tipo: string) {
  return TYPE_COLORS[tipo] ?? { bg: "#F5F5F5", text: "#333", border: "#ccc", glow: "#ccc33" };
}

function rollD(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

// ── Single die face graphic ─────────────────────────────────────
function DieFace({ value, faces, color }: { value: number; faces: number; color: ReturnType<typeof col> }) {
  return (
    <motion.div
      key={value + Math.random()} // force re-mount for animation
      initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        background: color.bg,
        border: `2px solid ${color.border}`,
        color: color.text,
        fontWeight: 800,
        fontSize: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 14px ${color.glow}`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {value}
      <span style={{
        position: "absolute", bottom: 2, right: 5,
        fontSize: 8, fontWeight: 500, color: color.text, opacity: 0.55,
      }}>
        d{faces}
      </span>
    </motion.div>
  );
}

// ── Main modal ──────────────────────────────────────────────────
export default function SpellDiceRoller({ dado, spellName, onClose }: Props) {
  const [mode, setMode] = useState<"digital" | "manual">("digital");
  const [variante, setVariante] = useState<"normal" | "herido">("normal");

  // Digital roll state
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  // Manual mode state — one input per die
  const useHerido = !!dado.variante && variante === "herido";
  const cantidad = useHerido ? dado.variante!.cantidad : dado.cantidad;
  const caras    = useHerido ? dado.variante!.caras    : dado.caras;
  const mod      = dado.modificador ?? 0;

  const [manualVals, setManualVals] = useState<string[]>(() => Array(cantidad).fill(""));
  const [resolved, setResolved]     = useState<number | null>(null);

  // Reset inputs when variant or cantidad changes
  useEffect(() => {
    setManualVals(Array(cantidad).fill(""));
    setResolved(null);
    setRolls([]);
  }, [cantidad, variante]);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  const colors = col(dado.tipo);

  // ── Digital roll ──────────────────────────────────────────────
  function tirar() {
    if (rolling) return;
    setRolling(true);
    setRolls([]);
    // Animate pseudo-flicker before landing
    let tick = 0;
    const interval = setInterval(() => {
      setRolls(Array.from({ length: cantidad }, () => rollD(caras)));
      tick++;
      if (tick >= 6) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 80);
  }

  const digitalTotal = rolls.length > 0
    ? rolls.reduce((a, b) => a + b, 0) + mod
    : null;

  // ── Manual resolve ────────────────────────────────────────────
  function resolver() {
    const parsed = manualVals.map((v) => parseInt(v, 10));
    if (parsed.some(isNaN)) return;
    setResolved(parsed.reduce((a, b) => a + b, 0) + mod);
  }

  const manualAllFilled = manualVals.every((v) => v.trim() !== "" && !isNaN(parseInt(v)));

  // ── Formula label ─────────────────────────────────────────────
  const diceLabel = `${cantidad}d${caras}${mod ? ` + ${mod}` : ""}`;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(10,8,30,0.55)",
          backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}
      >
        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--bg-card)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 460,
            boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* ── Header ─────────────────────────────── */}
          <div style={{
            background: "#1a1830",
            padding: "18px 22px 16px",
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 10, color: "#AFA9EC", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                Usar hechizo
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                {spellName}
              </h2>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {/* Dice formula badge */}
                <span style={{
                  fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                  background: colors.bg, color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8, padding: "2px 10px",
                }}>
                  🎲 {diceLabel}
                </span>
                <span style={{
                  fontSize: 11, color: "#AFA9EC",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 6, padding: "2px 8px", border: "1px solid rgba(255,255,255,0.12)",
                }}>
                  {dado.tipo}
                </span>
                {dado.salvacion && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#C8C5F6",
                    background: "rgba(127,119,221,0.2)",
                    borderRadius: 6, padding: "2px 8px", border: "1px solid rgba(127,119,221,0.35)",
                  }}>
                    {dado.salvacion}
                  </span>
                )}
                {dado.ataque && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#90CAF9",
                    background: "rgba(21,101,192,0.2)",
                    borderRadius: 6, padding: "2px 8px", border: "1px solid rgba(21,101,192,0.35)",
                  }}>
                    Ataque +8
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginLeft: 12,
              }}
            >×</button>
          </div>

          <div style={{ padding: "18px 22px 22px" }}>

            {/* ── Variant selector (Toll the Dead) ─── */}
            {dado.variante && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { val: "normal" as const,  label: "1d8 · Sano",         icon: "❤️" },
                  { val: "herido" as const,  label: "1d12 · Ya herido",   icon: "⚡" },
                ].map(({ val, label, icon }) => (
                  <button
                    key={val}
                    onClick={() => setVariante(val)}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                      fontWeight: variante === val ? 700 : 400, fontSize: 12,
                      background: variante === val ? colors.bg : "var(--bg-subtle)",
                      border: `1.5px solid ${variante === val ? colors.border : "var(--border)"}`,
                      color: variante === val ? colors.text : "var(--text-muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Mode selector ────────────────────── */}
            <div style={{
              display: "flex", background: "var(--bg-subtle)", borderRadius: 12, padding: 4, marginBottom: 20, gap: 4,
            }}>
              {([
                { id: "digital" as const, label: "🎲 Tirar dado", sub: "lanza digitalmente" },
                { id: "manual"  as const, label: "✋ Poner número", sub: "tiré físicamente" },
              ] as const).map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setRolls([]); setResolved(null); }}
                  style={{
                    flex: 1, padding: "9px 8px", borderRadius: 9, cursor: "pointer",
                    background: mode === id ? "#fff" : "transparent",
                    border: "none",
                    boxShadow: mode === id ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.18s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: mode === id ? 700 : 500, color: mode === id ? "var(--text-main)" : "var(--text-faint)" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 10, color: mode === id ? "var(--text-muted)" : "var(--text-faint)", marginTop: 1 }}>{sub}</div>
                </button>
              ))}
            </div>

            {/* ══ DIGITAL MODE ══════════════════════ */}
            {mode === "digital" && (
              <div>
                {/* Roll button */}
                <motion.button
                  onClick={tirar}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 12,
                    background: "#1a1830", color: "#fff", border: "none",
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                    letterSpacing: "0.02em", marginBottom: 18,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🎲</span>
                  {rolls.length === 0 ? "Tirar" : "Volver a tirar"}
                </motion.button>

                {/* Dice faces */}
                <AnimatePresence mode="wait">
                  {rolls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Individual dice */}
                      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
                        {rolls.map((r, i) => (
                          <DieFace key={i} value={r} faces={caras} color={colors} />
                        ))}
                      </div>

                      {/* Result breakdown */}
                      <ResultPanel
                        rolls={rolls}
                        mod={mod}
                        total={digitalTotal!}
                        colors={colors}
                        tipo={dado.tipo}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ══ MANUAL MODE ═══════════════════════ */}
            {mode === "manual" && (
              <div>
                <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 12 }}>
                  Ingresá el resultado de {cantidad > 1 ? `cada uno de tus ${cantidad} dados (d${caras})` : `tu dado (d${caras})`}:
                </p>

                {/* Per-die inputs */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  {manualVals.map((v, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Dado {cantidad > 1 ? i + 1 : ""}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={caras}
                        value={v}
                        onChange={(e) => {
                          const next = [...manualVals];
                          next[i] = e.target.value;
                          setManualVals(next);
                          setResolved(null);
                        }}
                        placeholder={`1–${caras}`}
                        style={{
                          width: 64, height: 52, textAlign: "center",
                          fontSize: 22, fontWeight: 700,
                          borderRadius: 10, border: `2px solid ${v ? colors.border : "var(--border)"}`,
                          background: v ? colors.bg : "var(--bg-subtle)",
                          color: v ? colors.text : "var(--text-faint)",
                          outline: "none",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = colors.border; }}
                        onBlur={(e)  => { if (!e.target.value) e.target.style.borderColor = "var(--border)"; }}
                      />
                      <span style={{ fontSize: 9, color: "var(--text-faint)" }}>d{caras}</span>
                    </div>
                  ))}

                  {/* Modifier display */}
                  {mod !== 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Mod.
                      </label>
                      <div style={{
                        width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "var(--accent-bg)", borderRadius: 10, border: "2px solid var(--accent-border)",
                        fontSize: 18, fontWeight: 800, color: "var(--accent-strong)",
                      }}>
                        +{mod}
                      </div>
                      <span style={{ fontSize: 9, color: "var(--text-faint)" }}>Carisma</span>
                    </div>
                  )}
                </div>

                {/* Resolve button */}
                <motion.button
                  onClick={resolver}
                  whileHover={manualAllFilled ? { scale: 1.03 } : {}}
                  whileTap={manualAllFilled ? { scale: 0.97 } : {}}
                  disabled={!manualAllFilled}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 12,
                    background: manualAllFilled ? "#1a1830" : "var(--bg-subtle)",
                    color: manualAllFilled ? "#fff" : "var(--text-faint)",
                    border: "none", fontSize: 15, fontWeight: 700,
                    cursor: manualAllFilled ? "pointer" : "not-allowed",
                    marginBottom: 18, transition: "background 0.15s",
                  }}
                >
                  ✓ Resolver
                </motion.button>

                {/* Result */}
                <AnimatePresence>
                  {resolved !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <ResultPanel
                        rolls={manualVals.map(Number)}
                        mod={mod}
                        total={resolved}
                        colors={colors}
                        tipo={dado.tipo}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Mechanical description ───────────── */}
            <div style={{
              background: "var(--bg-subtle)", borderRadius: 10, padding: "12px 14px",
              borderLeft: `3px solid ${colors.border}`, marginTop: 4,
            }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                {dado.descripcionMecanica}
              </p>
              {dado.notas && dado.notas.length > 0 && (
                <ul style={{ margin: "8px 0 0", paddingLeft: 14 }}>
                  {dado.notas.map((n, i) => (
                    <li key={i} style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2, lineHeight: 1.45 }}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Shared result display ───────────────────────────────────────
function ResultPanel({
  rolls, mod, total, colors, tipo,
}: {
  rolls: number[];
  mod: number;
  total: number;
  colors: { bg: string; text: string; border: string; glow: string };
  tipo: string;
}) {
  const sum = rolls.reduce((a, b) => a + b, 0);
  const partsStr = rolls.length === 1
    ? `${rolls[0]}`
    : `(${rolls.join(" + ")})`;
  const breakdown = mod !== 0
    ? `${partsStr} + ${mod} (Carisma)`
    : partsStr;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        textAlign: "center",
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: `0 0 20px ${colors.glow}`,
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 11, color: colors.text, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, opacity: 0.7 }}>
        Resultado
      </div>
      <div style={{ fontSize: 52, fontWeight: 900, color: colors.text, lineHeight: 1 }}>
        {total}
      </div>
      <div style={{ fontSize: 11, color: colors.text, opacity: 0.65, marginTop: 6, fontFamily: "monospace" }}>
        {breakdown} = {total} daño {tipo}
      </div>
    </motion.div>
  );
}
