"use client";

import { useState, useEffect, useCallback } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { VaegrantData, VImagen } from "@/types/vaegrant";
import EditableText from "@/components/EditableText";
import AIModal from "@/components/AIModal";
import ImageLightbox from "@/components/ImageLightbox";
import { Swords, Flame, ArrowLeft } from "lucide-react";

// Display serif propio de esta ruta: la identidad tipográfica de Vaegrant.
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"] });

const TABS = [
  { id: "perfil",   label: "Perfil" },
  { id: "historia", label: "Historia" },
  { id: "mundo",    label: "El mundo" },
  { id: "galeria",  label: "Galería" },
];

// Paleta fría de Vaegrant. El ámbar es la única calidez de la página y se
// reserva para lo que en su historia significa "sentirse real": la vela.
const C = {
  bg: "#10151c",
  bgDeep: "#0b0f15",
  card: "#151c25",
  subtle: "#1a222d",
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

type UpdateFn = (updater: (d: VaegrantData) => VaegrantData) => void;
type OpenAIFn = (title: string, currentText: string, onApply: (t: string) => void) => void;

export default function VaegrantPage() {
  const [data, setData]           = useState<VaegrantData | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving]       = useState(false);
  const [savedMsg, setSavedMsg]   = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
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

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg }}>
        <p style={{ color: C.faint, fontSize: 14 }}>Cargando perfil...</p>
      </div>
    );
  }

  const imagenes = data.galeria.imagenes;
  const portada = imagenes[data.galeria.portada] ?? imagenes[0] ?? null;

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
        .vg-card-hover { transition: border-color 0.2s; }
        .vg-card-hover:hover { border-color: rgba(201,156,90,0.35) !important; }
        .vg-img-card img { transition: opacity 0.15s; }
        .vg-img-card:hover img { opacity: 0.85; }
        @media (max-width: 720px) {
          .vg-hero-inner { flex-direction: column; align-items: flex-start !important; gap: 1rem !important; }
          .vg-grid-2 { grid-template-columns: 1fr !important; }
          .vg-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vg-content { padding: 1.2rem 1rem 3rem !important; }
        }
      `}</style>

      <AIModal
        isOpen={aiModal.open}
        onClose={() => setAiModal((s) => ({ ...s, open: false }))}
        onApply={(text) => { aiModal.onApply(text); setAiModal((s) => ({ ...s, open: false })); }}
        sectionTitle={aiModal.title}
        currentText={aiModal.currentText}
        tipo="personal"
        context={`Personaje: ${data.meta.alias} (${data.meta.nombreReal}), brujo del Archifey en Faerûn después de la Gran Guerra. Tono: melancólico, contenido, sobrio; frases cortas; nada de dramatismo. PROHIBIDO usar la raya larga (—).`}
      />
      {lightboxIdx !== null && imagenes.length > 0 && (
        <ImageLightbox
          images={imagenes.map((i) => i.url)}
          startIndex={lightboxIdx}
          alt={data.meta.alias}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* ══ HERO ══════════════════════════════════ */}
      <div style={{ background: C.bgDeep, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse at 80% 110%, ${C.amberSoft} 0%, transparent 55%), radial-gradient(ellipse at 15% -10%, rgba(141,163,184,0.12) 0%, transparent 60%)`,
        }} />
        <div className="vg-hero-inner" style={{
          maxWidth: 980, margin: "0 auto", padding: "28px 2rem 24px",
          position: "relative", display: "flex", gap: "1.8rem", alignItems: "flex-end",
        }}>
          {/* Retrato o estado vacío */}
          <div style={{ flexShrink: 0 }}>
            {portada ? (
              <div onClick={() => setLightboxIdx(data.galeria.portada < imagenes.length ? data.galeria.portada : 0)} title="Ver galería" style={{ cursor: "zoom-in" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portada.url}
                  alt={data.meta.alias}
                  style={{
                    width: 175, height: 225, objectFit: "cover", objectPosition: "top center",
                    borderRadius: 10, border: `1px solid ${C.border}`, display: "block",
                  }}
                />
              </div>
            ) : (
              <button
                className="vg-btn"
                onClick={() => setActiveTab("galeria")}
                style={{
                  width: 175, height: 225, borderRadius: 10,
                  border: `1px dashed rgba(141,163,184,0.35)`, background: "rgba(141,163,184,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 10, cursor: "pointer", color: C.faint, padding: 14,
                }}
                title="Ir a la galería"
              >
                <Flame size={22} color={C.amber} strokeWidth={1.6} />
                <span style={{ fontSize: 11, lineHeight: 1.5, textAlign: "center" }}>
                  Sin retrato todavía.<br />En la Galería están los prompts<br />para generarlo.
                </span>
              </button>
            )}
          </div>

          {/* Identidad */}
          <div style={{ flex: 1, paddingBottom: 2 }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: C.steel, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
              <EditableText value={data.meta.eyebrow} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, eyebrow: v } }))} />
            </p>
            <h1 className={serif.className} style={{ fontSize: 46, fontWeight: 600, color: C.text, lineHeight: 1, letterSpacing: "0.01em", margin: 0 }}>
              <EditableText value={data.meta.alias} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, alias: v } }))} />
            </h1>
            {/* El nombre real: un reflejo que tarda en aparecer */}
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
                <span key={i} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 500, background: "rgba(141,163,184,0.10)", color: C.muted, border: `1px solid ${C.border}` }}>
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
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", scrollbarWidth: "none" }}>
          <div style={{ display: "flex" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {savedMsg && <span style={{ fontSize: 11, fontWeight: savedMsg.startsWith("⚠") ? 600 : 400, color: savedMsg.startsWith("⚠") ? "#e07a5f" : C.steel }}>{savedMsg}</span>}
            <a href="/" title="Volver al perfil de Naevara" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: C.faint, textDecoration: "none", whiteSpace: "nowrap" }}>
              <ArrowLeft size={12} /> Naevara
            </a>
            <a
              href={`/combate/c/${data.combateId}`}
              style={{
                padding: "5px 14px", fontSize: 11, fontWeight: 700,
                background: "linear-gradient(135deg, #46586b, #2a3644)",
                border: `1px solid ${C.border}`, borderRadius: 7, color: "#fff",
                textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5,
              }}
              title="Abrir la hoja de combate de Vaegrant"
            >
              <Swords size={13} strokeWidth={2.4} /> Hoja de combate
            </a>
            <button
              className="vg-btn"
              onClick={() => save(data)}
              disabled={saving}
              style={{
                padding: "5px 14px", fontSize: 11, fontWeight: 600,
                background: saving ? "transparent" : C.steel,
                border: saving ? `1px solid ${C.steel}` : "none",
                borderRadius: 7, color: saving ? C.steel : "#10151c",
                cursor: saving ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}
            >
              {saving ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENIDO ═════════════════════════════ */}
      <div className="vg-content" style={{ maxWidth: 980, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        {activeTab === "perfil"   && <TabPerfil   data={data} update={update} openAI={openAI} />}
        {activeTab === "historia" && <TabHistoria data={data} update={update} openAI={openAI} />}
        {activeTab === "mundo"    && <TabMundo    data={data} update={update} openAI={openAI} />}
        {activeTab === "galeria"  && <TabGaleria  data={data} update={update} onOpen={(i) => setLightboxIdx(i)} />}
      </div>
    </div>
  );
}

// ── Piezas de UI ─────────────────────────────────────────────────

function VCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="vg-card-hover" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function VSecLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.14em", margin: "22px 0 10px" }}>
      {children}
    </p>
  );
}

