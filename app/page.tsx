"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { CharacterData, SessionEntry, Spell } from "@/types/character";
import EditableText from "@/components/EditableText";
import EditableNumber from "@/components/EditableNumber";
import AIModal from "@/components/AIModal";
import ImageLightbox from "@/components/ImageLightbox";
import AddSessionModal from "@/components/AddSessionModal";
import FloatingProfile from "@/components/FloatingProfile";
import SpellDiceRoller from "@/components/SpellDiceRoller";
import { Sparkles, Swords } from "lucide-react";

// Galería de Naevara (imagen 0 = principal). Para sumar imágenes, agregá el
// archivo a /public y su ruta acá, en orden.
const GALLERY = [
  "/naevara-0.png", "/naevara-1.png", "/naevara-3.png", "/naevara-4.png",
  "/naevara-5.png", "/naevara-6.png", "/naevara-7.png", "/naevara-8.png",
  "/naevara-9.png", "/naevara-10.png",
];

const TABS = [
  { id: "perfil",    label: "Perfil" },
  { id: "stats",     label: "Stats y combate" },
  { id: "hechizos",  label: "Hechizos" },
  { id: "historia",  label: "Historia y arco" },
  { id: "mundo",     label: "El mundo" },
  { id: "master",    label: "Ideas para la campaña" },
];

