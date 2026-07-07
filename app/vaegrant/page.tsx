"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { VaegrantData, VImagen } from "@/types/vaegrant";
import EditableText from "@/components/EditableText";
import AIModal from "@/components/AIModal";
import ImageLightbox from "@/components/ImageLightbox";
import AddSessionModal from "@/components/AddSessionModal";
import type { SessionEntry } from "@/types/character";
import { Swords, Flame, ArrowLeft, ScrollText, Download } from "lucide-react";
import { descargarImagen } from "@/lib/descargar";
import { BuilderCharacter } from "@/types/builder";
import {
  loadAll, computeDerived, spellToAction, weaponToAction, spellSlotLevel,
  ABILITY_ORDER, ABILITY_ES, ALL_SKILLS, skillES, skillTotal, fmtMod,
  type Derived, type SrdClass, type SrdRace,
} from "@/lib/srd";
import { computeEffects, buildSubclassActions } from "@/lib/features";
import { featureES, rasgoES, rasgoDescES } from "@/lib/traducciones";
import type { CombatAction } from "@/lib/combatData";

// Display serif propio de esta ruta: la identidad tipográfica de Vaegrant.
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] });

const TABS = [
  { id: "perfil",   label: "Perfil" },
  { id: "hoja",     label: "Hoja" },
  { id: "historia", label: "Historia" },
  { id: "mundo",    label: "El mundo" },
];

// Paleta fría de Vaegrant. El ámbar es la única calidez de la página y se
// reserva para lo que en su historia significa "sentirse real": la vela.
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
};
const R = 3; // radio base: presente pero discreto

type UpdateFn = (updater: (d: VaegrantData) => VaegrantData) => void;
type OpenAIFn = (title: string, currentText: string, onApply: (t: string) => void) => void;

const esMundo = (img: VImagen) => img.prompt.startsWith("Mundo");