function VTitle({ children }: { children: React.ReactNode }) {
  return <h3 className={serif.className} style={{ fontSize: 21, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>{children}</h3>;
}

function VQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className={serif.className} style={{
      fontSize: 20, fontStyle: "italic", color: C.muted, lineHeight: 1.45,
      borderLeft: `2px solid ${C.amber}`, margin: "6px 0 20px", padding: "4px 0 4px 16px",
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
        background: C.amberSoft, color: C.amber, border: `1px solid rgba(201,156,90,0.3)`,
        borderRadius: 6, cursor: "pointer", flexShrink: 0,
      }}
    >
      ✦ IA
    </button>
  );
}

const pStyle: React.CSSProperties = { fontSize: 13.5, color: C.muted, lineHeight: 1.65, margin: "0 0 10px" };

// Editor de una lista de párrafos con un botón de IA por sección
function Parrafos({ titulo, parrafos, onChange, openAI }: {
  titulo: string; parrafos: string[];
  onChange: (p: string[]) => void; openAI: OpenAIFn;
}) {
  return (
    <VCard>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <VTitle>{titulo}</VTitle>
        <VAIBtn onClick={() => openAI(titulo, parrafos.join("\n\n"), (t) => onChange(t.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean)))} />
      </div>
      {parrafos.map((p, i) => (
        <div key={i} style={pStyle}>
          <EditableText value={p} multiline onChange={(v) => { const arr = [...parrafos]; arr[i] = v; onChange(arr); }} />
        </div>
      ))}
    </VCard>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────

function TabPerfil({ data, update, openAI }: { data: VaegrantData; update: UpdateFn; openAI: OpenAIFn }) {
  const p = data.perfil;
  return (
    <div>
      <VQuote>
        <EditableText value={p.quote} multiline onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, quote: v } }))} />
      </VQuote>

      <VSecLabel>El nombre</VSecLabel>
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {([p.nombre.alias, p.nombre.real] as const).map((n, i) => (
          <VCard key={i} style={{ marginBottom: 0, borderLeft: i === 1 ? `2px solid ${C.amber}` : undefined }}>
            <div className={serif.className} style={{ fontSize: 22, fontWeight: 600, color: i === 1 ? C.steelStrong : C.text, marginBottom: 6, fontStyle: i === 1 ? "italic" : "normal" }}>
              {n.palabra}
            </div>
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={n.etimologia} multiline onChange={(v) => update((d) => {
                const nombre = { ...d.perfil.nombre };
                if (i === 0) nombre.alias = { ...nombre.alias, etimologia: v };
                else nombre.real = { ...nombre.real, etimologia: v };
                return { ...d, perfil: { ...d.perfil, nombre } };
              })} />
            </div>
          </VCard>
        ))}
      </div>
      <VCard style={{ background: C.subtle }}>
        <div style={{ ...pStyle, margin: 0, fontStyle: "italic" }}>
          <EditableText value={p.nombre.descripcion} multiline onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, descripcion: v } } }))} />
        </div>
      </VCard>

      <VSecLabel>A primera vista</VSecLabel>
      <Parrafos titulo="Lo que se ve" parrafos={p.vista} openAI={openAI}
        onChange={(arr) => update((d) => ({ ...d, perfil: { ...d.perfil, vista: arr } }))} />

      <VSecLabel>Aspecto</VSecLabel>
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {p.aspecto.map((a, i) => (
          <VCard key={i} style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{a.label}</div>
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={a.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.aspecto]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, aspecto: arr } }; })} />
            </div>
          </VCard>
        ))}
      </div>

      <VSecLabel>Por dentro</VSecLabel>
      <Parrafos titulo="Lo que no cuenta" parrafos={p.interior} openAI={openAI}
        onChange={(arr) => update((d) => ({ ...d, perfil: { ...d.perfil, interior: arr } }))} />

      <VSecLabel>Costumbres y señales · para jugarlo en mesa</VSecLabel>
      <VCard>
        {p.costumbres.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0" }}>
            <Flame size={13} color={C.amber} strokeWidth={1.8} style={{ marginTop: 3, flexShrink: 0 }} />
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={c} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.costumbres]; arr[i] = v; return { ...d, perfil: { ...d.perfil, costumbres: arr } }; })} />
            </div>
          </div>
        ))}
      </VCard>

      <VSecLabel>Relaciones</VSecLabel>
      {p.relaciones.map((r, i) => (
        <VCard key={i}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.steelStrong, marginBottom: 5 }}>{r.label}</div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={r.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.relaciones]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, relaciones: arr } }; })} />
          </div>
        </VCard>
      ))}

      <VSecLabel>Para la hoja</VSecLabel>
      <div className="vg-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {p.hoja.map((h, i) => (
          <VCard key={i} style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{h.label}</div>
            <div style={{ ...pStyle, margin: 0 }}>
              <EditableText value={h.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.hoja]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, hoja: arr } }; })} />
            </div>
          </VCard>
        ))}
      </div>

      <VSecLabel>El arco anímico · privado, sin anunciarlo</VSecLabel>
      {p.arco.map((a, i) => (
        <VCard key={i} style={{ borderLeft: i === 0 ? `2px solid ${C.amber}` : `2px solid ${C.borderSoft}` }}>
          <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{a.fase}</div>
          <VTitle>{a.titulo}</VTitle>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={a.texto} multiline onChange={(v) => update((d) => { const arr = [...d.perfil.arco]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, arco: arr } }; })} />
          </div>
        </VCard>
      ))}
    </div>
  );
}