export default function Home() {
  const [data, setData]             = useState<CharacterData | null>(null);
  const [activeTab, setActiveTab]   = useState("perfil");
  const [saving, setSaving]         = useState(false);
  const [savedMsg, setSavedMsg]     = useState("");
  const [galleryIdx, setGalleryIdx]     = useState<number | null>(null);
  const [floatVisible, setFloatVisible] = useState(false);
  const [historiaModal, setHistoriaModal] = useState(false);
  const [aiModal, setAiModal]           = useState<{
    open: boolean; title: string; currentText: string; onApply: (t: string) => void;
  }>({ open: false, title: "", currentText: "", onApply: () => {} });

  // Cargar datos
  useEffect(() => {
    fetch("/api/save").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  // Floating profile: show after scrolling past the hero (~260px)
  useEffect(() => {
    const onScroll = () => setFloatVisible(window.scrollY > 240);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const save = useCallback(async (d: CharacterData) => {
    setSaving(true);
    try {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      setSavedMsg("Guardado ✓");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch {
      setSavedMsg("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    (updater: (d: CharacterData) => CharacterData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save]
  );

  const openAI = useCallback(
    (title: string, currentText: string, onApply: (t: string) => void) => {
      setAiModal({ open: true, title, currentText, onApply });
    },
    []
  );

  // Guardar entrada de historia — disparable desde el botón flotante (cualquier tab)
  const saveSessionGlobal = useCallback((entry: SessionEntry) => {
    update((d) => {
      const current = d.historia.sesiones ?? [];
      const idx = current.findIndex((s) => s.id === entry.id);
      const updated = idx >= 0
        ? current.map((s, i) => (i === idx ? entry : s))
        : [entry, ...current];
      return { ...d, historia: { ...d.historia, sesiones: updated } };
    });
  }, [update]);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>

      {/* ── Modales globales ─────────────────── */}
      <AIModal
        isOpen={aiModal.open}
        onClose={() => setAiModal((s) => ({ ...s, open: false }))}
        onApply={(text) => { aiModal.onApply(text); setAiModal((s) => ({ ...s, open: false })); }}
        sectionTitle={aiModal.title}
        currentText={aiModal.currentText}
        context={`Personaje: ${data.meta.firstName} ${data.meta.lastName}, ${data.meta.eyebrow}`}
      />
      {galleryIdx !== null && (
        <ImageLightbox images={GALLERY} startIndex={galleryIdx} alt="Naevara Tirael" onClose={() => setGalleryIdx(null)} />
      )}
      <AddSessionModal
        isOpen={historiaModal}
        onClose={() => setHistoriaModal(false)}
        onSave={saveSessionGlobal}
        openAI={openAI}
      />

      {/* ══ HERO (scrolls away) ══════════════════ */}
      <div>

        {/* Hero */}
        <div style={{ background: "#1a1830", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 70% 0%, rgba(76,66,160,0.55) 0%, transparent 60%), radial-gradient(ellipse at 10% 100%, rgba(38,33,92,0.6) 0%, transparent 50%)",
            opacity: 0.6, pointerEvents: "none",
          }} />
          <div
            className="hero-inner"
            style={{
              maxWidth: 980, margin: "0 auto",
              padding: "24px 2rem 0",
              position: "relative",
              display: "flex", gap: "1.8rem", alignItems: "flex-end",
            }}
          >
            {/* Imagen (clickeable) */}
            <div className="hero-image-wrap" style={{ flexShrink: 0 }}>
              <div
                onClick={() => setGalleryIdx(0)}
                title="Ver galería"
                style={{ cursor: "zoom-in", position: "relative" }}
              >
                <Image
                  src={GALLERY[0]}
                  alt="Naevara Tirael"
                  width={190}
                  height={240}
                  style={{
                    width: 190, height: 240,
                    objectFit: "cover", objectPosition: "top center",
                    borderRadius: "12px 12px 0 0",
                    border: "1px solid rgba(175,169,236,0.3)",
                    borderBottom: "none",
                    display: "block",
                    transition: "opacity 0.15s",
                  }}
                  priority
                />
                <div style={{
                  position: "absolute", inset: 0,
                  borderRadius: "10px 10px 0 0",
                  background: "rgba(127,119,221,0)",
                  transition: "background 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(127,119,221,0.18)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(127,119,221,0)"; }}
                >
                  <span style={{ fontSize: 22, opacity: 0.8, color: "#fff", display: "none" }}>🔍</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="hero-info" style={{ flex: 1, paddingBottom: "1rem" }}>
              {/* Eyebrow */}
              <p style={{ fontSize: 10, fontWeight: 500, color: "#AFA9EC", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                <EditableText value={data.meta.eyebrow} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, eyebrow: v } }))} className="text-[#AFA9EC]" />
              </p>
              {/* Nombre */}
              <h1 className="hero-name" style={{ fontSize: 32, fontWeight: 500, color: "#fff", letterSpacing: "0.01em", lineHeight: 1.1, marginBottom: 2 }}>
                <EditableText value={data.meta.firstName} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, firstName: v } }))} className="text-white" />
                {" "}<span style={{ color: "#AFA9EC" }}>
                  <EditableText value={data.meta.lastName} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, lastName: v } }))} className="text-[#AFA9EC]" />
                </span>
              </h1>
              {/* Subtítulo */}
              <div style={{ fontSize: 11, color: "#AFA9EC", marginBottom: 10, lineHeight: 1.5 }}>
                <EditableText value={data.meta.subtitle} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, subtitle: v } }))} className="text-[#AFA9EC]" />
                <br />
                <EditableText value={data.meta.subsubtitle} onChange={(v) => update((d) => ({ ...d, meta: { ...d.meta, subsubtitle: v } }))} className="text-[#AFA9EC]" />
              </div>
              {/* Tags */}
              <div className="hero-tags" style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                {data.meta.tags.map((tag, i) => (
                  <span key={i} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, fontWeight: 500, background: "rgba(255,255,255,0.08)", color: "#ccc", border: "1px solid rgba(255,255,255,0.15)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              {/* Hero stats */}
              <div className="hero-stats-row" style={{ display: "flex", gap: 18, alignItems: "center" }}>
                {data.heroStats.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    {i > 0 && <div style={{ width: 1, background: "rgba(255,255,255,0.15)", height: 28 }} />}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: "#fff", lineHeight: 1 }}>
                        <EditableText value={s.value} onChange={(v) => update((d) => { const hs = [...d.heroStats]; hs[i] = { ...hs[i], value: v }; return { ...d, heroStats: hs }; })} className="text-white" />
                      </div>
                      <div style={{ fontSize: 9, color: "#AFA9EC", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ══ FIN HERO ══════════════════════════════ */}

      {/* ══ STICKY: SOLO TABS ════════════════════ */}
      <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
        {/* Tabs bar */}
        <div style={{ background: "#1a1830", borderBottom: "1px solid rgba(175,169,236,0.2)" }}>
          <div
            className="tabs-inner"
            style={{ maxWidth: 980, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", scrollbarWidth: "none" }}
          >
            <div style={{ display: "flex" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "12px 16px", fontSize: 12, fontWeight: 500,
                    color: activeTab === tab.id ? "#CECBF6" : "var(--text-muted)",
                    background: "transparent", border: "none", cursor: "pointer",
                    borderBottom: activeTab === tab.id ? "2px solid #7F77DD" : "2px solid transparent",
                    whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 2, flexShrink: 0 }}>
              {savedMsg && <span style={{ fontSize: 11, color: "#7F77DD" }} className="save-flash">{savedMsg}</span>}
              <button
                onClick={() => save(data)}
                disabled={saving}
                style={{
                  padding: "5px 14px", fontSize: 11, fontWeight: 600,
                  background: saving ? "transparent" : "#7F77DD",
                  border: saving ? "1px solid #7F77DD" : "none",
                  borderRadius: 7, color: saving ? "#7F77DD" : "#fff",
                  cursor: saving ? "not-allowed" : "pointer", transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {saving ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ══ FIN STICKY (tabs) ════════════════════ */}

      {/* ── Floating profile sidebar ───────────── */}
      <FloatingProfile
        visible={floatVisible}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Scroll just below sticky header (~230px)
          window.scrollTo({ top: 235, behavior: "smooth" });
        }}
        onAddHistoria={() => { setActiveTab("historia"); setHistoriaModal(true); }}
        imageSrc={GALLERY[0]}
        firstName={data.meta.firstName}
        lastName={data.meta.lastName}
      />

      {/* Contenido */}
      <div className="page-content" style={{ maxWidth: 980, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
        {activeTab === "perfil"   && <TabPerfil   data={data} update={update} openAI={openAI} openGallery={(i) => setGalleryIdx(i)} />}
        {activeTab === "stats"    && <TabStats    data={data} update={update} />}
        {activeTab === "hechizos" && <TabHechizos data={data} update={update} openAI={openAI} />}
        {activeTab === "historia" && <TabHistoria data={data} update={update} openAI={openAI} />}
        {activeTab === "mundo"    && <TabMundo    data={data} update={update} openAI={openAI} />}
        {activeTab === "master"   && <TabMaster   data={data} update={update} openAI={openAI} />}
      </div>
    </div>
  );
}

// ══ HELPERS VISUALES ════════════════════════════════════════════

function Card({ children, featured = false, style: extraStyle }: {
  children: React.ReactNode; featured?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 12, padding: "16px 20px", marginBottom: 14,
      border: featured ? "2px solid #7F77DD" : "1px solid var(--border)",
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>
      {children}
    </p>
  );
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="sec-label" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.18em", margin: "26px 0 12px", paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
      {children}
    </p>
  );
}

function VRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-soft)", alignItems: "flex-start" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#AFA9EC", flexShrink: 0, marginTop: 5 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>{label}</p>
        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{children}</div>
      </div>
    </div>
  );
}

function TRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>{label}</p>
      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-subtle)", borderRadius: 8, padding: "10px 13px", marginTop: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderLeft: "2px solid #7F77DD", padding: "10px 14px", borderRadius: "0 8px 8px 0", background: "var(--accent-bg)", marginTop: 12 }}>
      <p style={{ fontSize: 13, color: "var(--accent-strong)", fontStyle: "italic", lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

function AIButton({ onClick, label = "✦ IA" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 8, background: "var(--accent-bg)", color: "var(--accent-strong)", border: "1px solid var(--accent-border)", cursor: "pointer", fontWeight: 500, marginLeft: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
      {label}
    </button>
  );
}

function SpellCard({ spell }: { spell: Spell }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <div style={{
        background: "var(--bg-subtle)", borderRadius: 8, padding: "10px 12px",
        border: spell.destacado ? "1.5px solid #7F77DD" : "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "var(--accent-bg)", color: "var(--accent-strong)", fontWeight: 500, display: "inline-block", marginBottom: 5 }}>
              {spell.badge}
            </span>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)", margin: "0 0 3px" }}>{spell.nombre}</p>
            <p style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.45, margin: 0 }}>{spell.descripcion}</p>
          </div>
          {spell.dado && (
            <button
              onClick={() => setModalOpen(true)}
              title="Usar hechizo"
              style={{
                flexShrink: 0,
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                background: "var(--accent-bg)",
                color: "var(--accent-strong)",
                border: "1px solid var(--accent-border)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1830"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "transparent"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-bg)"; e.currentTarget.style.color = "var(--accent-strong)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
            >
              🎲 Usar
            </button>
          )}
        </div>
      </div>

      {/* Modal — rendered via portal-style outside the card */}
      {modalOpen && spell.dado && (
        <SpellDiceRoller
          dado={spell.dado}
          spellName={spell.nombre}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ══ TAB PERFIL ══════════════════════════════════════════════════

type UpdateFn = (fn: (d: CharacterData) => CharacterData) => void;
type OpenAIFn = (title: string, currentText: string, onApply: (t: string) => void) => void;

function TabPerfil({ data, update, openAI, openGallery }: { data: CharacterData; update: UpdateFn; openAI: OpenAIFn; openGallery: (i: number) => void }) {
  const p = data.perfil;
  return (
    <div>
      <SecLabel>Galería</SecLabel>
      <div className="gallery-grid">
        {GALLERY.map((src, i) => (
          <button
            key={i}
            onClick={() => openGallery(i)}
            title={i === 0 ? "Imagen principal" : `Imagen ${i}`}
            style={{
              position: "relative", padding: 0, cursor: "pointer", overflow: "hidden",
              borderRadius: 10, aspectRatio: "4 / 5", background: "var(--bg-subtle)",
              border: i === 0 ? "1.5px solid var(--accent)" : "1px solid var(--border)",
            }}
          >
            <Image src={src} alt={`Naevara ${i}`} width={220} height={275} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {i === 0 && (
              <span style={{ position: "absolute", top: 6, left: 6, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "rgba(142,133,242,0.92)", color: "#fff", letterSpacing: "0.05em" }}>
                Principal
              </span>
            )}
          </button>
        ))}
      </div>

      <SecLabel>Identidad y nombre</SecLabel>
      <Card>
        {[
          { word: p.nombre.naevara.palabra, etim: p.nombre.naevara.etimologia, key: "naevara" as const },
          { word: p.nombre.tirael.palabra,  etim: p.nombre.tirael.etimologia,  key: "tirael"  as const },
        ].map(({ word, etim, key }) => (
          <div key={key} style={{ borderBottom: "1px solid var(--border-soft)", paddingBottom: 10, marginBottom: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)", marginBottom: 3 }}>{word}</p>
            <EditableText value={etim} onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, [key]: { ...d.perfil.nombre[key], etimologia: v } } } }))} multiline className="text-sm text-gray-500" />
          </div>
        ))}
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent-strong)", fontStyle: "italic", marginBottom: 6 }}>
            &ldquo;<EditableText value={p.nombre.combinado} onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, combinado: v } } }))} className="text-[var(--accent-strong)]" />&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <EditableText value={p.nombre.descripcion} onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, descripcion: v } } }))} multiline className="text-sm text-gray-500 flex-1" />
            <AIButton onClick={() => openAI("Descripción del nombre", p.nombre.descripcion, (t) => update((d) => ({ ...d, perfil: { ...d.perfil, nombre: { ...d.perfil.nombre, descripcion: t } } })))} />
          </div>
        </div>
      </Card>

      <SecLabel>Aspecto físico</SecLabel>
      <div className="grid-2col">
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Rasgos físicos</CardTitle>
          {p.aspecto.rasgos.map((r, i) => (
            <VRow key={i} label={r.label}>
              <EditableText value={r.texto} onChange={(v) => update((d) => { const arr = [...d.perfil.aspecto.rasgos]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, aspecto: { ...d.perfil.aspecto, rasgos: arr } } }; })} multiline />
            </VRow>
          ))}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Estilo y presencia</CardTitle>
          {p.aspecto.estilo.map((r, i) => (
            <VRow key={i} label={r.label}>
              <EditableText value={r.texto} onChange={(v) => update((d) => { const arr = [...d.perfil.aspecto.estilo]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, aspecto: { ...d.perfil.aspecto, estilo: arr } } }; })} multiline />
            </VRow>
          ))}
        </Card>
      </div>

      <SecLabel>Personalidad</SecLabel>
      <div className="grid-2col">
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Rasgos y valores</CardTitle>
          {p.personalidad.rasgos.map((r, i) => (
            <TRow key={i} label={r.label}>
              <EditableText value={r.texto} onChange={(v) => update((d) => { const arr = [...d.perfil.personalidad.rasgos]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, personalidad: { ...d.perfil.personalidad, rasgos: arr } } }; })} multiline />
            </TRow>
          ))}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Relaciones y fe</CardTitle>
          {p.personalidad.relaciones.map((r, i) => (
            <TRow key={i} label={r.label}>
              <EditableText value={r.texto} onChange={(v) => update((d) => { const arr = [...d.perfil.personalidad.relaciones]; arr[i] = { ...arr[i], texto: v }; return { ...d, perfil: { ...d.perfil, personalidad: { ...d.perfil.personalidad, relaciones: arr } } }; })} multiline />
            </TRow>
          ))}
        </Card>
      </div>

      <SecLabel>Equipamiento</SecLabel>
      <Card>
        <CardTitle>Inventario inicial</CardTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            {p.equipamiento.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                <td style={{ padding: "7px 12px 7px 0", fontWeight: 500, color: "var(--text-main)", whiteSpace: "nowrap", verticalAlign: "top" }}>
                  <EditableText value={e.nombre} onChange={(v) => update((d) => { const arr = [...d.perfil.equipamiento]; arr[i] = { ...arr[i], nombre: v }; return { ...d, perfil: { ...d.perfil, equipamiento: arr } }; })} />
                </td>
                <td style={{ padding: "7px 0 7px 12px", color: "var(--text-muted)" }}>
                  <EditableText value={e.descripcion} onChange={(v) => update((d) => { const arr = [...d.perfil.equipamiento]; arr[i] = { ...arr[i], descripcion: v }; return { ...d, perfil: { ...d.perfil, equipamiento: arr } }; })} multiline />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Tip><EditableText value={p.equipamientoNota} onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, equipamientoNota: v } }))} multiline /></Tip>
      </Card>

      <Quote>
        <EditableText value={p.quote} onChange={(v) => update((d) => ({ ...d, perfil: { ...d.perfil, quote: v } }))} multiline className="italic text-[var(--accent-strong)]" />
      </Quote>
    </div>
  );
}

