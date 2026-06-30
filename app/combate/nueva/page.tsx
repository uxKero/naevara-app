"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loadAll, SrdClass, SrdRace, SrdSpell, SrdBackground, SrdWeapon, SrdArmor, SrdDeity,
  computeDerived, mod, fmtMod, ABILITY_ES, ABILITY_ORDER, ABILITY_PRIORITY, porQuePrincipal,
  schoolES, dmgES, rangeES, castingTimeES, weaponProficient, skillES, skillDesc,
} from "@/lib/srd";
import { FIGHTING_STYLES, INVOCATIONS, tieneEstilo, invocacionesConocidas, computeEffects } from "@/lib/features";
import { BuilderCharacter, BuilderAbilities, BuilderOverrides, AbilityKey } from "@/types/builder";

const STD_ARRAY = [15, 14, 13, 12, 10, 8];
const PB_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

type StepKey = "basico" | "stats" | "skills" | "equipo" | "opciones" | "hechizos" | "revisar";
const STEP_TITLE: Record<StepKey, string> = {
  basico: "Básico", stats: "Características", skills: "Habilidades",
  equipo: "Equipo", opciones: "Opciones", hechizos: "Hechizos", revisar: "Revisar",
};

function d(faces: number) { return Math.floor(Math.random() * faces) + 1; }
function roll4d6() { const r = [d(6), d(6), d(6), d(6)].sort((a, b) => b - a); return r[0] + r[1] + r[2]; }