function TabHistoria({ data, update, openAI }: { data: VaegrantData; update: UpdateFn; openAI: OpenAIFn }) {
  const h = data.historia;
  return (
    <div>
      <VQuote>
        <EditableText value={h.quote} multiline onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, quote: v } }))} />
      </VQuote>
      {h.secciones.map((s, i) => (
        <Parrafos
          key={i}
          titulo={s.titulo}
          parrafos={s.parrafos}
          openAI={openAI}
          onChange={(arr) => update((d) => {
            const secs = [...d.historia.secciones];
            secs[i] = { ...secs[i], parrafos: arr };
            return { ...d, historia: { ...d.historia, secciones: secs } };
          })}
        />
      ))}
      <VCard style={{ background: C.subtle }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.steel, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Nota de mesa</div>
        <div style={{ ...pStyle, margin: 0, fontStyle: "italic" }}>
          <EditableText value={h.notaMesa} multiline onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, notaMesa: v } }))} />
        </div>
      </VCard>
    </div>
  );
}

function TabMundo({ data, update, openAI }: { data: VaegrantData; update: UpdateFn; openAI: OpenAIFn }) {
  const m = data.mundo;
  return (
    <div>
      <VSecLabel>Contexto</VSecLabel>
      <VCard>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <VTitle>{m.contexto.titulo}</VTitle>
          <VAIBtn onClick={() => openAI(m.contexto.titulo, m.contexto.texto, (t) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: t } } })))} />
        </div>
        <div style={{ ...pStyle, margin: 0 }}>
          <EditableText value={m.contexto.texto} multiline onChange={(v) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: v } } }))} />
        </div>
      </VCard>

      <VSecLabel>Lugares</VSecLabel>
      {m.lugares.map((l, i) => (
        <VCard key={i} style={{ borderLeft: l.destacado ? `2px solid ${C.amber}` : undefined }}>
          <VTitle>
            <EditableText value={l.nombre} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], nombre: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </VTitle>
          <div style={{ fontSize: 10.5, color: C.steel, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <EditableText value={l.tipo} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], tipo: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={l.texto} multiline onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
          </div>
        </VCard>
      ))}

      <VSecLabel>Ganchos para el Master</VSecLabel>
      {m.ganchos.map((g, i) => (
        <VCard key={i}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.steelStrong, marginBottom: 5 }}>{g.label}</div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={g.texto} multiline onChange={(v) => update((d) => { const arr = [...d.mundo.ganchos]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, ganchos: arr } }; })} />
          </div>
        </VCard>
      ))}
    </div>
  );
}

