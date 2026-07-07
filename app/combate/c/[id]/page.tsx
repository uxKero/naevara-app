"use client";

import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BuilderCharacter } from "@/types/builder";
import {
  loadAll, SrdClass, SrdRace, SrdSpell, SrdBackground, SrdWeapon, SrdArmor, SrdDeity,
  computeDerived, levelData, spellToAction, weaponToAction, fmtMod, ABILITY_ES, ABILITY_ORDER, ABILITY_DESC,
  ALL_SKILLS, skillTotal, skillAbility, skillES, skillDesc,
} from "@/lib/srd";
import { computeEffects, buildRiders, buildSubclassActions } from "@/lib/features";
import { claseES, razaES, featureES, rasgoES, rasgoDescES } from "@/lib/traducciones";
import { CombatAction, GRUPOS } from "@/lib/combatData";
import CombatRoller from "@/components/CombatRoller";

interface TrackerState {
  hpActual: number; tempHp: number;
  slotsUsados: Record<string, number>;
  concentrando: string | null;
}

export default function CharacterCombatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ch, setCh] = useState<BuilderCharacter | null>(null);
  const [srd, setSrd] = useState<{ spells: SrdSpell[]; classes: SrdClass[]; races: SrdRace[]; backgrounds: SrdBackground[]; weapons: SrdWeapon[]; armor: SrdArmor[]; deities: SrdDeity[] } | null>(null);
  const [roller, setRoller] = useState<CombatAction | null>(null);
  const [tr, setTr] = useState<TrackerState | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"combate" | "stats" | "ref">("combate");

  useEffect(() => {
    fetch(`/api/characters/${id}`).then((r) => r.json()).then((d) => {
      if (d?.error) setErr(d.error); else setCh(d);
    }).catch((e) => setErr(String(e)));
    loadAll().then(setSrd).catch((e) => setErr(String(e)));
  }, [id]);

  const cls = useMemo(() => srd?.classes.find((c) => c.index === ch?.classIndex) ?? null, [srd, ch]);
  const race = useMemo(() => srd?.races.find((r) => r.index === ch?.raceIndex) ?? null, [srd, ch]);
  const armorObj = useMemo(() => srd?.armor.find((a) => a.index === ch?.armorIndex) ?? null, [srd, ch]);
  const effects = useMemo(() => (ch && cls ? computeEffects({ clsIndex: cls.index, level: ch.level, hasArmor: !!ch.armorIndex, fightingStyle: ch.fightingStyle, invocations: ch.invocations }) : null), [ch, cls]);
  const derived = useMemo(() => (ch && cls ? computeDerived(ch, cls, race, { armor: armorObj, shield: ch.shield, acBonus: effects?.acBonus ?? 0 }) : null), [ch, cls, race, armorObj, effects]);

  const STORAGE = `naevara-combate-c-${id}`;
  useEffect(() => {
    if (!ch || !derived || tr) return;
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) { setTr(JSON.parse(saved)); return; }
    } catch { /* */ }
    setTr({ hpActual: derived.maxHp, tempHp: 0, slotsUsados: {}, concentrando: null });
  }, [ch, derived, tr, STORAGE]);
  useEffect(() => { if (tr) try { localStorage.setItem(STORAGE, JSON.stringify(tr)); } catch { /* */ } }, [tr, STORAGE]);
  const patch = useCallback((p: Partial<TrackerState>) => setTr((s) => (s ? { ...s, ...p } : s)), []);

  // ── Acciones (hechizos + armas reales + riders) ──
  const actions = useMemo(() => {
    if (!ch || !srd || !derived || !cls || !effects) return [];
    const spellIdx = new Map(srd.spells.map((s) => [s.index, s]));
    const wpnIdx = new Map(srd.weapons.map((w) => [w.index, w]));
    const list: CombatAction[] = [];

    [...ch.cantrips, ...ch.spells].forEach((idx) => {
      const sp = spellIdx.get(idx);
      if (sp) list.push(spellToAction(sp, derived, ch.level, effects.ebAgonizing));
    });

    const wEff = { rangedAttackBonus: effects.rangedAttackBonus, meleeAttackBonus: effects.meleeAttackBonus, oneHandedMeleeDmgBonus: effects.oneHandedMeleeDmgBonus, extraAttacks: effects.extraAttacks };
    (ch.weapons ?? []).forEach((idx) => {
      const w = wpnIdx.get(idx);
      if (w) list.push(weaponToAction(w, cls, derived, wEff));
    });
    // si no equipó armas, dejamos un ataque genérico mínimo
    if (!(ch.weapons ?? []).length) {
      const meleeMod = Math.max(derived.abilityMods.str, derived.abilityMods.dex);
      list.push({
        id: "arma-cuerpo", nombre: "Ataque con arma (genérico)", grupo: "armas", coste: "Arma", accion: "Acción",
        alcance: "Cuerpo a cuerpo", delBuild: true,
        queHace: "No equipaste armas. Este es un ataque genérico — agregá tus armas reales editando la hoja.",
        tirada: { tipo: "ataque", bonus: derived.prof + meleeMod, rayos: 1 + effects.extraAttacks, nota: `1d20 + ${derived.prof + meleeMod} contra la CA del enemigo.` },
        danos: [{ cantidad: 1, caras: 8, modificador: meleeMod || undefined, tipo: "cortante", modLabel: "característica" }],
      });
    }

    buildRiders(cls.index, ch.level, derived.abilityMods).forEach((r) => list.push(r));
    buildSubclassActions(cls.index, ch.subclassName, ch.level, derived.spellSaveDC, derived.abilityMods).forEach((r) => list.push(r));
    return list;
  }, [ch, srd, derived, cls, effects]);

  // niveles de espacio disponibles
  const slotLevels = useMemo(() => (derived ? Object.entries(derived.slots).filter(([, n]) => n > 0).map(([l]) => Number(l)).sort((a, b) => a - b) : []), [derived]);

  function lanzar(a: CombatAction, slotLvl: number) {
    setTr((s) => {
      if (!s) return s;
      const next: TrackerState = { ...s, slotsUsados: { ...s.slotsUsados } };
      if (a.usaEspacio) next.slotsUsados[slotLvl] = Math.min(derived?.slots[slotLvl] ?? 0, (s.slotsUsados[slotLvl] ?? 0) + 1);
      if (a.concentracion) next.concentrando = a.nombre;
      return next;
    });
  }

  if (err) return <Centro><p>⚠ {err}</p><Link href="/combate" style={lnk}>← Volver</Link></Centro>;
  if (!ch || !srd || !derived || !tr) return <Centro>Cargando hoja…</Centro>;

  const featuresHasta = (() => {
    const out: { lvl: number; name: string }[] = [];
    if (!cls) return out;
    for (let L = 1; L <= ch.level; L++) {
      const ld = levelData(cls, L);
      ld?.features.forEach((f) => out.push({ lvl: L, name: f }));
    }
    return out;
  })();

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      {/* Cabecera */}
      <header style={{ background: "var(--hero-bg)", borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 1.25rem", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Link href="/combate" style={lnk}>← Personajes</Link>
            <h1 className="hero-name" style={{ fontSize: 26, fontWeight: 600, color: "#fff", margin: "4px 0 0" }}>{ch.name}</h1>
            <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "2px 0 0" }}>
              {cls ? claseES(cls.name) : ""}{ch.subclassName ? ` (${ch.subclassName})` : ""} nivel {ch.level} · {race ? razaES(race.name) : ch.customRace ?? "—"}
              {ch.alignment ? ` · ${ch.alignment}` : ""}{ch.deity ? ` · ⛪ ${ch.deity}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Link href={`/combate/nueva?id=${id}`} style={{ ...btnGhost, color: "var(--accent-strong)", borderColor: "var(--accent-border)", textDecoration: "none" }}>✎ Editar</Link>
            <button onClick={async () => {
              if (!confirm(`¿Borrar la hoja de ${ch.name}? No se puede deshacer.`)) return;
              await fetch(`/api/characters/${id}`, { method: "DELETE" });
              try { localStorage.removeItem(STORAGE); } catch { /* */ }
              router.push("/combate");
            }} style={{ ...btnGhost, color: "#EF5350", borderColor: "rgba(239,83,80,0.4)" }}>Borrar</button>
          </div>
        </div>
      </header>

      <main className="cmb-main" style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Tracker */}
        <section className="cmb-tracker" style={{ marginBottom: 22, paddingTop: 8 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent-border)", borderRadius: 16, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 200px", minWidth: 190 }}>
                <Etq>Vida</Etq>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Step onClick={() => patch({ hpActual: Math.max(0, tr.hpActual - 1) })}>−</Step>
                  <div style={{ textAlign: "center", minWidth: 78 }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: tr.hpActual <= derived.maxHp * 0.25 ? "#EF5350" : "#fff" }}>{tr.hpActual}</span>
                    <span style={{ fontSize: 14, color: "var(--text-faint)" }}> / {derived.maxHp}</span>
                    {tr.tempHp > 0 && <span style={{ fontSize: 12, color: "#81D4FA", fontWeight: 700 }}> +{tr.tempHp}</span>}
                  </div>
                  <Step onClick={() => patch({ hpActual: Math.min(derived.maxHp, tr.hpActual + 1) })}>+</Step>
                </div>
              </div>

              {slotLevels.length > 0 && (
                <div style={{ flex: "2 1 280px", minWidth: 220 }}>
                  <Etq>Espacios de hechizo</Etq>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {slotLevels.map((lv) => {
                      const totalLv = derived.slots[lv];
                      const usados = tr.slotsUsados[lv] ?? 0;
                      return (
                        <div key={lv} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, color: "var(--text-faint)", width: 34 }}>Nv{lv}</span>
                          {Array.from({ length: totalLv }).map((_, i) => {
                            const usado = i < usados;
                            return <button key={i} onClick={() => patch({ slotsUsados: { ...tr.slotsUsados, [lv]: usado ? i : i + 1 } })}
                              style={{ width: 30, height: 30, borderRadius: 7, cursor: "pointer", fontSize: 13, border: `2px solid ${usado ? "var(--border)" : "var(--accent)"}`, background: usado ? "transparent" : "var(--accent-bg)", color: usado ? "var(--text-faint)" : "var(--accent-strong)" }}>{usado ? "○" : "●"}</button>;
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ flex: "1 1 160px", minWidth: 150 }}>
                <Etq>Concentración</Etq>
                {tr.concentrando ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", background: "rgba(216,192,138,0.12)", border: "1px solid rgba(216,192,138,0.35)", borderRadius: 8, padding: "5px 10px" }}>◈ {tr.concentrando}</span>
                    <button onClick={() => patch({ concentrando: null })} style={mini}>soltar</button>
                  </div>
                ) : <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Ninguna</span>}
              </div>

              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <button onClick={() => patch({ slotsUsados: {}, concentrando: null })} style={{ ...btnAccent }}>☕ Descanso corto</button>
                <button onClick={() => patch({ hpActual: derived.maxHp, tempHp: 0, slotsUsados: {}, concentrando: null })} style={btnGhost}>🌙 Descanso largo</button>
              </div>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-faint)", margin: "10px 0 0" }}>
              Nota: muchas clases recuperan espacios con descanso <strong>largo</strong> (no corto). El Brujo es la excepción. Usá el botón que corresponda a tu clase.
            </p>
          </div>
        </section>

        {/* ══ TABS INTERNOS ══ */}
        <div className="cmb-tabs" style={{ display: "flex", gap: 6, margin: "0 0 14px", borderBottom: "1px solid var(--border)" }}>
          {([["combate", "⚔ Combate"], ["stats", "📊 Mis números"], ["ref", "📖 Referencia"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "9px 16px", fontSize: 13, fontWeight: tab === id ? 700 : 500, cursor: "pointer",
              background: "transparent", border: "none", color: tab === id ? "var(--accent-strong)" : "var(--text-muted)",
              borderBottom: `2px solid ${tab === id ? "var(--accent)" : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap",
            }}>{label}</button>
          ))}
        </div>

        {tab === "stats" && (<>
        {/* Vitales */}
        <Sec>Tus números</Sec>
        <div style={grid(150)}>
          <Vit label="❤️ Vida" v={derived.maxHp} big />
          <Vit label="🛡 CA" v={derived.ac} big />
          {derived.spellSaveDC !== null && <Vit label="✦ CD hechizos" v={derived.spellSaveDC} big />}
          {derived.spellAttack !== null && <Vit label="🎯 Ataque mágico" v={fmtMod(derived.spellAttack)} big />}
          <Vit label="⚡ Iniciativa" v={fmtMod(derived.initiative)} />
          <Vit label="👣 Velocidad" v={`${Math.round((derived.speed * 0.3) / 1.5) * 1.5} m`} />
          <Vit label="➕ Competencia" v={fmtMod(derived.prof)} />
          <Vit label="👁 Perc. pasiva" v={derived.passivePerception} />
        </div>

        {/* Características + salvaciones */}
        <Sec>Características y salvaciones</Sec>
        <div style={grid(230)}>
          {ABILITY_ORDER.map((k) => {
            const sv = derived.saves.find((s) => s.key === k)!;
            return (
              <div key={k} style={cardS}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase" }}>{ABILITY_ES[k]}</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{ch.abilities[k]} <span style={{ fontSize: 13, color: "var(--accent-strong)" }}>({fmtMod(derived.abilityMods[k])})</span></span>
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "2px 0 4px" }}>{ABILITY_DESC[k]}</div>
                <div style={{ fontSize: 11, color: sv.competente ? "var(--accent)" : "var(--text-faint)" }}>Salvación {fmtMod(sv.valor)}{sv.competente ? " ● competente" : ""}</div>
              </div>
            );
          })}
        </div>

        {/* Habilidades */}
        <Sec>Habilidades</Sec>
        <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "-2px 0 10px", lineHeight: 1.5 }}>
          Cuando el Master te diga "tirá una prueba de [habilidad]", tirás <strong>1d20 + el número de la derecha</strong>. El ● marca en las que sos competente (sumás tu bono). Acá tenés qué hace cada una.
        </p>
        <div style={grid(240)}>
          {ALL_SKILLS.map((sk) => {
            const comp = ch.skillProf.includes(sk);
            return (
              <div key={sk} style={{ ...cardS, padding: "9px 11px", borderColor: comp ? "var(--accent-border)" : "var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12.5, color: comp ? "var(--accent-strong)" : "var(--text-main)", fontWeight: comp ? 700 : 500 }}>
                    {comp ? "● " : ""}{skillES(sk)} <span style={{ fontSize: 9, color: "var(--text-faint)" }}>({ABILITY_ES[skillAbility(sk)].slice(0, 3)})</span>
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: comp ? "var(--accent-strong)" : "var(--text-faint)" }}>{fmtMod(skillTotal(ch, derived, sk))}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 3 }}>{skillDesc(sk)}</div>
              </div>
            );
          })}
        </div>

        </>)}

        {tab === "combate" && (<>
        {/* Efectos activos */}
        {effects && effects.notes.length > 0 && (
          <div style={{ ...cardS, marginTop: 18, borderLeft: "3px solid var(--accent-border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 6 }}>✚ Activo en tu build</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {effects.notes.map((n, i) => <li key={i} style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3, lineHeight: 1.45 }}>{n}</li>)}
            </ul>
          </div>
        )}

        {/* Acciones por grupo */}
        {GRUPOS.map((g) => {
          const items = actions.filter((a) => a.grupo === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h2 className="sec-label" style={{ fontSize: 14, margin: 0 }}>{g.icono} {g.titulo}</h2>
                <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{g.desc}</span>
              </div>
              <div className="arcane-divider" style={{ margin: "4px 0 14px" }} />
              <div style={grid(250)}>
                {items.map((a) => <ActionCard key={a.id} action={a} slotLevels={slotLevels} onAbrir={() => setRoller(a)} onLanzar={(lv) => lanzar(a, lv)} />)}
              </div>
            </section>
          );
        })}

        </>)}

        {tab === "ref" && (<>
        {/* Rasgos de clase y raza (referencia) */}
        <Sec>Rasgos de clase y raza (referencia)</Sec>
        <div style={grid(240)}>
          {cls && (
            <div style={cardS}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-strong)", marginBottom: 6 }}>{claseES(cls.name)}: rasgos hasta nivel {ch.level}</div>
              {featuresHasta.length ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {featuresHasta.map((f, i) => <li key={i} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{featureES(f.name)} <span style={{ color: "var(--text-faint)" }}>(nv{f.lvl})</span></li>)}
                </ul>
              ) : <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>Sin rasgos listados en el SRD para estos niveles.</p>}
              {cls.subclasses.length > 0 && <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8 }}>Subclases SRD: {cls.subclasses.join(", ")}</p>}
            </div>
          )}
          {ch.subclassName && (() => {
            const sub = cls?.subclasses_full?.find((s) => s.name === ch.subclassName);
            return (
              <div style={cardS}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-strong)", marginBottom: 4 }}>Subclase: {ch.subclassName}</div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  {sub?.desc || "Subclase personalizada — su mecánica no se auto-aplica; ajustá los números a mano si hace falta."}
                </p>
                {sub && !sub.srd && <p style={{ fontSize: 10, color: "var(--gold)", marginTop: 6 }}>Fuente: {sub.source} (abierta). La mecánica no se auto-aplica.</p>}
              </div>
            );
          })()}
          {race && race.traits.map((t, i) => (
            <div key={i} style={cardS}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-strong)", marginBottom: 4 }}>{rasgoES(t.name)}</div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{rasgoDescES(t.name, t.desc) || "—"}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 24, lineHeight: 1.5 }}>
          Las mecánicas vienen del SRD (contenido abierto); nombres y descripciones están traducidos y las tiradas (ataque/salvación/daño) se calculan solas. Si tu mesa usa una regla distinta, ajustá los números editando la hoja.
        </p>
        </>)}
      </main>

      {roller && <CombatRoller action={roller} onClose={() => setRoller(null)} />}
    </div>
  );
}