// ══ TAB STATS ═══════════════════════════════════════════════════

function TabStats({ data, update }: { data: CharacterData; update: UpdateFn }) {
  const s = data.stats;
  return (
    <div>
      <SecLabel>Estadísticas base</SecLabel>
      <div className="grid-3col">
        {s.base.map((stat, i) => (
          <div key={i} style={{ background: "var(--bg-subtle)", borderRadius: 8, padding: 10, textAlign: "center", border: stat.principal ? "1.5px solid #7F77DD" : "1px solid transparent" }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{stat.nombre}</p>
            <p style={{ fontSize: 22, fontWeight: 500, color: "var(--text-main)", margin: "0 0 1px" }}>
              <EditableNumber value={stat.valor} onChange={(v) => update((d) => { const arr = [...d.stats.base]; arr[i] = { ...arr[i], valor: parseInt(v) || 0 }; return { ...d, stats: { ...d.stats, base: arr } }; })} />
            </p>
            <p style={{ fontSize: 10, color: "var(--text-faint)", lineHeight: 1.4, margin: 0 }}>
              <EditableText value={stat.nota} onChange={(v) => update((d) => { const arr = [...d.stats.base]; arr[i] = { ...arr[i], nota: v }; return { ...d, stats: { ...d.stats, base: arr } }; })} className="text-xs text-gray-400" />
            </p>
          </div>
        ))}
      </div>

      <SecLabel>Datos de combate</SecLabel>
      <div className="grid-3col combat-grid-3">
        {s.combate.map((c, i) => (
          <div key={i} style={{ background: "var(--bg-subtle)", borderRadius: 8, padding: 10, textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 500, color: "var(--text-main)", margin: "0 0 2px" }}>
              <EditableText value={c.valor} onChange={(v) => update((d) => { const arr = [...d.stats.combate]; arr[i] = { ...arr[i], valor: v }; return { ...d, stats: { ...d.stats, combate: arr } }; })} className="font-medium" />
            </p>
            <p style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{c.label}</p>
          </div>
        ))}
      </div>

      <SecLabel>Tiradas de salvación</SecLabel>
      <div className="grid-2col" style={{ marginBottom: 14 }}>
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Con competencia</CardTitle>
          {s.salvacion.conComp.map((sv, i) => (
            <TRow key={i} label={sv.stat}>
              <strong><EditableText value={sv.valor} onChange={(v) => update((d) => { const arr = [...d.stats.salvacion.conComp]; arr[i] = { ...arr[i], valor: v }; return { ...d, stats: { ...d.stats, salvacion: { ...d.stats.salvacion, conComp: arr } } }; })} /></strong>
              {sv.nota && <span style={{ color: "var(--text-faint)", fontSize: 12 }}> {sv.nota}</span>}
            </TRow>
          ))}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <CardTitle>Sin competencia</CardTitle>
          {s.salvacion.sinComp.map((sv, i) => (
            <TRow key={i} label={sv.stat}>
              <EditableText value={sv.valor} onChange={(v) => update((d) => { const arr = [...d.stats.salvacion.sinComp]; arr[i] = { ...arr[i], valor: v }; return { ...d, stats: { ...d.stats, salvacion: { ...d.stats.salvacion, sinComp: arr } } }; })} />
            </TRow>
          ))}
        </Card>
      </div>

      <SecLabel>Habilidades completas</SecLabel>
      <Card>
        <CardTitle>Las marcadas llevan número en la ficha física</CardTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 360 }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                {["Habilidad", "Círculo", "Núm.", "Origen"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "center", padding: "7px 12px", fontWeight: 500, color: "var(--text-faint)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: i === 0 ? "auto" : 60 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.habilidades.map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-soft)", color: h.circulo ? "var(--accent-strong)" : "var(--text-muted)", fontWeight: h.circulo ? 500 : 400 }}>
                  <td style={{ padding: "7px 12px" }}>{h.nombre}</td>
                  <td style={{ textAlign: "center", padding: "7px 12px" }}>
                    {h.circulo ? <span style={{ color: "#7F77DD", fontWeight: 500 }}>●</span> : <span style={{ color: "var(--text-faint)" }}>—</span>}
                  </td>
                  <td style={{ textAlign: "center", padding: "7px 12px", fontWeight: 500, color: h.circulo ? "var(--accent-strong)" : "var(--text-main)" }}>
                    <EditableText value={h.numero} onChange={(v) => update((d) => { const arr = [...d.stats.habilidades]; arr[i] = { ...arr[i], numero: v }; return { ...d, stats: { ...d.stats, habilidades: arr } }; })} />
                  </td>
                  <td style={{ padding: "7px 12px", fontSize: 11, color: h.circulo ? "#7F77DD" : "var(--text-faint)" }}>{h.origen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Tip>
          <strong>Sabiduría Pasiva (Percepción): <EditableText value={s.sabiduriaPasiva} onChange={(v) => update((d) => ({ ...d, stats: { ...d.stats, sabiduriaPasiva: v } }))} /></strong>
          {" "}— el número que el Master usa para ver si Naevara nota algo sin que lo pidas.
        </Tip>
      </Card>
    </div>
  );
}

// ══ TAB HECHIZOS ════════════════════════════════════════════════

function TabHechizos({ data, update, openAI }: { data: CharacterData; update: UpdateFn; openAI: OpenAIFn }) {
  const h = data.hechizos;
  return (
    <div>
      <Tip><EditableText value={h.nota} onChange={(v) => update((d) => ({ ...d, hechizos: { ...d.hechizos, nota: v } }))} multiline /></Tip>
      {[
        { label: "Trucos — sin límite de usos", items: h.trucos },
        { label: "Hechizos del Patrón — siempre listos, no consumen espacio", items: h.patron },
        { label: "Hechizos elegidos — cuestan espacio", items: h.elegidos },
        { label: "Invocaciones — mejoras permanentes", items: h.invocaciones },
      ].map(({ label, items }) => (
        <div key={label}>
          <SecLabel>{label}</SecLabel>
          <div className="spell-grid">
            {items.map((s, i) => <SpellCard key={i} spell={s} />)}
          </div>
        </div>
      ))}

      <div style={{ background: "var(--accent-bg)", borderRadius: 8, padding: "12px 14px", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: "var(--accent-strong)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Loop de combate</p>
          <AIButton onClick={() => openAI("Loop de combate", h.loopCombate, (t) => update((d) => ({ ...d, hechizos: { ...d.hechizos, loopCombate: t } })))} />
        </div>
        <EditableText value={h.loopCombate} onChange={(v) => update((d) => ({ ...d, hechizos: { ...d.hechizos, loopCombate: v } }))} multiline className="text-sm text-[var(--accent-strong)] italic" />
      </div>
    </div>
  );
}

// ══ TAB HISTORIA ════════════════════════════════════════════════

function TabHistoria({ data, update, openAI }: { data: CharacterData; update: UpdateFn; openAI: OpenAIFn }) {
  const h = data.historia;
  const [addModal, setAddModal]   = useState(false);
  const [editEntry, setEditEntry] = useState<SessionEntry | null>(null);

  const sesiones = h.sesiones ?? [];

  const handleSaveSession = (entry: SessionEntry) => {
    update((d) => {
      const current = d.historia.sesiones ?? [];
      const existing = current.findIndex((s) => s.id === entry.id);
      const updated = existing >= 0
        ? current.map((s, i) => (i === existing ? entry : s))
        : [entry, ...current];
      return { ...d, historia: { ...d.historia, sesiones: updated } };
    });
  };

  const handleDeleteSession = (id: string) => {
    if (!confirm("¿Borrar esta entrada?")) return;
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
        onSave={handleSaveSession}
        existing={editEntry ?? undefined}
        openAI={openAI}
      />

      {/* Origen */}
      <SecLabel>Origen</SecLabel>
      <Card>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <CardTitle>Historia de origen</CardTitle>
          <AIButton onClick={() => openAI("Historia de origen", h.origen.parrafos.join("\n\n"), (t) => update((d) => ({ ...d, historia: { ...d.historia, origen: { ...d.historia.origen, parrafos: t.split("\n\n").filter(Boolean) } } })))} label="✦ Expandir con IA" />
        </div>
        {h.origen.parrafos.map((p, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <EditableText value={p} onChange={(v) => update((d) => { const arr = [...d.historia.origen.parrafos]; arr[i] = v; return { ...d, historia: { ...d.historia, origen: { ...d.historia.origen, parrafos: arr } } }; })} multiline className="text-sm text-gray-600 leading-relaxed" />
          </div>
        ))}
        <div style={{ background: "var(--accent-bg)", borderRadius: 8, padding: "12px 14px", marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--accent-strong)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Contexto actual</p>
            <AIButton onClick={() => openAI("Contexto actual", h.origen.contextoActual, (t) => update((d) => ({ ...d, historia: { ...d.historia, origen: { ...d.historia.origen, contextoActual: t } } })))} />
          </div>
          <EditableText value={h.origen.contextoActual} onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, origen: { ...d.historia.origen, contextoActual: v } } }))} multiline className="text-sm text-[var(--accent-strong)] italic" />
        </div>
      </Card>

      {/* Escritura del Umbral */}
      <SecLabel>La Escritura del Umbral</SecLabel>
      <Card featured>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <CardTitle>{h.escrituraUmbral.subtitulo}</CardTitle>
          <AIButton onClick={() => openAI("La Escritura del Umbral", h.escrituraUmbral.descripcion, (t) => update((d) => ({ ...d, historia: { ...d.historia, escrituraUmbral: { ...d.historia.escrituraUmbral, descripcion: t } } })))} />
        </div>
        <EditableText value={h.escrituraUmbral.descripcion} onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, escrituraUmbral: { ...d.historia.escrituraUmbral, descripcion: v } } }))} multiline className="text-sm text-gray-500 leading-relaxed" />
        <div style={{ marginTop: 8 }}>
          <EditableText value={h.escrituraUmbral.extra} onChange={(v) => update((d) => ({ ...d, historia: { ...d.historia, escrituraUmbral: { ...d.historia.escrituraUmbral, extra: v } } }))} multiline className="text-sm text-gray-500 leading-relaxed" />
        </div>
        {h.escrituraUmbral.detalles.map((det, i) => (
          <VRow key={i} label={det.label}>
            <EditableText value={det.texto} onChange={(v) => update((d) => { const arr = [...d.historia.escrituraUmbral.detalles]; arr[i] = { ...arr[i], texto: v }; return { ...d, historia: { ...d.historia, escrituraUmbral: { ...d.historia.escrituraUmbral, detalles: arr } } }; })} multiline />
          </VRow>
        ))}
      </Card>

      {/* Arco narrativo */}
      <SecLabel>Arco narrativo</SecLabel>
      <Card>
        {h.arco.map((step, i) => (
          <div key={i} style={{ display: "flex", marginBottom: i < h.arco.length - 1 ? 18 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7F77DD", marginTop: 4 }} />
              {i < h.arco.length - 1 && <div style={{ width: 1, background: "var(--border)", flex: 1, minHeight: 20 }} />}
            </div>
            <div style={{ paddingLeft: 6, flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: "#7F77DD", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                <EditableText value={step.fase} onChange={(v) => update((d) => { const arr = [...d.historia.arco]; arr[i] = { ...arr[i], fase: v }; return { ...d, historia: { ...d.historia, arco: arr } }; })} className="text-[#7F77DD]" />
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)", marginBottom: 3 }}>
                <EditableText value={step.titulo} onChange={(v) => update((d) => { const arr = [...d.historia.arco]; arr[i] = { ...arr[i], titulo: v }; return { ...d, historia: { ...d.historia, arco: arr } }; })} />
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <EditableText value={step.texto} onChange={(v) => update((d) => { const arr = [...d.historia.arco]; arr[i] = { ...arr[i], texto: v }; return { ...d, historia: { ...d.historia, arco: arr } }; })} multiline className="text-sm text-gray-500 flex-1" />
                <AIButton onClick={() => openAI(`Arco: ${step.fase}`, step.texto, (t) => update((d) => { const arr = [...d.historia.arco]; arr[i] = { ...arr[i], texto: t }; return { ...d, historia: { ...d.historia, arco: arr } }; }))} />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* ── Registro de sesiones / historia ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 0 10px", paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.09em", margin: 0 }}>
          Registro de historia
        </p>
        <button
          onClick={() => setAddModal(true)}
          style={{
            padding: "6px 14px", fontSize: 12, fontWeight: 600,
            background: "#1a1830", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          + Agregar historia
        </button>
      </div>

      {sesiones.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", background: "var(--bg-subtle)", borderRadius: 12, border: "1px dashed var(--border)" }}>
          <p style={{ fontSize: 13, color: "var(--text-faint)", margin: 0 }}>Todavía no hay entradas. Hacé clic en <strong style={{ color: "#7F77DD" }}>+ Agregar historia</strong> para registrar lo que fue sucediendo.</p>
        </div>
      )}

      {sesiones.map((entry) => (
        <div
          key={entry.id}
          style={{
            background: "var(--bg-card)", borderRadius: 12, padding: "14px 18px", marginBottom: 10,
            border: entry.tipo === "personal" ? "1.5px solid var(--accent-border)" : "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 12, fontWeight: 600,
                  background: entry.tipo === "personal" ? "var(--accent-bg)" : "var(--border-soft)",
                  color: entry.tipo === "personal" ? "var(--accent-strong)" : "var(--text-muted)",
                  border: entry.tipo === "personal" ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {entry.tipo === "personal" ? <Sparkles size={11} strokeWidth={2} /> : <Swords size={11} strokeWidth={2} />}
                    {entry.tipo === "personal" ? "Personal" : "Partida"}
                  </span>
                </span>
                {entry.sesion && <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }}>{entry.sesion}</span>}
                {entry.fecha && <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{entry.fecha}</span>}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 6px" }}>{entry.titulo}</p>
              {entry.contenido && (
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{entry.contenido}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => setEditEntry(entry)}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteSession(entry.id)}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(192,57,43,0.13)", color: "#ff8b80", border: "1px solid rgba(192,57,43,0.4)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══ TAB MUNDO ═══════════════════════════════════════════════════

function TabMundo({ data, update, openAI }: { data: CharacterData; update: UpdateFn; openAI: OpenAIFn }) {
  const m = data.mundo;
  return (
    <div>
      <SecLabel>Contexto del mundo</SecLabel>
      <Card>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}><CardTitle>{m.contexto.titulo}</CardTitle><AIButton onClick={() => openAI("Contexto del mundo", m.contexto.texto, (t) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: t } } })))} /></div>
        <EditableText value={m.contexto.texto} onChange={(v) => update((d) => ({ ...d, mundo: { ...d.mundo, contexto: { ...d.mundo.contexto, texto: v } } }))} multiline className="text-sm text-gray-500" />
      </Card>

      <SecLabel>RedMica — La capital flotante</SecLabel>
      <Card featured>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}><CardTitle>{m.redmica.titulo}</CardTitle><AIButton onClick={() => openAI("RedMica", m.redmica.descripcion, (t) => update((d) => ({ ...d, mundo: { ...d.mundo, redmica: { ...d.mundo.redmica, descripcion: t } } })))} /></div>
        <EditableText value={m.redmica.descripcion} onChange={(v) => update((d) => ({ ...d, mundo: { ...d.mundo, redmica: { ...d.mundo.redmica, descripcion: v } } }))} multiline className="text-sm text-gray-500" />
        {m.redmica.detalles.map((det, i) => (
          <VRow key={i} label={det.label}>
            <EditableText value={det.texto} onChange={(v) => update((d) => { const arr = [...d.mundo.redmica.detalles]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, redmica: { ...d.mundo.redmica, detalles: arr } } }; })} multiline />
          </VRow>
        ))}
      </Card>

      <SecLabel>Cultistas de Tiamat</SecLabel>
      <Card>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}><CardTitle>{m.cultistas.titulo}</CardTitle><AIButton onClick={() => openAI("Cultistas de Tiamat", m.cultistas.texto, (t) => update((d) => ({ ...d, mundo: { ...d.mundo, cultistas: { ...d.mundo.cultistas, texto: t } } })))} /></div>
        <EditableText value={m.cultistas.texto} onChange={(v) => update((d) => ({ ...d, mundo: { ...d.mundo, cultistas: { ...d.mundo.cultistas, texto: v } } }))} multiline className="text-sm text-gray-500" />
      </Card>

      <SecLabel>Lugares importantes</SecLabel>
      {m.lugares.map((loc, i) => (
        <div key={i} style={{ background: loc.destacado ? "var(--accent-bg)" : "var(--bg-subtle)", border: loc.destacado ? "1.5px solid #7F77DD" : "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)", margin: "0 0 2px" }}>
              <EditableText value={loc.nombre} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], nombre: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} />
            </p>
            <AIButton onClick={() => openAI(`Lugar: ${loc.nombre}`, loc.texto, (t) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], texto: t }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; }))} />
          </div>
          <p style={{ fontSize: 11, color: "#7F77DD", marginBottom: 6 }}>
            <EditableText value={loc.tipo} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], tipo: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} className="text-[#7F77DD]" />
          </p>
          <EditableText value={loc.texto} onChange={(v) => update((d) => { const arr = [...d.mundo.lugares]; arr[i] = { ...arr[i], texto: v }; return { ...d, mundo: { ...d.mundo, lugares: arr } }; })} multiline className="text-sm text-gray-500" />
        </div>
      ))}
    </div>
  );
}