function TabGaleria({ data, update, onOpen }: { data: VaegrantData; update: UpdateFn; onOpen: (i: number) => void }) {
  const [copiado, setCopiado]   = useState<number | null>(null);
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [nuevaNota, setNuevaNota] = useState("");

  const copiar = (i: number, texto: string) => {
    // Cada prompt se copia completo: identidad visual + escena, listo para GPT.
    navigator.clipboard.writeText(`${data.galeria.estiloBase}\n\n${texto}`).then(() => {
      setCopiado(i);
      setTimeout(() => setCopiado((c) => (c === i ? null : c)), 2000);
    });
  };

  const agregar = () => {
    const url = nuevaUrl.trim();
    if (!url) return;
    const nueva: VImagen = { url, prompt: nuevaNota.trim() || "Imagen de Vaegrant", fecha: new Date().toISOString().slice(0, 10) };
    update((d) => ({ ...d, galeria: { ...d.galeria, imagenes: [...d.galeria.imagenes, nueva] } }));
    setNuevaUrl("");
    setNuevaNota("");
  };

  return (
    <div>
      <VSecLabel>Identidad visual · la base de todos los prompts</VSecLabel>
      <VCard>
        <div style={{ ...pStyle, margin: 0 }}>
          <EditableText
            value={data.galeria.estiloBase}
            multiline
            onChange={(v) => update((d) => ({ ...d, galeria: { ...d.galeria, estiloBase: v } }))}
          />
        </div>
      </VCard>

      <VSecLabel>Prompts para generar en GPT · copiá y pegá de a uno</VSecLabel>
      <p style={{ fontSize: 11.5, color: C.faint, margin: "0 0 12px", lineHeight: 1.5 }}>
        El botón Copiar arma el prompt completo (identidad visual + escena). Generá primero el retrato principal y
        adjuntalo en los siguientes pedidos con &quot;mismo personaje que en la imagen adjunta&quot; para mantener consistencia.
        También están en el repo, en <code style={{ color: C.steel }}>Vaegrant_Prompts.md</code>.
      </p>
      {data.galeria.prompts.map((pr, i) => (
        <VCard key={i}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.steelStrong }}>{pr.titulo}</div>
            <button
              className="vg-btn"
              onClick={() => copiar(i, pr.prompt)}
              style={{
                padding: "3px 12px", fontSize: 10.5, fontWeight: 700, borderRadius: 6, cursor: "pointer",
                background: copiado === i ? C.amberSoft : C.amber,
                color: copiado === i ? C.amber : "#10151c",
                border: copiado === i ? "1px solid rgba(201,156,90,0.3)" : "none",
                flexShrink: 0,
              }}
            >
              {copiado === i ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
          <div style={{ ...pStyle, margin: 0 }}>
            <EditableText value={pr.prompt} multiline onChange={(v) => update((d) => { const arr = [...d.galeria.prompts]; arr[i] = { ...arr[i], prompt: v }; return { ...d, galeria: { ...d.galeria, prompts: arr } }; })} />
          </div>
        </VCard>
      ))}

      <VSecLabel>Agregar imagen</VSecLabel>
      <VCard>
        <p style={{ fontSize: 11.5, color: C.faint, margin: "0 0 10px", lineHeight: 1.5 }}>
          Pegá la URL de una imagen ya generada (o una ruta local como <code style={{ color: C.steel }}>/vaegrant-1.png</code> si
          el archivo está en <code style={{ color: C.steel }}>/public</code> del repo).
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={nuevaUrl}
            onChange={(e) => setNuevaUrl(e.target.value)}
            placeholder="https://... o /vaegrant-1.png"
            style={{ flex: "2 1 260px", background: C.subtle, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontFamily: "inherit" }}
          />
          <input
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Nota (ej: La vela, v2)"
            style={{ flex: "1 1 160px", background: C.subtle, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontFamily: "inherit" }}
          />
          <button
            className="vg-btn"
            onClick={agregar}
            disabled={!nuevaUrl.trim()}
            style={{
              padding: "8px 18px", fontSize: 12, fontWeight: 700, borderRadius: 8,
              background: nuevaUrl.trim() ? C.amber : "transparent",
              border: nuevaUrl.trim() ? "none" : `1px solid ${C.border}`,
              color: nuevaUrl.trim() ? "#10151c" : C.faint,
              cursor: nuevaUrl.trim() ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <Flame size={13} strokeWidth={2.2} /> Agregar
          </button>
        </div>
      </VCard>

      <VSecLabel>Galería ({data.galeria.imagenes.length})</VSecLabel>
      {data.galeria.imagenes.length === 0 ? (
        <VCard style={{ textAlign: "center", padding: "34px 18px" }}>
          <Flame size={20} color={C.amber} strokeWidth={1.6} style={{ marginBottom: 8 }} />
          <p style={{ ...pStyle, margin: 0, color: C.faint }}>
            Todavía no hay imágenes. Generá el retrato en GPT con los prompts de arriba y agregalo acá: la primera imagen se convierte en el retrato del perfil.
          </p>
        </VCard>
      ) : (
        <div className="vg-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {data.galeria.imagenes.map((img, i) => (
            <div key={i} className="vg-img-card" style={{ background: C.card, border: `1px solid ${data.galeria.portada === i ? "rgba(201,156,90,0.5)" : C.border}`, borderRadius: 10, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.prompt}
                onClick={() => onOpen(i)}
                style={{ width: "100%", aspectRatio: "2 / 3", objectFit: "cover", display: "block", cursor: "zoom-in" }}
              />
              <div style={{ padding: "8px 10px" }}>
                <p style={{ fontSize: 10.5, color: C.faint, margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {img.prompt}
                </p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    className="vg-btn"
                    onClick={() => update((d) => ({ ...d, galeria: { ...d.galeria, portada: i } }))}
                    disabled={data.galeria.portada === i}
                    style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 5, cursor: data.galeria.portada === i ? "default" : "pointer",
                      background: data.galeria.portada === i ? C.amberSoft : "transparent",
                      color: data.galeria.portada === i ? C.amber : C.faint,
                      border: `1px solid ${data.galeria.portada === i ? "rgba(201,156,90,0.3)" : C.border}`,
                    }}
                  >
                    {data.galeria.portada === i ? "Retrato actual" : "Usar de retrato"}
                  </button>
                  <button
                    className="vg-btn"
                    onClick={() => {
                      if (!window.confirm("¿Quitar esta imagen de la galería?")) return;
                      update((d) => {
                        const imgs = d.galeria.imagenes.filter((_, x) => x !== i);
                        const portada = Math.min(d.galeria.portada, Math.max(0, imgs.length - 1));
                        return { ...d, galeria: { ...d.galeria, imagenes: imgs, portada } };
                      });
                    }}
                    style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, cursor: "pointer", background: "transparent", color: C.faint, border: `1px solid ${C.border}` }}
                  >
                    Quitar
                  </button>
                  <span style={{ fontSize: 9.5, color: C.faint, marginLeft: "auto" }}>{img.fecha}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