export default function VaegrantPage() {
  const [data, setData]           = useState<VaegrantData | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState("");
  const [lightbox, setLightbox]   = useState<{ imgs: string[]; caps: string[]; idx: number; alt: string } | null>(null);
  const [aiModal, setAiModal]     = useState<{
    open: boolean; title: string; currentText: string; onApply: (t: string) => void;
  }>({ open: false, title: "", currentText: "", onApply: () => {} });

  useEffect(() => {
    fetch("/api/vaegrant").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  const save = useCallback(async (d: VaegrantData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vaegrant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) { setSavedMsg(`⚠ No se guardó: ${out?.error ?? res.status}`); return; }
      if (out?.store === "supabase") {
        setSavedMsg("Guardado en la nube ✓");
        setTimeout(() => setSavedMsg(""), 2500);
      } else {
        setSavedMsg("⚠ Guardado solo local, NO en la nube");
      }
    } catch {
      setSavedMsg("⚠ Error de red: no se guardó");
    } finally {
      setSaving(false);
    }
  }, []);

  const update: UpdateFn = useCallback((updater) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      save(next);
      return next;
    });
  }, [save]);

  const openAI: OpenAIFn = useCallback((title, currentText, onApply) => {
    setAiModal({ open: true, title, currentText, onApply });
  }, []);

  const retratos = useMemo(() => data?.galeria.imagenes.filter((i) => !esMundo(i)) ?? [], [data]);
  const estampas = useMemo(() => data?.galeria.imagenes.filter(esMundo) ?? [], [data]);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg }}>
        <p style={{ color: C.faint, fontSize: 14 }}>Cargando perfil...</p>
      </div>
    );
  }

  const portada = data.galeria.imagenes[data.galeria.portada] ?? retratos[0] ?? null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`
        .vg-reflection {
          opacity: 0; filter: blur(1.2px);
          animation: vgReflect 2.6s ease-out 0.4s forwards;
        }
        @keyframes vgReflect { to { opacity: 0.35; } }
        @media (prefers-reduced-motion: reduce) {
          .vg-reflection { animation: none; opacity: 0.35; }
        }
        .vg-tab:focus-visible, .vg-btn:focus-visible { outline: 2px solid ${C.amber}; outline-offset: 2px; }
        .vg-row { border-top: 1px solid ${C.borderSoft}; }
        .vg-row:first-of-type { border-top: none; }
        .vg-thumb { transition: opacity 0.15s; }
        .vg-thumb:hover { opacity: 0.85; }
        @media (max-width: 720px) {
          .vg-hero-inner { flex-direction: column; align-items: flex-start !important; gap: 1rem !important; padding: 20px 1rem 18px !important; }
          .vg-grid-2 { grid-template-columns: 1fr !important; }
          .vg-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vg-content { padding: 1.2rem 1rem 3rem !important; }
          .vg-bar { padding: 0 0.6rem !important; }
          .vg-tab { padding: 11px 10px !important; font-size: 11.5px !important; }
          .vg-btn-label, .vg-nav-label { display: none; }
          .vg-bar-actions { gap: 6px !important; }
          .vg-bar-actions a, .vg-bar-actions button { padding: 5px 9px !important; }
          .vg-savedmsg { position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); background: #161d26; border: 1px solid ${C.border}; border-radius: 4px; padding: 6px 14px; z-index: 200; }
        }
      `}</style>

      <AIModal
        isOpen={aiModal.open}
        onClose={() => setAiModal((s) => ({ ...s, open: false }))}
        onApply={(text) => { aiModal.onApply(text); setAiModal((s) => ({ ...s, open: false })); }}
        sectionTitle={aiModal.title}
        currentText={aiModal.currentText}
        tipo="personal"
        context={`Personaje: ${data.meta.alias} (${data.meta.nombreReal}), brujo del Archifey en Silverun, el mundo que quedó de Faerûn tras la Gran Guerra. Tono: melancólico, contenido, sobrio; frases cortas; nada de dramatismo. PROHIBIDO usar la raya larga (—).`}
      />
      {lightbox && (
        <ImageLightbox
          images={lightbox.imgs}
          captions={lightbox.caps}
          startIndex={lightbox.idx}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ══ HERO ══════════════════════════════════ */}
      <div style={{ background: C.bgDeep, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 80% 110%, ${C.amberSoft} 0%, transparent 55%), radial-gradient(ellipse at 15% -10%, rgba(141,163,184,0.12) 0%, transparent 60%)`,
        }} />
        <div className="vg-hero-inner" style={{
          maxWidth: 960, margin: "0 auto", padding: "28px 2rem 24px",
          position: "relative", display: "flex", gap: "1.8rem", alignItems: "flex-end",
        }}>
          <div style={{ flexShrink: 0 }}>
            {portada ? (
              <div
                onClick={() => setLightbox({ imgs: retratos.map((i) => i.url), caps: retratos.map((i) => i.prompt), idx: Math.max(0, retratos.findIndex((i) => i.url === portada.url)), alt: data.meta.alias })}
                title="Ver retratos"
                style={{ cursor: "zoom-in" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portada.url}
                  alt={data.meta.alias}
                  style={{
                    width: 175, height: 225, objectFit: "cover", objectPosition: "top center",
                    borderRadius: R + 1, border: `1px solid ${C.border}`, display: "block",
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: 175, height: 225, borderRadius: R + 1,
                border: `1px dashed rgba(141,163,184,0.35)`, background: "rgba(141,163,184,0.05)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, color: C.faint, padding: 14,
              }}>
                <Flame size={22} color={C.amber} strokeWidth={1.6} />
                <span style={{ fontSize: 11, lineHeight: 1.5, textAlign: "center" }}>Sin retrato todavía.</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, paddingBottom: 2 }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: C.steel, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
              <EditableText value={data.meta.eyebrow} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, eyebrow: v } }))} />
            </p>
            <h1 className={serif.className} style={{ fontSize: 46, fontWeight: 600, color: C.text, lineHeight: 1, letterSpacing: "0.01em", margin: 0 }}>
              <EditableText value={data.meta.alias} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, alias: v } }))} />
            </h1>
            <div className={`vg-reflection ${serif.className}`} style={{ fontSize: 19, fontStyle: "italic", color: C.steel, marginTop: 2, marginBottom: 10 }} title="El nombre que guarda">
              {data.meta.nombreReal}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
              <EditableText value={data.meta.subtitle} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, subtitle: v } }))} />
              <br />
              <EditableText value={data.meta.subsubtitle} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, subsubtitle: v } }))} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {data.meta.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 10, padding: "2px 9px", borderRadius: R, fontWeight: 500, background: "rgba(141,163,184,0.10)", color: C.muted, border: `1px solid ${C.border}` }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {data.heroStats.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  {i > 0 && <div style={{ width: 1, background: C.border, height: 26 }} />}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: C.text, lineHeight: 1 }}>
                      <EditableText value={s.value} onChange={(v) => update((d) => { const hs = [...d.heroStats]; hs[i] = { ...hs[i], value: v }; return { ...d, heroStats: hs }; })} />
                    </div>
                    <div style={{ fontSize: 9, color: C.steel, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS (sticky) ═════════════════════════ */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: C.bgDeep, borderBottom: `1px solid ${C.border}` }}>
        <div className="vg-bar" style={{ maxWidth: 960, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", minWidth: 0 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className="vg-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 16px", fontSize: 12, fontWeight: 500,
                  color: activeTab === tab.id ? C.steelStrong : C.faint,
                  background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: activeTab === tab.id ? `2px solid ${C.amber}` : "2px solid transparent",
                  whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="vg-bar-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {savedMsg && <span className="vg-savedmsg" style={{ fontSize: 11, fontWeight: savedMsg.startsWith("⚠") ? 600 : 400, color: savedMsg.startsWith("⚠") ? "#e07a5f" : C.steel }}>{savedMsg}</span>}
            <a href="/" title="Volver al perfil de Naevara" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.faint, textDecoration: "none", whiteSpace: "nowrap", padding: "5px 2px" }}>
              <ArrowLeft size={13} /> <span className="vg-nav-label">Naevara</span>
            </a>
            <a
              href="/vaegrant/diario"
              title="Leer el perfil como un diario antiguo"
              style={{
                padding: "5px 12px", fontSize: 11, fontWeight: 700,
                background: "transparent", border: `1px solid rgba(201,156,90,0.45)`,
                borderRadius: R + 2, color: C.amber, textDecoration: "none",
                whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
              }}
            >
              <ScrollText size={14} strokeWidth={2.2} /> <span className="vg-btn-label">Diario</span>
            </a>
            <a
              href={`/combate/c/${data.combateId}`}
              style={{
                padding: "5px 12px", fontSize: 11, fontWeight: 700,
                background: "linear-gradient(135deg, #46586b, #2a3644)",
                border: `1px solid ${C.border}`, borderRadius: R + 2, color: "#fff",
                textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
              }}
              title="Abrir la hoja de combate de Vaegrant"
            >
              <Swords size={14} strokeWidth={2.4} /> <span className="vg-btn-label">Combate</span>
            </a>
            <button
              className="vg-btn"
              onClick={() => save(data)}
              disabled={saving}
              title="Guardar cambios"
              style={{
                padding: "5px 12px", fontSize: 11, fontWeight: 600,
                background: saving ? "transparent" : C.steel,
                border: saving ? `1px solid ${C.steel}` : "none",
                borderRadius: R + 2, color: saving ? C.steel : "#10151c",
                cursor: saving ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}
            >
              {saving ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENIDO ═════════════════════════════ */}
      <div className="vg-content" style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 2rem 4rem" }}>
        {activeTab === "perfil" && (
          <TabPerfil data={data} update={update} openAI={openAI} retratos={retratos}
            onOpen={(idx) => setLightbox({ imgs: retratos.map((i) => i.url), caps: retratos.map((i) => i.prompt), idx, alt: data.meta.alias })} />
        )}
        {activeTab === "hoja" && <TabHoja combateId={data.combateId} />}
        {activeTab === "historia" && <TabHistoria data={data} update={update} openAI={openAI} />}
        {activeTab === "mundo" && (
          <TabMundo data={data} update={update} openAI={openAI} estampas={estampas}
            onOpen={(idx) => setLightbox({ imgs: estampas.map((i) => i.url), caps: estampas.map((i) => i.prompt.replace(/^Mundo · /, "")), idx, alt: "Silverun" })} />
        )}
      </div>
    </div>
  );
}

// ── Piezas de UI (editoriales: sin cajas, con jerarquía tipográfica) ──

function VSecLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.16em", margin: "36px 0 4px" }}>
      {children}
    </p>
  );
}

function VDivider() {
  return <div style={{ height: 1, background: `linear-gradient(to right, ${C.border}, transparent 70%)`, margin: "2px 0 16px" }} />;
}

function VTitle({ children, size = 22 }: { children: React.ReactNode; size?: number }) {
  return <h3 className={serif.className} style={{ fontSize: size, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>{children}</h3>;
}

function VQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className={serif.className} style={{
      fontSize: 21, fontStyle: "italic", color: C.muted, lineHeight: 1.45,
      borderLeft: `2px solid ${C.amber}`, margin: "6px 0 8px", padding: "4px 0 4px 16px",
    }}>
      {children}
    </blockquote>
  );
}

function VAIBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="vg-btn"
      onClick={onClick}
      title="Mejorar con IA"
      style={{
        marginLeft: 8, padding: "2px 9px", fontSize: 10, fontWeight: 600,
        background: "transparent", color: C.amber, border: `1px solid rgba(201,156,90,0.3)`,
        borderRadius: R, cursor: "pointer", flexShrink: 0,
      }}
    >
      ✦ IA
    </button>
  );
}

const pStyle: React.CSSProperties = { fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "0 0 12px" };
const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 };

// Sección editorial: título serif + párrafos en flujo, IA por sección
function Seccion({ titulo, parrafos, onChange, openAI }: {
  titulo: string; parrafos: string[];
  onChange: (p: string[]) => void; openAI: OpenAIFn;
}) {
  return (
    <section style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <VTitle>{titulo}</VTitle>
        <VAIBtn onClick={() => openAI(titulo, parrafos.join("\n\n"), (t) => onChange(t.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean)))} />
      </div>
      {parrafos.map((p, i) => (
        <div key={i} style={pStyle}>
          <EditableText value={p} multiline onChange={(v) => { const arr = [...parrafos]; arr[i] = v; onChange(arr); }} />
        </div>
      ))}
    </section>
  );
}

// Galería embebida (fotos con controles mínimos)
function Galeria({ titulo, imagenes, todas, portada, update, onOpen, tipoMundo }: {
  titulo: string;
  imagenes: VImagen[];
  todas: VImagen[];
  portada: number;
  update: UpdateFn;
  onOpen: (idx: number) => void;
  tipoMundo: boolean;
}) {
  const [nuevaUrl, setNuevaUrl] = useState("");
  const globalIdx = (img: VImagen) => todas.findIndex((t) => t.url === img.url);

  const agregar = () => {
    const url = nuevaUrl.trim();
    if (!url) return;
    const nueva: VImagen = {
      url,
      prompt: tipoMundo ? "Mundo · Nueva estampa" : "Nueva imagen",
      fecha: new Date().toISOString().slice(0, 10),
    };
    update((d) => ({ ...d, galeria: { ...d.galeria, imagenes: [...d.galeria.imagenes, nueva] } }));
    setNuevaUrl("");
  };

  return (
    <section>
      <VSecLabel>{titulo} ({imagenes.length})</VSecLabel>
      <VDivider />
      <div className="vg-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {imagenes.map((img, i) => {
          const gi = globalIdx(img);
          const esPortada = !tipoMundo && gi === portada;
          return (
            <figure key={img.url} style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="vg-thumb"
                src={img.url}
                alt={img.prompt}
                onClick={() => onOpen(i)}
                style={{
                  width: "100%", aspectRatio: tipoMundo ? "3 / 2" : "2 / 3", objectFit: "cover",
                  display: "block", cursor: "zoom-in", borderRadius: R + 1,
                  border: `1px solid ${esPortada ? "rgba(201,156,90,0.55)" : C.borderSoft}`,
                }}
              />
              <figcaption style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 2px 0" }}>
                <span style={{ fontSize: 9.5, color: C.faint, lineHeight: 1.3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={img.prompt}>
                  {img.prompt.replace(/^Mundo · /, "")}
                </span>
                {!tipoMundo && (
                  <button
                    className="vg-btn"
                    onClick={() => update((d) => ({ ...d, galeria: { ...d.galeria, portada: gi } }))}
                    disabled={esPortada}
                    title={esPortada ? "Retrato actual" : "Usar de retrato"}
                    style={{ fontSize: 9, padding: "1px 6px", borderRadius: R, cursor: esPortada ? "default" : "pointer", background: "transparent", color: esPortada ? C.amber : C.faint, border: `1px solid ${esPortada ? "rgba(201,156,90,0.4)" : C.borderSoft}` }}
                  >
                    {esPortada ? "Retrato" : "☆"}
                  </button>
                )}
                <button
                  className="vg-btn"
                  onClick={() => descargarImagen(img.url)}
                  title="Descargar imagen"
                  style={{ fontSize: 9, padding: "2px 6px", borderRadius: R, cursor: "pointer", background: "transparent", color: C.faint, border: `1px solid ${C.borderSoft}`, display: "inline-flex", alignItems: "center" }}
                >
                  <Download size={10} />
                </button>
                <button
                  className="vg-btn"
                  onClick={() => {
                    if (!window.confirm("¿Quitar esta imagen?")) return;
                    update((d) => {
                      const imgs = d.galeria.imagenes.filter((x) => x.url !== img.url);
                      const portada = Math.min(d.galeria.portada, Math.max(0, imgs.length - 1));
                      return { ...d, galeria: { ...d.galeria, imagenes: imgs, portada } };
                    });
                  }}
                  title="Quitar de la galería"
                  style={{ fontSize: 9, padding: "1px 6px", borderRadius: R, cursor: "pointer", background: "transparent", color: C.faint, border: `1px solid ${C.borderSoft}` }}
                >
                  ×
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
        <input
          value={nuevaUrl}
          onChange={(e) => setNuevaUrl(e.target.value)}
          placeholder="Agregar imagen: URL o /ruta en public"
          style={{ flex: 1, background: C.subtle, color: C.text, border: `1px solid ${C.borderSoft}`, borderRadius: R + 1, padding: "7px 11px", fontSize: 12, fontFamily: "inherit" }}
        />
        <button
          className="vg-btn"
          onClick={agregar}
          disabled={!nuevaUrl.trim()}
          style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 700, borderRadius: R + 1,
            background: nuevaUrl.trim() ? C.amber : "transparent",
            border: nuevaUrl.trim() ? "none" : `1px solid ${C.borderSoft}`,
            color: nuevaUrl.trim() ? "#10151c" : C.faint,
            cursor: nuevaUrl.trim() ? "pointer" : "not-allowed",
          }}
        >
          Agregar
        </button>
      </div>
    </section>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────

function TabPerfil({ data, update, openAI, retratos, onOpen }: {
  data: VaegrantData; update: UpdateFn; openAI: OpenAIFn;
  retratos: VImagen[]; onOpen: (idx: number) => void;
}) {
  const p = data.perfil;
  return (
    <div>
      <VQuote>
        <EditableText value={p.quote} multiline onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, quote: v } }))} />
      </VQuote>

      <VSecLabel>El nombre</VSecLabel>
      <VDivider />
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 10 }}>
        {([p.nombre.alias, p.nombre.real] as const).map((n, i) => (
          <div key={i} style={{ borderLeft: i === 1 ? `2px solid ${C.amber}` : `2px solid ${C.borderSoft}`, paddingLeft: 14 }}>
            <div className={serif.className} style={{ fontSize: 24, fontWeight: 600, color: i === 1 ? C.steelStrong : C.text, marginBottom: 4, fontStyle: i === 1 ? "italic" : "normal" }}>
              {n.palabra}
            </div>
            <div style={{ ...pStyle, fontSize: 13, margin: 0 }}>
              <EditableText value={n.etimologia} multiline onChange={(v) => update((d) => {
                const nombre = { ...d.perfil.nombre };
                if (i === 0) nombre.alias = { ...nombre.alias, etimologia: v };
                else nombre.real = { ...nombre.real, etimologia: v };
                return { ...d, perfil: { ...d.perfil, nombre } };
              })} />
            </div>
          </div>
        ))}
      </div>
      <div className={serif.className} style={{ fontSize: 16, fontStyle: "italic", color: C.faint, lineHeight: 1.6, marginBottom: 6 }}>
        <EditableText value={p.nombre.descripcion} multiline onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, descripcion: v } } }))} />
      </div>

      <VSecLabel>A primera vista</VSecLabel>
      <VDivider />
      <Seccion titulo="Lo que se ve" parrafos={p.vista} openAI={openAI}
        onChange={(arr) => update((d) => ({ ...d, perfil: { ...d.perfil, vista: arr } }))} />

      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
        {p.aspecto.map((a, i) => (
          <div key={i} className="vg-row" style={{ padding: "12px 0" }}>
            <div style={labelStyle}>{a.label}</div>
            <div style={{ ...pStyle, fontSize: 13, margin: 0 }}>
              <EditableText value={a.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.aspecto]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, aspecto: arr } }; })} />
            </div>
          </div>
        ))}
      </div>

      <VSecLabel>Por dentro</VSecLabel>
      <VDivider />
      <Seccion titulo="Lo que no cuenta" parrafos={p.interior} openAI={openAI}
        onChange={(arr) => update((d) => ({ ...d, perfil: { ...d.perfil, interior: arr } }))} />

      <VSecLabel>Costumbres y señales · para jugarlo en mesa</VSecLabel>
      <VDivider />
      <div style={{ marginBottom: 10 }}>
        {p.costumbres.map((c, i) => (
          <div key={i} className="vg-row" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0" }}>
            <Flame size={13} color={C.amber} strokeWidth={1.8} style={{ marginTop: 4, flexShrink: 0 }} />
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={c} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.costumbres]; arr[i] = v; return { ...d, perfil: { ...d.perfil, costumbres: arr } }; })} />
            </div>
          </div>
        ))}
      </div>

      <VSecLabel>Relaciones</VSecLabel>
      <VDivider />
      {p.relaciones.map((r, i) => (
        <div key={i} className="vg-row" style={{ padding: "12px 0" }}>
          <div style={labelStyle}>{r.label}</div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={r.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.relaciones]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, relaciones: arr } }; })} />
          </div>
        </div>
      ))}

      <VSecLabel>Para la hoja</VSecLabel>
      <VDivider />
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
        {p.hoja.map((h, i) => (
          <div key={i} className="vg-row" style={{ padding: "12px 0" }}>
            <div style={labelStyle}>{h.label}</div>
            <div style={{ ...pStyle, fontSize: 13, margin: 0 }}>
              <EditableText value={h.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.hoja]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, hoja: arr } }; })} />
            </div>
          </div>
        ))}
      </div>

      <VSecLabel>El arco anímico · privado, sin anunciarlo</VSecLabel>
      <VDivider />
      {p.arco.map((a, i) => (
        <div key={i} className="vg-row" style={{ display: "flex", gap: 18, padding: "14px 0" }}>
          <div className={serif.className} style={{ fontSize: 30, fontWeight: 600, color: i === 0 ? C.amber : C.borderSoft, lineHeight: 1, minWidth: 40 }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{a.fase}</div>
            <VTitle size={18}>{a.titulo}</VTitle>
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={a.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.arco]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, arco: arr } }; })} />
            </div>
          </div>
        </div>
      ))}

      {retratos.length > 0 && (
        <Galeria titulo="Retratos" imagenes={retratos} todas={data.galeria.imagenes}
          portada={data.galeria.portada} update={update} onOpen={onOpen} tipoMundo={false} />
      )}
    </div>
  );
}

// ── Hoja: stats y hechizos, leídos de la ficha real del builder ──
// Fuente única: la misma fila de Supabase que usa la hoja de combate.
function TabHoja({ combateId }: { combateId: string }) {
  const [hoja, setHoja] = useState<{
    ch: BuilderCharacter; derived: Derived; cls: SrdClass; race: SrdRace | null;
    trucos: CombatAction[]; hechizos: CombatAction[]; armas: CombatAction[]; rasgosSub: CombatAction[];
    features: { lvl: number; name: string }[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [ch, srd] = await Promise.all([
          fetch(`/api/characters/${combateId}`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<BuilderCharacter>; }),
          loadAll(),
        ]);
        const cls = srd.classes.find((c) => c.index === ch.classIndex);
        if (!cls) throw new Error("clase no encontrada");
        const race = srd.races.find((r) => r.index === ch.raceIndex) ?? null;
        const armor = srd.armor.find((a) => a.index === ch.armorIndex) ?? null;
        const effects = computeEffects({ clsIndex: cls.index, level: ch.level, hasArmor: !!ch.armorIndex, fightingStyle: ch.fightingStyle, invocations: ch.invocations });
        const derived = computeDerived(ch, cls, race, { armor, shield: ch.shield, acBonus: effects.acBonus });

        const spellIdx = new Map(srd.spells.map((s) => [s.index, s]));
        const trucos: CombatAction[] = [];
        const hechizos: CombatAction[] = [];
        [...ch.cantrips, ...ch.spells].forEach((idx) => {
          const sp = spellIdx.get(idx);
          if (!sp) return;
          const a = spellToAction(sp, derived, ch.level, effects.ebAgonizing);
          (spellSlotLevel(sp) === 0 ? trucos : hechizos).push(a);
        });
        const wEff = { rangedAttackBonus: effects.rangedAttackBonus, meleeAttackBonus: effects.meleeAttackBonus, oneHandedMeleeDmgBonus: effects.oneHandedMeleeDmgBonus, extraAttacks: effects.extraAttacks };
        const armas = (ch.weapons ?? []).flatMap((idx) => {
          const w = srd.weapons.find((x) => x.index === idx);
          return w ? [weaponToAction(w, cls, derived, wEff)] : [];
        });
        const rasgosSub = buildSubclassActions(cls.index, ch.subclassName, ch.level, derived.spellSaveDC, derived.abilityMods);

        const features: { lvl: number; name: string }[] = [];
        for (let L = 1; L <= ch.level; L++) {
          for (const f of cls.levels[String(L)]?.features ?? []) features.push({ lvl: L, name: f });
        }

        if (vivo) setHoja({ ch, derived, cls, race, trucos, hechizos, armas, rasgosSub, features });
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : "error");
      }
    })();
    return () => { vivo = false; };
  }, [combateId]);

  if (error) return <p style={{ ...pStyle, color: "#e07a5f" }}>⚠ No se pudo cargar la ficha ({error}). Probá desde la hoja de combate.</p>;
  if (!hoja) return <p style={{ ...pStyle, color: C.faint }}>Leyendo la ficha...</p>;

  const { ch, derived, race, trucos, hechizos, armas, rasgosSub, features } = hoja;
  const slotLvls = Object.entries(derived.slots).filter(([, n]) => n > 0);

  const num = (label: string, v: string | number) => (
    <div key={label} style={{ textAlign: "center", minWidth: 74 }}>
      <div className={serif.className} style={{ fontSize: 26, fontWeight: 600, color: C.text, lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 9, color: C.steel, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
    </div>
  );

  const Accion = ({ a }: { a: CombatAction }) => (
    <div className="vg-row" style={{ padding: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
        <span className={serif.className} style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{a.nombre}</span>
        <span style={{ fontSize: 10, color: C.amber, letterSpacing: "0.04em" }}>{a.coste}</span>
        <span style={{ fontSize: 10, color: C.faint }}>{a.accion} · {a.alcance}{a.concentracion ? " · concentración" : ""}</span>
      </div>
      <div style={{ ...pStyle, fontSize: 13, margin: 0 }}>{a.queHace}</div>
      <div style={{ fontSize: 11.5, color: C.steelStrong, marginTop: 4 }}>
        {a.tirada.tipo === "ataque" && <>Tirada: 1d20 {fmtMod(a.tirada.bonus)} contra la CA{(a.tirada.rayos ?? 1) > 1 ? ` · ${a.tirada.rayos} rayos` : ""}</>}
        {a.tirada.tipo === "salvacion" && <>El objetivo salva {a.tirada.stat} contra CD {a.tirada.cd}</>}
        {a.tirada.tipo === "ninguna" && (a.tirada.nota ?? "Sin tirada")}
        {a.danos?.length ? <span style={{ color: C.amber }}> · daño {a.danos.map((d) => `${d.cantidad}d${d.caras}${d.modificador ? `+${d.modificador}` : ""} ${d.tipo}`).join(" + ")}</span> : null}
      </div>
    </div>
  );

  return (
    <div>
      <VSecLabel>Números clave</VSecLabel>
      <VDivider />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "18px 10px", justifyContent: "space-between", marginBottom: 8 }}>
        {num("Vida", derived.maxHp)}
        {num("CA", derived.ac)}
        {derived.spellSaveDC !== null ? num("CD conjuros", derived.spellSaveDC) : null}
        {derived.spellAttack !== null ? num("Ataque mágico", fmtMod(derived.spellAttack)) : null}
        {num("Iniciativa", fmtMod(derived.initiative))}
        {num("Competencia", fmtMod(derived.prof))}
        {num("Perc. pasiva", derived.passivePerception)}
      </div>
      {slotLvls.length > 0 && (
        <p style={{ fontSize: 12, color: C.faint, margin: "0 0 4px" }}>
          Espacios de conjuro: {slotLvls.map(([l, n]) => `${n} de nivel ${l}`).join(" · ")}. Se recuperan con descanso {ch.classIndex === "warlock" ? "corto" : "largo"}.
        </p>
      )}

      <VSecLabel>Características y salvaciones</VSecLabel>
      <VDivider />
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 24px" }}>
        {ABILITY_ORDER.map((k) => {
          const sv = derived.saves.find((s) => s.key === k)!;
          return (
            <div key={k} className="vg-row" style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <span className={serif.className} style={{ fontSize: 24, fontWeight: 600, color: C.text, minWidth: 58 }}>
                {ch.abilities[k]} <span style={{ fontSize: 14, color: C.steel }}>({fmtMod(derived.abilityMods[k])})</span>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 11, color: C.muted }}>{ABILITY_ES[k]}</span>
                <span style={{ fontSize: 10.5, color: sv.competente ? C.amber : C.faint }}>salvación {fmtMod(sv.valor)}{sv.competente ? " ●" : ""}</span>
              </span>
            </div>
          );
        })}
      </div>

      <VSecLabel>Habilidades</VSecLabel>
      <VDivider />
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
        {ALL_SKILLS.map((sk) => {
          const comp = ch.skillProf.includes(sk);
          return (
            <div key={sk} className="vg-row" style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}>
              <span style={{ fontSize: 12.5, color: comp ? C.steelStrong : C.faint, fontWeight: comp ? 600 : 400 }}>
                {comp ? "● " : ""}{skillES(sk)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: comp ? C.text : C.faint, fontVariantNumeric: "tabular-nums" }}>
                {fmtMod(skillTotal(ch, derived, sk))}
              </span>
            </div>
          );
        })}
      </div>

      {armas.length > 0 && (<>
        <VSecLabel>Armas</VSecLabel>
        <VDivider />
        {armas.map((a) => <Accion key={a.id} a={a} />)}
      </>)}

      {trucos.length > 0 && (<>
        <VSecLabel>Trucos · gratis e ilimitados</VSecLabel>
        <VDivider />
        {trucos.map((a) => <Accion key={a.id} a={a} />)}
      </>)}

      {hechizos.length > 0 && (<>
        <VSecLabel>Hechizos conocidos</VSecLabel>
        <VDivider />
        {hechizos.map((a) => <Accion key={a.id} a={a} />)}
      </>)}

      {rasgosSub.length > 0 && (<>
        <VSecLabel>Rasgos del patrón</VSecLabel>
        <VDivider />
        {rasgosSub.map((a) => <Accion key={a.id} a={a} />)}
      </>)}

      <VSecLabel>Rasgos de clase y raza</VSecLabel>
      <VDivider />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {features.map((f, i) => (
          <span key={i} style={{ fontSize: 11, color: C.muted, border: `1px solid ${C.borderSoft}`, borderRadius: R, padding: "3px 9px" }}>
            {featureES(f.name)} <span style={{ color: C.faint }}>nv{f.lvl}</span>
          </span>
        ))}
      </div>
      {race?.traits.map((t, i) => (
        <div key={i} className="vg-row" style={{ padding: "9px 0" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.steelStrong }}>{rasgoES(t.name)}: </span>
          <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{rasgoDescES(t.name, t.desc)}</span>
        </div>
      ))}

      <p style={{ fontSize: 12, color: C.faint, marginTop: 28 }}>
        Esta hoja se lee de la ficha real: para tirar dados, gastar espacios o editarla, usá la{" "}
        <a href={`/combate/c/${combateId}`} style={{ color: C.amber }}>hoja de combate</a>.
      </p>
    </div>
  );
}

function TabHistoria({ data, update, openAI }: { data: VaegrantData; update: UpdateFn; openAI: OpenAIFn }) {
  const h = data.historia;
  const [addModal, setAddModal]   = useState(false);
  const [editEntry, setEditEntry] = useState<SessionEntry | null>(null);
  const sesiones = h.sesiones ?? [];

  const guardarSesion = (entry: SessionEntry) => {
    update((d) => {
      const current = d.historia.sesiones ?? [];
      const i = current.findIndex((s) => s.id === entry.id);
      const updated = i >= 0 ? current.map((s, x) => (x === i ? entry : s)) : [entry, ...current];
      return { ...d, historia: { ...d.historia, sesiones: updated } };
    });
  };

  const borrarSesion = (id: string) => {
    if (!window.confirm("¿Borrar esta entrada?")) return;
    update((d) => ({
      ...d,
      historia: { ...d.historia, sesiones: (d.historia.sesiones ?? []).filter((s) => s.id !== id) },
    }));
  };

  return (
    <div>
      <AddSessionModal
        isOpen={addModal || !!editEntry}
        onClose={() => { setAddModal(false); setEditEntry(null); }}
        onSave={guardarSesion}
        existing={editEntry ?? undefined}
        openAI={openAI}
      />

      <VQuote>
        <EditableText value={h.quote} multiline onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, quote: v } }))} />
      </VQuote>

      {/* Registro de sesiones: cola temporal que después se integra al canon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 24 }}>
        <VSecLabel>Registro de sesiones · lo nuevo, antes de integrarlo al canon</VSecLabel>
        <button
          className="vg-btn"
          onClick={() => setAddModal(true)}
          style={{
            padding: "5px 14px", fontSize: 11, fontWeight: 700, borderRadius: R + 1,
            background: C.amber, border: "none", color: "#10151c", cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          ＋ Agregar historia
        </button>
      </div>
      <VDivider />
      {sesiones.length === 0 ? (
        <p style={{ ...pStyle, fontSize: 12.5, color: C.faint, fontStyle: "italic" }}>
          No hay entradas pendientes. Lo que agregues acá queda guardado en la nube hasta que lo integremos a la historia.
        </p>
      ) : (
        sesiones.map((s) => (
          <div key={s.id} className="vg-row" style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: s.tipo === "partida" ? C.amber : C.steel, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {s.tipo === "partida" ? "Partida" : "Personal"}
              </span>
              <span className={serif.className} style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{s.titulo}</span>
              <span style={{ fontSize: 10.5, color: C.faint }}>{[s.sesion, s.fecha].filter(Boolean).join(" · ")}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className="vg-btn" onClick={() => setEditEntry(s)} title="Editar"
                  style={{ fontSize: 10, padding: "2px 8px", borderRadius: R, cursor: "pointer", background: "transparent", color: C.faint, border: `1px solid ${C.borderSoft}` }}>
                  Editar
                </button>
                <button className="vg-btn" onClick={() => borrarSesion(s.id)} title="Borrar"
                  style={{ fontSize: 10, padding: "2px 8px", borderRadius: R, cursor: "pointer", background: "transparent", color: C.faint, border: `1px solid ${C.borderSoft}` }}>
                  ×
                </button>
              </span>
            </div>
            <div style={{ ...pStyle, margin: 0, whiteSpace: "pre-wrap" }}>{s.contenido}</div>
          </div>
        ))
      )}

      <div style={{ marginTop: 28 }} />
      {h.secciones.map((s, i) => (
        <div key={i}>
          {i > 0 && <VDivider />}
          <Seccion
            titulo={s.titulo}
            parrafos={s.parrafos}
            openAI={openAI}
            onChange={(arr) => update((d) => {
              const secs = [...d.historia.secciones];
              secs[i] = { ...secs[i], parrafos: arr };
              return { ...d, historia: { ...d.historia, secciones: secs } };
            })}
          />
        </div>
      ))}
      <div style={{ background: C.subtle, borderRadius: R + 1, borderLeft: `2px solid ${C.borderSoft}`, padding: "12px 16px", marginTop: 8 }}>
        <div style={labelStyle}>Nota de mesa</div>
        <div style={{ ...pStyle, margin: 0, fontStyle: "italic", fontSize: 13 }}>
          <EditableText value={h.notaMesa} multiline onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, notaMesa: v } }))} />
        </div>
      </div>
    </div>
  );
}

function TabMundo({ data, update, openAI, estampas, onOpen }: {
  data: VaegrantData; update: UpdateFn; openAI: OpenAIFn;
  estampas: VImagen[]; onOpen: (idx: number) => void;
}) {
  const m = data.mundo;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <VTitle size={26}>{m.contexto.titulo}</VTitle>
        <VAIBtn onClick={() => openAI(m.contexto.titulo, m.contexto.texto, (t) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: t } } })))} />
      </div>
      <div style={pStyle}>
        <EditableText value={m.contexto.texto} multiline onChange={(v) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: v } } }))} />
      </div>

      <VSecLabel>Lugares</VSecLabel>
      <VDivider />
      {m.lugares.map((l, i) => (
        <div key={i} className="vg-row" style={{ padding: "14px 0", borderLeft: l.destacado ? `2px solid ${C.amber}` : "2px solid transparent", paddingLeft: 14 }}>
          <VTitle size={19}>
            <EditableText value={l.nombre} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], nombre: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </VTitle>
          <div style={{ fontSize: 10, color: C.steel, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <EditableText value={l.tipo} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], tipo: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={l.texto} multiline onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </div>
        </div>
      ))}

      <VSecLabel>Ganchos para el Master</VSecLabel>
      <VDivider />
      {m.ganchos.map((g, i) => (
        <div key={i} className="vg-row" style={{ padding: "12px 0" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.steelStrong, marginBottom: 4 }}>{g.label}</div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={g.texto} multiline onChange={(v) => update((d) => { const arr = [...d.mundo.ganchos]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, ganchos: arr } }; })} />
          </div>
        </div>
      ))}

      {estampas.length > 0 && (
        <Galeria titulo="Estampas de Silverun" imagenes={estampas} todas={data.galeria.imagenes}
          portada={data.galeria.portada} update={update} onOpen={onOpen} tipoMundo={true} />
      )}
    </div>
  );
}