// ══ TAB MASTER ══════════════════════════════════════════════════

function TabMaster({ data, update, openAI }: { data: CharacterData; update: UpdateFn; openAI: OpenAIFn }) {
  const m = data.master;
  return (
    <div>
      <SecLabel>Señales posibles que puede sembrar la campaña</SecLabel>
      <Card>
        <CardTitle>Momentos narrativos que pueden ocurrir</CardTitle>
        {m.senales.map((sig, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < m.senales.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
            <div style={{ background: "var(--accent-bg)", color: "var(--accent-strong)", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", alignSelf: "flex-start", marginTop: 2 }}>
              <EditableText value={sig.nivel} onChange={(v) => update((d) => { const arr = [...d.master.senales]; arr[i] = { ...arr[i], nivel: v }; return { ...d, master: { ...d.master, senales: arr } }; })} className="text-[var(--accent-strong)] font-semibold" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 3 }}>
                <EditableText value={sig.titulo} onChange={(v) => update((d) => { const arr = [...d.master.senales]; arr[i] = { ...arr[i], titulo: v }; return { ...d, master: { ...d.master, senales: arr } }; })} />
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <EditableText value={sig.texto} onChange={(v) => update((d) => { const arr = [...d.master.senales]; arr[i] = { ...arr[i], texto: v }; return { ...d, master: { ...d.master, senales: arr } }; })} multiline className="text-sm text-gray-500 flex-1" />
                <AIButton onClick={() => openAI(`Señal: ${sig.titulo}`, sig.texto, (t) => update((d) => { const arr = [...d.master.senales]; arr[i] = { ...arr[i], texto: t }; return { ...d, master: { ...d.master, senales: arr } }; }))} />
              </div>
            </div>
          </div>
        ))}
      </Card>

      <SecLabel>Conexiones posibles con la trama</SecLabel>
      <Card>
        {m.conexiones.map((c, i) => (
          <VRow key={i} label={c.label}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <EditableText value={c.texto} onChange={(v) => update((d) => { const arr = [...d.master.conexiones]; arr[i] = { ...arr[i], texto: v }; return { ...d, master: { ...d.master, conexiones: arr } }; })} multiline className="text-sm text-gray-500 flex-1" />
              <AIButton onClick={() => openAI(`Conexión: ${c.label}`, c.texto, (t) => update((d) => { const arr = [...d.master.conexiones]; arr[i] = { ...arr[i], texto: t }; return { ...d, master: { ...d.master, conexiones: arr } }; }))} />
            </div>
          </VRow>
        ))}
      </Card>

      <Quote>
        <EditableText value={m.quote} onChange={(v) => update((d) => ({ ...d, master: { ...d.master, quote: v } }))} multiline className="italic text-[var(--accent-strong)]" />
      </Quote>
    </div>
  );
}