export default function NuevaHojaPage() {
  const router = useRouter();
  const [srd, setSrd] = useState<{ spells: SrdSpell[]; classes: SrdClass[]; races: SrdRace[]; backgrounds: SrdBackground[]; weapons: SrdWeapon[]; armor: SrdArmor[]; deities: SrdDeity[] } | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ── Estado del personaje ──
  const [name, setName] = useState("");
  const [classIndex, setClassIndex] = useState("");
  const [subclassName, setSubclassName] = useState("");
  const [subclassCustom, setSubclassCustom] = useState("");
  const [raceIndex, setRaceIndex] = useState("");
  const [customRace, setCustomRace] = useState("");
  const [subraceIndex, setSubraceIndex] = useState("");
  const [level, setLevel] = useState(1);
  const [backgroundIndex, setBackgroundIndex] = useState("custom");
  const [deity, setDeity] = useState("");
  const [deityCustom, setDeityCustom] = useState("");
  const [alignment, setAlignment] = useState("");
  const [base, setBase] = useState<BuilderAbilities>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [skillProf, setSkillProf] = useState<string[]>([]);
  const [cantrips, setCantrips] = useState<string[]>([]);
  const [spells, setSpells] = useState<string[]>([]);
  const [weapons, setWeapons] = useState<string[]>([]);
  const [armorIndex, setArmorIndex] = useState<string>("");
  const [shield, setShield] = useState(false);
  const [fightingStyle, setFightingStyle] = useState<string>("");
  const [invocations, setInvocations] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  // cargar SRD
  useEffect(() => { loadAll().then(setSrd).catch((e) => setErr(String(e))); }, []);

  // modo edición: ?id=
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    setEditId(id);
    fetch(`/api/characters/${id}`).then((r) => r.json()).then((c: BuilderCharacter) => {
      if (!c || c.__type !== "builder") return;
      setName(c.name); setClassIndex(c.classIndex); setRaceIndex(c.raceIndex); setSubraceIndex(c.subraceIndex ?? "");
      setCustomRace(c.customRace ?? ""); setSubclassName(c.subclassName ?? ""); setDeity(c.deity ?? "");
      setLevel(c.level); setBackgroundIndex(c.backgroundIndex ?? "custom"); setAlignment(c.alignment ?? "");
      setSkillProf(c.skillProf ?? []); setCantrips(c.cantrips ?? []); setSpells(c.spells ?? []);
      setWeapons(c.weapons ?? []); setArmorIndex(c.armorIndex ?? ""); setShield(!!c.shield);
      setFightingStyle(c.fightingStyle ?? ""); setInvocations(c.invocations ?? []);
      // las puntuaciones guardadas son finales; al editar las tratamos como "base" (los bonos raciales ya están dentro)
      setBase(c.abilities);
      const ov: Record<string, string> = {};
      Object.entries(c.overrides ?? {}).forEach(([k, v]) => { if (v != null) ov[k] = String(v); });
      setOverrides(ov);
    }).catch((e) => setErr(String(e)));
  }, []);

  const cls = useMemo(() => srd?.classes.find((c) => c.index === classIndex) ?? null, [srd, classIndex]);
  const race = useMemo(() => srd?.races.find((r) => r.index === raceIndex) ?? null, [srd, raceIndex]);
  const armorObj = useMemo(() => srd?.armor.find((a) => a.index === armorIndex) ?? null, [srd, armorIndex]);

  // En modo edición las stats ya son finales; en alta sumamos bonos raciales a la base.
  const racial = useMemo(() => {
    const m: Partial<Record<AbilityKey, number>> = {};
    if (editId) return m; // ya incluidos
    race?.ability_bonuses.forEach((b) => { m[b.ability as AbilityKey] = (m[b.ability as AbilityKey] ?? 0) + b.bonus; });
    return m;
  }, [race, editId]);

  const abilities: BuilderAbilities = useMemo(() => ({
    str: base.str + (racial.str ?? 0), dex: base.dex + (racial.dex ?? 0), con: base.con + (racial.con ?? 0),
    int: base.int + (racial.int ?? 0), wis: base.wis + (racial.wis ?? 0), cha: base.cha + (racial.cha ?? 0),
  }), [base, racial]);

  const draftOverrides: BuilderOverrides = useMemo(() => {
    const o: BuilderOverrides = {};
    (["maxHp", "ac", "spellSaveDC", "spellAttack", "initiative", "speed"] as const).forEach((k) => {
      const v = overrides[k];
      if (v != null && v.trim() !== "" && !isNaN(Number(v))) o[k] = Number(v);
    });
    return o;
  }, [overrides]);

  const effSubclass = (subclassCustom.trim() || subclassName) || null;
  const effDeity = (deityCustom.trim() || deity) || null;

  const draft: BuilderCharacter = useMemo(() => ({
    __type: "builder", id: editId ?? "", name, level, raceIndex, customRace: raceIndex === "custom" ? (customRace || null) : null,
    subraceIndex, classIndex, subclassName: effSubclass, backgroundIndex, deity: effDeity, alignment,
    abilities, skillProf, cantrips, spells, weapons, armorIndex: armorIndex || null, shield, fightingStyle: fightingStyle || null, invocations,
    overrides: draftOverrides,
  }), [editId, name, level, raceIndex, customRace, subraceIndex, classIndex, effSubclass, backgroundIndex, effDeity, alignment, abilities, skillProf, cantrips, spells, weapons, armorIndex, shield, fightingStyle, invocations, draftOverrides]);

  const effects = useMemo(() => computeEffects({ clsIndex: classIndex, level, hasArmor: !!armorIndex, fightingStyle, invocations }), [classIndex, level, armorIndex, fightingStyle, invocations]);
  const derived = useMemo(() => (cls ? computeDerived(draft, cls, race, { armor: armorObj, shield, acBonus: effects.acBonus }) : null), [draft, cls, race, armorObj, shield, effects]);

  const maxSlotLevel = useMemo(() => {
    if (!derived) return 0;
    const lv = Object.entries(derived.slots).filter(([, n]) => n > 0).map(([l]) => Number(l));
    return lv.length ? Math.max(...lv) : 0;
  }, [derived]);
  const classCantrips = useMemo(() => srd?.spells.filter((s) => s.level === 0 && s.classes.includes(classIndex)) ?? [], [srd, classIndex]);
  const classSpells = useMemo(() => srd?.spells.filter((s) => s.level >= 1 && s.level <= maxSlotLevel && s.classes.includes(classIndex)) ?? [], [srd, classIndex, maxSlotLevel]);

  const esCaster = !!cls?.spellcasting_ability;
  const spellsKnown = derived?.spellsKnown ?? null;
  const prepareLimit = useMemo(() => {
    if (!derived || spellsKnown !== null || !derived.spellAbility) return null;
    return Math.max(1, derived.abilityMods[derived.spellAbility] + level);
  }, [derived, spellsKnown, level]);
  const spellLimit = spellsKnown ?? prepareLimit ?? 99;
  const bgSkills = useMemo(() => srd?.backgrounds.find((b) => b.index === backgroundIndex)?.skills ?? [], [srd, backgroundIndex]);

  const hayEstilo = tieneEstilo(classIndex, level);
  const invMax = cls ? invocacionesConocidas(cls, level) : 0;
  const hayOpciones = hayEstilo || invMax > 0;

  // pasos dinámicos
  const steps: StepKey[] = useMemo(() => {
    const s: StepKey[] = ["basico", "stats", "skills", "equipo"];
    if (hayOpciones) s.push("opciones");
    if (esCaster) s.push("hechizos");
    s.push("revisar");
    return s;
  }, [hayOpciones, esCaster]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  const pbUsed = ABILITY_ORDER.reduce((sum, k) => sum + (PB_COST[base[k]] ?? 99), 0);

  if (err) return <Centro>Error: {err}</Centro>;
  if (!srd) return <Centro>Cargando contenido de D&D…</Centro>;

  function toggle(list: string[], setList: (v: string[]) => void, value: string, max: number) {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else if (list.length < max) setList([...list, value]);
  }
  const skillOptions = cls?.skill_options ?? [];
  const skillMax = cls?.skill_choose ?? 0;

  async function guardar() {
    setSaving(true); setErr("");
    try {
      const url = editId ? `/api/characters/${editId}` : "/api/characters";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, id: editId ?? "" }) });
      const out = await res.json();
      if (!res.ok) { setErr(out?.error ?? "No se pudo guardar"); setSaving(false); return; }
      router.push(`/combate/c/${out.id ?? editId}`);
    } catch (e) { setErr(String(e)); setSaving(false); }
  }

  const canNext = step === "basico" ? !!(name.trim() && classIndex && raceIndex) : true;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60 }}>
      <header style={{ background: "var(--hero-bg)", borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.25rem" }}>
          <Link href="/combate" style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>← Volver a combate</Link>
          <h1 className="hero-name" style={{ fontSize: 24, fontWeight: 600, color: "#fff", margin: "4px 0 0" }}>{editId ? `Editar: ${name}` : "Nueva hoja de personaje"}</h1>
        </div>
      </header>

      <main className="cmb-main" style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Pasos */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStepIdx(i)} style={{
              fontSize: 12, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${stepIdx === i ? "var(--accent)" : "var(--border)"}`,
              background: stepIdx === i ? "var(--accent-bg)" : "transparent",
              color: stepIdx === i ? "var(--accent-strong)" : "var(--text-muted)", fontWeight: stepIdx === i ? 700 : 400,
            }}>{i + 1}. {STEP_TITLE[s]}</button>
          ))}
        </div>

        {/* ══ BÁSICO ══ */}
        {step === "basico" && (
          <Seccion>
            <Campo label="Nombre del personaje"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Kael, Lyra…" style={inp} /></Campo>
            <div className="grid-2col">
              <Campo label="Clase">
                <select value={classIndex} onChange={(e) => { setClassIndex(e.target.value); if (!editId) { setCantrips([]); setSpells([]); setSkillProf([]); setFightingStyle(""); setInvocations([]); } }} style={inp}>
                  <option value="">Elegí una clase…</option>
                  {srd.classes.map((c) => <option key={c.index} value={c.index}>{c.name}</option>)}
                </select>
              </Campo>
              <Campo label="Nivel">
                <select value={level} onChange={(e) => setLevel(Number(e.target.value))} style={inp}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Nivel {n}</option>)}
                </select>
              </Campo>
            </div>
            {cls && (cls.subclasses_full?.length ?? 0) > 0 && (
              <div className="grid-2col">
                <Campo label="Subclase">
                  <select value={subclassName} onChange={(e) => { setSubclassName(e.target.value); setSubclassCustom(""); }} style={inp}>
                    <option value="">— elegir —</option>
                    {cls.subclasses_full!.map((s) => <option key={s.name} value={s.name}>{s.name}{s.srd ? "" : ` · ${s.source}`}</option>)}
                  </select>
                </Campo>
                <Campo label="…o subclase personalizada">
                  <input value={subclassCustom} onChange={(e) => setSubclassCustom(e.target.value)} placeholder="Escribí la tuya" style={inp} />
                </Campo>
              </div>
            )}
            <div className="grid-2col">
              <Campo label="Raza">
                <select value={raceIndex} onChange={(e) => { setRaceIndex(e.target.value); setSubraceIndex(""); }} style={inp}>
                  <option value="">Elegí una raza…</option>
                  {srd.races.map((r) => <option key={r.index} value={r.index}>{r.name}{r.source ? ` · ${r.source}` : ""}</option>)}
                  <option value="custom">✎ Personalizada (a mano)</option>
                </select>
              </Campo>
              {raceIndex === "custom" ? (
                <Campo label="Nombre de la raza personalizada">
                  <input value={customRace} onChange={(e) => setCustomRace(e.target.value)} placeholder="Ej: Aasimar, Goliath…" style={inp} />
                </Campo>
              ) : race && race.subraces.length > 0 ? (
                <Campo label="Subraza (opcional)">
                  <select value={subraceIndex} onChange={(e) => setSubraceIndex(e.target.value)} style={inp}>
                    <option value="">— ninguna —</option>
                    {race.subraces.map((s) => <option key={s.index} value={s.index}>{s.name}</option>)}
                  </select>
                </Campo>
              ) : null}
            </div>
            <div className="grid-2col">
              <Campo label="Trasfondo">
                <select value={backgroundIndex} onChange={(e) => setBackgroundIndex(e.target.value)} style={inp}>
                  <option value="custom">Personalizado / otro</option>
                  {srd.backgrounds.map((b) => <option key={b.index} value={b.index}>{b.name}</option>)}
                </select>
              </Campo>
              <Campo label="Alineamiento (opcional)"><input value={alignment} onChange={(e) => setAlignment(e.target.value)} placeholder="Ej: Neutral Bueno" style={inp} /></Campo>
            </div>
            <div className="grid-2col">
              <Campo label="Deidad (opcional)">
                <select value={deity} onChange={(e) => { setDeity(e.target.value); setDeityCustom(""); }} style={inp}>
                  <option value="">— ninguna —</option>
                  {srd.deities.map((dd) => <option key={dd.index} value={dd.name}>{dd.name} · {dd.alignment} · {dd.pantheon}</option>)}
                </select>
              </Campo>
              <Campo label="…o deidad personalizada">
                <input value={deityCustom} onChange={(e) => setDeityCustom(e.target.value)} placeholder="Escribí la tuya" style={inp} />
              </Campo>
            </div>
            {raceIndex === "custom" && <Info>Raza personalizada: cargá las características finales a mano en el paso siguiente (los bonos raciales no se aplican solos). Ajustá la velocidad en los overrides si hace falta.</Info>}
            {race && (
              <Info><strong>{race.name}:</strong> velocidad {race.speed} pies, tamaño {race.size}. Bonos: {race.ability_bonuses.map((b) => `${ABILITY_ES[b.ability]} +${b.bonus}`).join(", ") || "—"}.{race.traits.length > 0 && <> Rasgos: {race.traits.map((t) => t.name).join(", ")}.</>}{editId && <><br /><em>Editando: las puntuaciones ya incluyen los bonos raciales.</em></>}</Info>
            )}
          </Seccion>
        )}

        {/* ══ STATS ══ */}
        {step === "stats" && (() => {
          const prio = classIndex ? ABILITY_PRIORITY[classIndex] : null;
          const primary = prio?.[0] ?? null;
          const secondary = prio?.[1] ?? null;
          const spellAb = (cls?.spellcasting_ability as AbilityKey | null) ?? null;
          const asignarPorClase = () => {
            if (!prio) return;
            const vals = ABILITY_ORDER.map((k) => base[k]).sort((a, b) => b - a);
            const next = { ...base };
            prio.forEach((k, i) => { next[k] = vals[i]; });
            setBase(next);
          };
          return (
          <Seccion>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <BtnSec onClick={() => setBase({ str: STD_ARRAY[0], dex: STD_ARRAY[1], con: STD_ARRAY[2], int: STD_ARRAY[3], wis: STD_ARRAY[4], cha: STD_ARRAY[5] })}>Array (15,14,13,12,10,8)</BtnSec>
              <BtnSec onClick={() => setBase({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 })}>Point-buy (27)</BtnSec>
              <BtnSec onClick={() => setBase({ str: roll4d6(), dex: roll4d6(), con: roll4d6(), int: roll4d6(), wis: roll4d6(), cha: roll4d6() })}>🎲 Tirar 4d6</BtnSec>
              {prio && <button onClick={asignarPorClase} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--accent)", background: "var(--accent-bg)", color: "var(--accent-strong)", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✨ Asignar según mi clase</button>}
            </div>

            {/* Guía por clase */}
            {prio && primary && secondary && (
              <Info>
                <strong style={{ color: "var(--accent-strong)" }}>Para {cls?.name}:</strong> poné tu número <strong>más alto</strong> en <strong style={{ color: "#fff" }}>{ABILITY_ES[primary]}</strong> — {porQuePrincipal(primary, spellAb)} El segundo más alto, en <strong style={{ color: "#fff" }}>{ABILITY_ES[secondary]}</strong>.<br />
                <span style={{ color: "var(--text-faint)" }}>Orden sugerido: {prio.map((k) => ABILITY_ES[k]).join(" › ")}. El botón “Asignar según mi clase” acomoda tus valores solo.</span>
              </Info>
            )}

            <p style={{ fontSize: 11, color: "var(--text-faint)", margin: "4px 0 14px" }}>{editId ? "Estas son las puntuaciones finales (con bonos raciales ya incluidos)." : "Cargá tu base; los bonos raciales se suman solos."} Point-buy usados: <strong style={{ color: pbUsed > 27 ? "#EF5350" : "var(--accent-strong)" }}>{pbUsed}</strong> / 27.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10 }}>
              {ABILITY_ORDER.map((k) => {
                const fin = abilities[k];
                const rank = prio ? prio.indexOf(k) : -1;
                const esPrim = rank === 0, esSec = rank === 1;
                return (
                  <div key={k} style={{ ...card, border: `1px solid ${esPrim ? "var(--accent)" : esSec ? "var(--accent-border)" : "var(--border)"}`, background: esPrim ? "var(--accent-bg)" : "var(--bg-card)" }}>
                    <div style={{ fontSize: 11, color: esPrim ? "var(--accent-strong)" : "var(--text-faint)", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
                      <span>{ABILITY_ES[k]}</span>
                      {esPrim && <span style={{ color: "var(--accent-strong)", fontWeight: 700 }}>★ principal</span>}
                      {esSec && <span style={{ color: "var(--accent)" }}>2ª</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <input type="number" min={1} max={30} value={base[k]} onChange={(e) => setBase({ ...base, [k]: Number(e.target.value) })} style={{ ...inp, width: 64, textAlign: "center", fontSize: 18, fontWeight: 700 }} />
                      {racial[k] ? <span style={{ fontSize: 11, color: "var(--accent)" }}>+{racial[k]} racial</span> : null}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Total <strong style={{ color: "#fff" }}>{fin}</strong> · mod <strong style={{ color: "var(--accent-strong)" }}>{fmtMod(mod(fin))}</strong></div>
                  </div>
                );
              })}
            </div>
          </Seccion>
          );
        })()}

        {/* ══ SKILLS ══ */}
        {step === "skills" && (
          <Seccion>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{cls ? <>Tu clase elige <strong>{skillMax}</strong> habilidades. </> : "Elegí una clase. "}{bgSkills.length > 0 && <>Trasfondo: <strong>{bgSkills.map(skillES).join(", ")}</strong> (incluidas).</>}</p>
            <p style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 12 }}>Una habilidad es algo en lo que tu personaje es bueno. Si la marcás, sumás tu bono de competencia cuando el Master te pida tirar para eso. Elegí lo que pegue con tu idea de personaje.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 8 }}>
              {skillOptions.map((sk) => {
                const fromBg = bgSkills.includes(sk);
                const checked = skillProf.includes(sk) || fromBg;
                const full = skillProf.length >= skillMax && !skillProf.includes(sk);
                return (
                  <label key={sk} style={{ ...card, display: "flex", gap: 9, cursor: fromBg ? "default" : "pointer", opacity: full && !checked ? 0.5 : 1, alignItems: "flex-start" }}>
                    <input type="checkbox" checked={checked} disabled={fromBg || (full && !checked)} onChange={() => toggle(skillProf, setSkillProf, sk, skillMax)} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--accent-strong)" : "var(--text-main)" }}>{skillES(sk)}{fromBg && <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 400 }}> · del trasfondo</span>}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginTop: 2 }}>{skillDesc(sk)}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>Elegidas: {skillProf.length} / {skillMax}</p>
          </Seccion>
        )}

        {/* ══ EQUIPO ══ */}
        {step === "equipo" && (
          <Seccion>
            <h3 style={subt}>Armadura</h3>
            <div className="grid-2col">
              <Campo label="Armadura equipada">
                <select value={armorIndex} onChange={(e) => setArmorIndex(e.target.value)} style={inp}>
                  <option value="">Sin armadura (CA 10 + Des)</option>
                  {srd.armor.filter((a) => a.category !== "Shield").map((a) => <option key={a.index} value={a.index}>{a.name} ({a.category})</option>)}
                </select>
              </Campo>
              <Campo label="Escudo">
                <label style={{ ...card, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={shield} onChange={(e) => setShield(e.target.checked)} /> <span style={{ fontSize: 13 }}>Llevo escudo (+2 CA)</span>
                </label>
              </Campo>
            </div>
            {cls && armorObj && ((armorObj.category === "Light" && !cls.armor_prof.light) || (armorObj.category === "Medium" && !cls.armor_prof.medium) || (armorObj.category === "Heavy" && !cls.armor_prof.heavy)) && (
              <Info>⚠ Tu clase no es competente con armadura {armorObj.category.toLowerCase()}: tendrías desventaja y no podrías lanzar hechizos. Elegí otra o consultá al Master.</Info>
            )}
            <Info>CA calculada: <strong style={{ color: "var(--accent-strong)" }}>{derived?.ac ?? "—"}</strong></Info>

            <h3 style={{ ...subt, marginTop: 14 }}>Armas equipadas</h3>
            <WeaponPicker weapons={srd.weapons} selected={weapons} cls={cls}
              onToggle={(idx) => toggle(weapons, setWeapons, idx, 12)} />
          </Seccion>
        )}

        {/* ══ OPCIONES ══ */}
        {step === "opciones" && (
          <Seccion>
            {hayEstilo && (
              <>
                <h3 style={subt}>Estilo de combate</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 8 }}>
                  {FIGHTING_STYLES.map((f) => (
                    <button key={f.id} onClick={() => setFightingStyle(fightingStyle === f.id ? "" : f.id)} style={{ ...card, textAlign: "left", cursor: "pointer", border: `1px solid ${fightingStyle === f.id ? "var(--accent)" : "var(--border)"}`, background: fightingStyle === f.id ? "var(--accent-bg)" : "var(--bg-card)" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: fightingStyle === f.id ? "var(--accent-strong)" : "#fff" }}>{fightingStyle === f.id ? "✓ " : ""}{f.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{f.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {invMax > 0 && (
              <>
                <h3 style={{ ...subt, marginTop: hayEstilo ? 18 : 0 }}>Invocaciones místicas — elegí {invMax}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 8 }}>
                  {INVOCATIONS.map((iv) => {
                    const on = invocations.includes(iv.id);
                    const full = invocations.length >= invMax && !on;
                    return (
                      <button key={iv.id} onClick={() => toggle(invocations, setInvocations, iv.id, invMax)} disabled={full} style={{ ...card, textAlign: "left", cursor: full ? "not-allowed" : "pointer", opacity: full ? 0.5 : 1, border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg)" : "var(--bg-card)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: on ? "var(--accent-strong)" : "#fff" }}>{on ? "✓ " : ""}{iv.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{iv.desc}{iv.req && <span style={{ color: "var(--gold)" }}> · req: {iv.req}</span>}</div>
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8 }}>Elegidas: {invocations.length} / {invMax}</p>
              </>
            )}
          </Seccion>
        )}

        {/* ══ HECHIZOS ══ */}
        {step === "hechizos" && esCaster && (
          <Seccion>
            <h3 style={subt}>Trucos — elegí {derived?.cantripsKnown ?? 0}</h3>
            <SpellPicker spells={classCantrips} selected={cantrips} max={derived?.cantripsKnown ?? 0} onToggle={(idx) => toggle(cantrips, setCantrips, idx, derived?.cantripsKnown ?? 0)} />
            <h3 style={{ ...subt, marginTop: 20 }}>Hechizos — {spellsKnown !== null ? `conocés ${spellsKnown}` : `preparás ~${prepareLimit}`} (hasta nivel {maxSlotLevel})</h3>
            <SpellPicker spells={classSpells} selected={spells} max={spellLimit} onToggle={(idx) => toggle(spells, setSpells, idx, spellLimit)} showLevel />
          </Seccion>
        )}

        {/* ══ REVISAR ══ */}
        {step === "revisar" && derived && cls && (
          <Seccion>
            <h3 style={subt}>{name || "Sin nombre"} — {cls.name} nivel {level} · {race?.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8, marginBottom: 16 }}>
              <Mini label="Vida" v={derived.maxHp} />
              <Mini label="CA" v={derived.ac} />
              <Mini label="Iniciativa" v={fmtMod(derived.initiative)} />
              <Mini label="Velocidad" v={`${derived.speed} ft`} />
              <Mini label="Competencia" v={fmtMod(derived.prof)} />
              {derived.spellSaveDC !== null && <Mini label="CD hechizos" v={derived.spellSaveDC} />}
              {derived.spellAttack !== null && <Mini label="Ataque mágico" v={fmtMod(derived.spellAttack)} />}
              <Mini label="Perc. pasiva" v={derived.passivePerception} />
            </div>

            <h3 style={subt}>Ajustar a mano (override, opcional)</h3>
            <p style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 10 }}>Dejá vacío para usar el valor calculado. Útil si tu mesa usa otra regla o tenés un objeto especial.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
              {([["maxHp", "Vida máx"], ["ac", "CA"], ["spellSaveDC", "CD hechizos"], ["spellAttack", "Ataque mágico"], ["initiative", "Iniciativa"], ["speed", "Velocidad"]] as const).map(([k, lbl]) => (
                <Campo key={k} label={lbl}>
                  <input type="number" value={overrides[k] ?? ""} onChange={(e) => setOverrides({ ...overrides, [k]: e.target.value })} placeholder="auto" style={inp} />
                </Campo>
              ))}
            </div>

            <Info>Salvaciones: {derived.saves.map((s) => `${ABILITY_ES[s.key]} ${fmtMod(s.valor)}${s.competente ? "*" : ""}`).join(" · ")}.{esCaster && <><br />Trucos: {cantrips.length} · Hechizos: {spells.length} · Espacios: {Object.entries(derived.slots).filter(([, n]) => n > 0).map(([l, n]) => `${n}×nv${l}`).join(", ") || "—"}.</>}{effects.notes.length > 0 && <><br />Activo: {effects.notes.join(" · ")}</>}</Info>
            {err && <p style={{ color: "#EF5350", fontSize: 13, marginTop: 12 }}>⚠ {err}</p>}
            <button onClick={guardar} disabled={saving || !name.trim()} style={{ marginTop: 18, padding: "12px 24px", borderRadius: 10, border: "none", cursor: saving ? "wait" : "pointer", fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#7F77DD,#3C3489)", color: "#fff" }}>{saving ? "Guardando…" : editId ? "✓ Guardar cambios" : "✓ Crear hoja de combate"}</button>
          </Seccion>
        )}

        {/* Navegación */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <BtnSec onClick={() => setStepIdx((s) => Math.max(0, s - 1))} disabled={stepIdx === 0}>← Atrás</BtnSec>
          {stepIdx < steps.length - 1 && (
            <button onClick={() => canNext && setStepIdx((s) => Math.min(steps.length - 1, s + 1))} disabled={!canNext} style={{ padding: "9px 20px", borderRadius: 9, border: "none", cursor: canNext ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, background: canNext ? "var(--accent)" : "var(--bg-subtle)", color: canNext ? "#fff" : "var(--text-faint)" }}>Siguiente →</button>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Picker de armas ──
function WeaponPicker({ weapons, selected, cls, onToggle }: { weapons: SrdWeapon[]; selected: string[]; cls: SrdClass | null; onToggle: (idx: string) => void }) {
  const [q, setQ] = useState("");
  const sorted = useMemo(() => [...weapons].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)), [weapons]);
  const filtered = q ? sorted.filter((w) => w.name.toLowerCase().includes(q.toLowerCase())) : sorted;
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar arma… (${selected.length} equipadas)`} style={{ ...inp, marginBottom: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8, maxHeight: 360, overflowY: "auto", padding: 2 }}>
        {filtered.map((w) => {
          const on = selected.includes(w.index);
          const prof = cls ? weaponProficient(w, cls) : false;
          return (
            <button key={w.index} onClick={() => onToggle(w.index)} style={{ ...card, textAlign: "left", cursor: "pointer", border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg)" : "var(--bg-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--accent-strong)" : "#fff" }}>{on ? "✓ " : ""}{w.name}</span>
                {!prof && cls && <span style={{ fontSize: 9, color: "var(--gold)" }}>sin comp.</span>}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>{w.category} · {w.range === "Ranged" ? "distancia" : "c/c"}{w.damage ? ` · ${w.damage.dice} ${dmgES(w.damage.type)}` : ""}{w.finesse ? " · sutil" : ""}{w.versatile ? ` · versátil ${w.versatile}` : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Picker de hechizos ──
function SpellPicker({ spells, selected, max, onToggle, showLevel }: { spells: SrdSpell[]; selected: string[]; max: number; onToggle: (idx: string) => void; showLevel?: boolean }) {
  const [q, setQ] = useState("");
  const sorted = useMemo(() => [...spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)), [spells]);
  const filtered = q ? sorted.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : sorted;
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Buscar… (${spells.length} disponibles, elegidos ${selected.length}/${max})`} style={{ ...inp, marginBottom: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8, maxHeight: 380, overflowY: "auto", padding: 2 }}>
        {filtered.map((s) => {
          const on = selected.includes(s.index);
          const full = selected.length >= max && !on;
          return (
            <button key={s.index} onClick={() => onToggle(s.index)} disabled={full} style={{ ...card, textAlign: "left", cursor: full ? "not-allowed" : "pointer", opacity: full ? 0.45 : 1, border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`, background: on ? "var(--accent-bg)" : "var(--bg-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? "var(--accent-strong)" : "#fff" }}>{on ? "✓ " : ""}{s.name}</span>
                {showLevel && <span style={{ fontSize: 10, color: "var(--text-faint)" }}>nv{s.level}</span>}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 3 }}>{schoolES(s.school)} · {castingTimeES(s.casting_time)} · {rangeES(s.range)}{s.attack_type ? " · 🎯" : s.save ? ` · 🛡 ${ABILITY_ES[s.save.ability] ?? s.save.ability}` : ""}{s.damage ? ` · 💥 ${dmgES(s.damage.tipo)}` : ""}{s.concentration ? " · ◈" : ""}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── piezas UI ──
const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)", fontSize: 14, outline: "none" };
const card: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" };
const subt: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "var(--accent-strong)", margin: "0 0 10px" };
function Seccion({ children }: { children: ReactNode }) { return <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>; }
function Campo({ label, children }: { label: string; children: ReactNode }) { return <div><div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>{children}</div>; }
function Info({ children }: { children: ReactNode }) { return <div style={{ background: "var(--bg-subtle)", borderRadius: 10, padding: "11px 13px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55, borderLeft: "3px solid var(--accent-border)" }}>{children}</div>; }
function Mini({ label, v }: { label: string; v: ReactNode }) { return <div style={card}><div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-strong)" }}>{v}</div></div>; }
function BtnSec({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) { return <button onClick={onClick} disabled={disabled} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: disabled ? "var(--text-faint)" : "var(--text-muted)", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>{children}</button>; }
function Centro({ children }: { children: ReactNode }) { return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", padding: 20, textAlign: "center" }}>{children}</div>; }
