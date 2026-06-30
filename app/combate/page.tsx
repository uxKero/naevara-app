"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import Link from "next/link";
import { CharacterData } from "@/types/character";
import { CharacterSummary } from "@/types/builder";
import {
  COMBAT, GRUPOS, CombatAction, Tirada, Dano,
  vitalesDesde, salvacionesDesde, totalEspacios, vidaMaxima,
} from "@/lib/combatData";
import CombatRoller from "@/components/CombatRoller";

const STORAGE_KEY = "naevara-combate-v1";

interface CombatState {
  hpActual: number;
  tempHp: number;
  slotsUsados: number;
  concentrando: string | null;
}

export default function CombatePage() {
  const [data, setData] = useState<CharacterData | null>(null);
  const [roller, setRoller] = useState<CombatAction | null>(null);
  const [state, setState] = useState<CombatState | null>(null);
  const [roster, setRoster] = useState<CharacterSummary[]>([]);
  const [tab, setTab] = useState<"combate" | "stats">("combate");

  // Cargar personaje
  useEffect(() => {
    fetch("/api/save").then((r) => r.json()).then(setData).catch(console.error);
    fetch("/api/characters").then((r) => r.json()).then((l) => Array.isArray(l) && setRoster(l)).catch(() => {});
  }, []);

  // Inicializar / cargar estado de combate (localStorage)
  useEffect(() => {
    if (!data || state) return;
    const max = vidaMaxima(data);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setState(JSON.parse(saved)); return; }
    } catch { /* ignore */ }
    setState({ hpActual: max, tempHp: 0, slotsUsados: 0, concentrando: null });
  }, [data, state]);

  // Persistir
  useEffect(() => {
    if (state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ } }
  }, [state]);

  const patch = useCallback((p: Partial<CombatState>) => setState((s) => (s ? { ...s, ...p } : s)), []);

  if (!data || !state) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>Cargando hoja de combate…</div>;
  }

  const vitales = vitalesDesde(data);
  const salvaciones = salvacionesDesde(data);
  const total = totalEspacios(data);
  const hpMax = vidaMaxima(data);
  const disponibles = Math.max(0, total - state.slotsUsados);

  // Al "lanzar" desde una tarjeta: descuenta espacio y/o toma concentración
  function lanzar(a: CombatAction) {
    setState((s) => {
      if (!s) return s;
      const next = { ...s };
      if (a.usaEspacio) next.slotsUsados = Math.min(total, s.slotsUsados + 1);
      if (a.concentracion) next.concentrando = a.nombre;
      return next;
    });
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      {/* ── Cabecera ───────────────────────────── */}
      <header style={{ background: "var(--hero-bg)", borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Link href="/" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>← Volver al perfil</Link>
            <h1 className="hero-name" style={{ fontSize: 26, fontWeight: 600, color: "#fff", margin: "4px 0 0" }}>
              Hoja de combate — Naevara
            </h1>
            <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "2px 0 0" }}>
              Brujo del Gran Antiguo · Nivel 5 · Todo lo que podés hacer, explicado y listo para tirar
            </p>
          </div>
        </div>
      </header>

      <main className="cmb-main" style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* ══ ROSTER DE PERSONAJES ══════════════════ */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4 }}>Personajes</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-strong)", background: "var(--accent-bg)", border: "1px solid var(--accent)", borderRadius: 20, padding: "5px 14px" }}>
            ★ Naevara
          </span>
          {roster.map((c) => (
            <Link key={c.id} href={`/combate/c/${c.id}`} style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 14px" }}>
              {c.name}{c.level ? ` · nv${c.level}` : ""}
            </Link>
          ))}
          <Link href="/combate/nueva" style={{ fontSize: 12, fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg,#7F77DD,#3C3489)", border: "1px solid var(--accent)", borderRadius: 20, padding: "5px 14px" }}>
            ＋ Nueva hoja
          </Link>
        </div>

        {/* ══ TRACKER DE COMBATE (pegajoso) ══════════ */}
        <section className="cmb-tracker" style={{ marginBottom: 22, paddingTop: 8 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent-border)", borderRadius: 16, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>

              {/* Vida */}
              <div style={{ flex: "1 1 200px", minWidth: 190 }}>
                <Etq>Vida</Etq>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stepper onClick={() => patch({ hpActual: Math.max(0, state.hpActual - 1) })}>−</Stepper>
                  <div style={{ textAlign: "center", minWidth: 78 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: state.hpActual <= hpMax * 0.25 ? "#EF5350" : "#fff", lineHeight: 1 }}>{state.hpActual}</span>
                    <span style={{ fontSize: 14, color: "var(--text-faint)" }}> / {hpMax}</span>
                    {state.tempHp > 0 && <span style={{ fontSize: 12, color: "#81D4FA", fontWeight: 700 }}> +{state.tempHp}</span>}
                  </div>
                  <Stepper onClick={() => patch({ hpActual: Math.min(hpMax, state.hpActual + 1) })}>+</Stepper>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginLeft: 4 }}>
                    <MiniBtn onClick={() => patch({ tempHp: state.tempHp + 15 })}>+15 temp ❄</MiniBtn>
                    {state.tempHp > 0 && <MiniBtn onClick={() => patch({ tempHp: 0 })}>quitar temp</MiniBtn>}
                  </div>
                </div>
              </div>

              {/* Espacios */}
              <div style={{ flex: "1 1 200px", minWidth: 190 }}>
                <Etq>Espacios de hechizo (3er nivel) — {disponibles} de {total}</Etq>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {Array.from({ length: total }).map((_, i) => {
                    const usado = i < state.slotsUsados;
                    return (
                      <button key={i} onClick={() => patch({ slotsUsados: usado ? i : i + 1 })}
                        title={usado ? "Recuperar este espacio" : "Marcar como gastado"}
                        style={{ width: 42, height: 42, borderRadius: 10, cursor: "pointer", fontSize: 18, border: `2px solid ${usado ? "var(--border)" : "var(--accent)"}`,
                          background: usado ? "transparent" : "var(--accent-bg)", color: usado ? "var(--text-faint)" : "var(--accent-strong)", transition: "all 0.15s" }}>
                        {usado ? "○" : "🔮"}
                      </button>
                    );
                  })}
                  <span style={{ fontSize: 10, color: "var(--text-faint)", maxWidth: 130, lineHeight: 1.3 }}>
                    Tocá un espacio para gastarlo o recuperarlo. Los trucos son ilimitados.
                  </span>
                </div>
              </div>

              {/* Concentración */}
              <div style={{ flex: "1 1 160px", minWidth: 150 }}>
                <Etq>Concentración</Etq>
                {state.concentrando ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", background: "rgba(216,192,138,0.12)", border: "1px solid rgba(216,192,138,0.35)", borderRadius: 8, padding: "5px 10px" }}>
                      ◈ {state.concentrando}
                    </span>
                    <MiniBtn onClick={() => patch({ concentrando: null })}>soltar</MiniBtn>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Ninguna activa</span>
                )}
              </div>

              {/* Descansos */}
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <button onClick={() => patch({ slotsUsados: 0, concentrando: null })}
                  style={{ padding: "8px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent)", color: "#fff" }}>
                  ☕ Descanso corto
                </button>
                <button onClick={() => patch({ hpActual: hpMax, tempHp: 0, slotsUsados: 0, concentrando: null })}
                  style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid var(--border)", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: "var(--text-muted)" }}>
                  🌙 Descanso largo / reset
                </button>
              </div>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-faint)", margin: "10px 0 0", lineHeight: 1.4 }}>
              <strong style={{ color: "var(--accent-strong)" }}>Descanso corto</strong> (1 h): recuperás los espacios y soltás la concentración — listo para el próximo combate. <strong style={{ color: "var(--accent-strong)" }}>Descanso largo</strong>: además recuperás toda la vida.
            </p>
          </div>
        </section>

        {/* ══ TABS INTERNOS ════════════════════════ */}
        <div className="cmb-tabs" style={{ display: "flex", gap: 6, margin: "0 0 18px", borderBottom: "1px solid var(--border)" }}>
          {([["combate", "⚔ Combate"], ["stats", "📊 Mis números"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "9px 16px", fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: "pointer",
              background: "transparent", border: "none", color: tab === id ? "var(--accent-strong)" : "var(--text-muted)",
              borderBottom: `2px solid ${tab === id ? "var(--accent)" : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap",
            }}>{label}</button>
          ))}
        </div>

        {tab === "stats" && (<>
        {/* ══ VITALES ══════════════════════════════ */}
        <SecTitulo>Tus números</SecTitulo>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 26 }}>
          {vitales.map((v) => (
            <div key={v.label} style={{ background: "var(--bg-card)", border: `1px solid ${v.principal ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{v.icono} {v.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: v.principal ? "var(--accent-strong)" : "#fff", lineHeight: 1.2, margin: "2px 0 3px" }}>{v.valor}</div>
              {v.nota && <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4 }}>{v.nota}</div>}
            </div>
          ))}
        </div>

        {/* ══ SALVACIONES ══════════════════════════ */}
        <SecTitulo>Tus salvaciones</SecTitulo>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
          Cuando un hechizo o efecto enemigo te obliga a <strong>salvarte</strong>, tirás <strong>1d20 + el número de abajo</strong> e intentás igualar o superar la CD que diga el enemigo. Carisma y Sabiduría son tus fuertes.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 28 }}>
          {salvaciones.map((s) => (
            <div key={s.stat} style={{ background: "var(--bg-card)", border: `1px solid ${s.competente ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-main)", fontWeight: s.competente ? 700 : 500 }}>{s.stat}</div>
                {s.competente && <div style={{ fontSize: 9, color: "var(--accent)" }}>● competente</div>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.competente ? "var(--accent-strong)" : "var(--text-muted)" }}>{s.valor}</div>
            </div>
          ))}
        </div>

        </>)}

        {tab === "combate" && (<>
        {/* ══ LEYENDA: cómo leer una tirada ════════ */}
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>Cómo leer cada habilidad</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 8 }}>
            <Leyenda color="#64B5F6" icono="🎯" titulo="Tirás vos (ataque)">1d20 + tu ataque vs la CA del enemigo. Igualá o superá = pegás.</Leyenda>
            <Leyenda color="#FFB74D" icono="🛡" titulo="Tira el enemigo (salvación)">Él tira 1d20 + su característica. Tiene que sacar tu CD (16) o más para resistir.</Leyenda>
            <Leyenda color="#A5D6A7" icono="✓" titulo="No se tira">El efecto pasa solo. A veces hay un dado de daño igual.</Leyenda>
            <Leyenda color="#CE93D8" icono="✦" titulo="Especial">Tiene una regla propia — está explicada en la tarjeta.</Leyenda>
          </div>
        </div>

        {/* ══ HABILIDADES POR GRUPO ════════════════ */}
        {GRUPOS.map((g) => {
          const items = COMBAT.filter((a) => a.grupo === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                <h2 className="sec-label" style={{ fontSize: 14, margin: 0 }}>{g.icono} {g.titulo}</h2>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{g.desc}</span>
              </div>
              <div className="arcane-divider" style={{ margin: "0 0 14px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {items.map((a) => (
                  <CombatCard key={a.id} action={a} onAbrir={() => setRoller(a)} onLanzar={() => lanzar(a)}
                    sinEspacios={a.usaEspacio ? disponibles <= 0 : false} />
                ))}
              </div>
            </section>
          );
        })}
        </>)}
      </main>

      {roller && <CombatRoller action={roller} onClose={() => setRoller(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Tarjeta de habilidad
// ════════════════════════════════════════════════════════════════
function CombatCard({ action, onAbrir, onLanzar, sinEspacios }: { action: CombatAction; onAbrir: () => void; onLanzar: () => void; sinEspacios: boolean }) {
  const rollable = action.tirada.tipo === "ataque" || (action.danos ?? []).some((d) => d.caras > 0 || d.flat !== undefined);
  const puedeLanzar = action.usaEspacio || action.concentracion;

  return (
    <div style={{ background: "var(--bg-card)", border: `1px solid ${action.destacado ? "var(--accent-border)" : "var(--border)"}`, borderRadius: 14, padding: "14px 15px", display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
      {/* Título + badges */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: action.destacado ? "var(--accent-strong)" : "#fff", margin: 0 }}>
            {action.destacado && "★ "}{action.nombre}
          </h3>
          {action.delBuild && <span title="No estaba en tu ficha; es del build. Confirmá con el Master." style={{ fontSize: 9, color: "var(--gold)", border: "1px solid rgba(216,192,138,0.4)", borderRadius: 6, padding: "1px 6px" }}>build</span>}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Badge>{action.accion}</Badge>
          <Badge>{action.coste}</Badge>
          {action.concentracion && <Badge color="var(--gold)">◈ concentración</Badge>}
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>{action.queHace}</p>

      {/* Resumen de tirada + daño */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <TiradaChip tirada={action.tirada} />
        {danoChip(action.danos) && <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 7, padding: "3px 9px", color: "var(--text-main)" }}>💥 {danoChip(action.danos)}</span>}
      </div>

      {action.cuando && <p style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5, margin: 0 }}><strong style={{ color: "var(--accent)" }}>Cuándo:</strong> {action.cuando}</p>}

      {/* Botones */}
      <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
        {rollable ? (
          <button onClick={onAbrir} style={{ flex: "1 1 auto", padding: "8px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#1a1830", color: "#fff" }}>
            🎲 Detalle y tirar
          </button>
        ) : (
          <button onClick={onAbrir} style={{ flex: "1 1 auto", padding: "8px 12px", borderRadius: 9, border: "1px solid var(--border)", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: "var(--text-muted)" }}>
            Ver detalle
          </button>
        )}
        {puedeLanzar && (
          <button onClick={onLanzar} disabled={sinEspacios}
            title={sinEspacios ? "Sin espacios — descansá" : "Marca el costo en el tracker"}
            style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid var(--accent-border)", cursor: sinEspacios ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700,
              background: sinEspacios ? "var(--bg-subtle)" : "var(--accent-bg)", color: sinEspacios ? "var(--text-faint)" : "var(--accent-strong)", opacity: sinEspacios ? 0.6 : 1 }}>
            {action.usaEspacio ? (action.concentracion ? "🔮◈ Lanzar" : "🔮 Lanzar") : "◈ Concentrar"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── piezas chicas ───────────────────────────────────────────────
function TiradaChip({ tirada }: { tirada: Tirada }) {
  let txt = "", color = "var(--text-faint)";
  if (tirada.tipo === "ataque")       { txt = `🎯 1d20+${tirada.bonus} vs CA`; color = "#64B5F6"; }
  else if (tirada.tipo === "salvacion") { txt = `🛡 Salva ${tirada.stat} CD ${tirada.cd}`; color = "#FFB74D"; }
  else if (tirada.tipo === "especial")  { txt = "✦ Caso especial"; color = "#CE93D8"; }
  else                                  { txt = "✓ Sin tirada"; color = "#A5D6A7"; }
  return <span style={{ fontSize: 11, fontWeight: 700, border: `1px solid ${color}55`, color, borderRadius: 7, padding: "3px 9px", background: `${color}14` }}>{txt}</span>;
}

function danoChip(danos?: Dano[]): string | null {
  if (!danos || !danos.length) return null;
  return danos.map((d) => {
    if (d.flat !== undefined) return `${d.flat} ${d.tipo}`;
    const base = `${d.cantidad}d${d.caras}${d.modificador ? `+${d.modificador}` : ""}`;
    const v = d.variante ? `/${d.variante.cantidad}d${d.variante.caras}` : "";
    return `${base}${v} ${d.tipo}`;
  }).join(" · ");
}

function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return <span style={{ fontSize: 10, color: color ?? "var(--text-faint)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 7px" }}>{children}</span>;
}
function SecTitulo({ children }: { children: ReactNode }) {
  return <h2 className="sec-label" style={{ fontSize: 13, marginBottom: 10 }}>{children}</h2>;
}
function Etq({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{children}</div>;
}
function Stepper({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)", fontSize: 18, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>{children}</button>;
}
function MiniBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
}
function Leyenda({ color, icono, titulo, children }: { color: string; icono: string; titulo: string; children: ReactNode }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>{icono} {titulo}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}