// ── Tarjeta de acción ──
function ActionCard({ action, slotLevels, onAbrir, onLanzar }: { action: CombatAction; slotLevels: number[]; onAbrir: () => void; onLanzar: (lv: number) => void }) {
  const rollable = action.tirada.tipo === "ataque" || (action.danos ?? []).some((d) => d.caras > 0 || d.flat !== undefined);
  // nivel de espacio a gastar: el mínimo disponible >= nivel del hechizo
  const spellLvl = action.usaEspacio ? parseInt((action.coste.match(/nivel (\d+)/) ?? [])[1] ?? "1", 10) : 0;
  const usable = action.usaEspacio ? slotLevels.filter((l) => l >= spellLvl) : [];
  return (
    <div style={{ ...cardS, display: "flex", flexDirection: "column", gap: 8, borderColor: action.destacado ? "var(--accent-border)" : "var(--border)" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{action.nombre}</h3>
          {action.delBuild && <span style={{ fontSize: 9, color: "var(--gold)", border: "1px solid rgba(216,192,138,0.4)", borderRadius: 6, padding: "1px 6px" }}>genérico</span>}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Bdg>{action.accion}</Bdg><Bdg>{action.coste}</Bdg>{action.concentracion && <Bdg c="var(--gold)">◈ conc.</Bdg>}
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{action.queHace}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <TChip action={action} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
        <button onClick={onAbrir} style={{ flex: "1 1 auto", padding: "8px 12px", borderRadius: 9, border: rollable ? "none" : "1px solid var(--border)", cursor: "pointer", fontSize: 12, fontWeight: 700, background: rollable ? "#1a1830" : "transparent", color: rollable ? "#fff" : "var(--text-muted)" }}>
          {rollable ? "🎲 Detalle y tirar" : "Ver detalle"}
        </button>
        {action.usaEspacio && usable.length > 0 && (
          <button onClick={() => onLanzar(usable[0])} style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid var(--accent-border)", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-bg)", color: "var(--accent-strong)" }}>
            🔮 Lanzar (nv{usable[0]})
          </button>
        )}
      </div>
    </div>
  );
}

function TChip({ action }: { action: CombatAction }) {
  const t = action.tirada;
  let txt = "", color = "var(--text-faint)";
  if (t.tipo === "ataque") { txt = `🎯 1d20+${t.bonus} vs CA`; color = "#64B5F6"; }
  else if (t.tipo === "salvacion") { txt = `🛡 Salva ${t.stat} CD ${t.cd}`; color = "#FFB74D"; }
  else if (t.tipo === "especial") { txt = "✦ Especial"; color = "#CE93D8"; }
  else { txt = "✓ Sin tirada"; color = "#A5D6A7"; }
  const dmg = (action.danos ?? []).map((d) => d.flat !== undefined ? `${d.flat} ${d.tipo}` : `${d.cantidad}d${d.caras}${d.modificador ? `+${d.modificador}` : ""} ${d.tipo}`).join(" · ");
  return (
    <>
      <span style={{ fontSize: 11, fontWeight: 700, border: `1px solid ${color}55`, color, borderRadius: 7, padding: "3px 9px", background: `${color}14` }}>{txt}</span>
      {dmg && <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 7, padding: "3px 9px", color: "var(--text-main)" }}>💥 {dmg}</span>}
    </>
  );
}

// ── estilos / piezas ──
const lnk: React.CSSProperties = { fontSize: 11, color: "var(--accent)", textDecoration: "none" };
const cardS: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" };
const btnAccent: React.CSSProperties = { padding: "8px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "var(--accent)", color: "#fff" };
const btnGhost: React.CSSProperties = { padding: "8px 14px", borderRadius: 9, border: "1px solid var(--border)", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "transparent", color: "var(--text-muted)" };
const mini: React.CSSProperties = { fontSize: 10, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" };
const grid = (min: number): React.CSSProperties => ({ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 10 });

function Sec({ children }: { children: ReactNode }) { return <h2 className="sec-label" style={{ fontSize: 13, margin: "26px 0 10px" }}>{children}</h2>; }
function Vit({ label, v, big }: { label: string; v: ReactNode; big?: boolean }) {
  return <div style={{ ...cardS, borderColor: big ? "var(--accent-border)" : "var(--border)" }}><div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: big ? 24 : 20, fontWeight: 800, color: big ? "var(--accent-strong)" : "#fff" }}>{v}</div></div>;
}
function Etq({ children }: { children: ReactNode }) { return <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>{children}</div>; }
function Step({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button onClick={onClick} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>{children}</button>; }
function Bdg({ children, c }: { children: ReactNode; c?: string }) { return <span style={{ fontSize: 10, color: c ?? "var(--text-faint)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 7px" }}>{children}</span>; }
function Centro({ children }: { children: ReactNode }) { return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>{children}</div>; }
