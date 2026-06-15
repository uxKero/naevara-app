"use client";
import { useState, useEffect } from "react";
import { Swords, Sparkles } from "lucide-react";
import { SessionEntry } from "@/types/character";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: SessionEntry) => void;
  existing?: SessionEntry; // para editar
  openAI?: (title: string, currentText: string, onApply: (t: string) => void, tipo?: "personal" | "partida") => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddSessionModal({ isOpen, onClose, onSave, existing, openAI }: Props) {
  const [tipo, setTipo] = useState<"personal" | "partida">(existing?.tipo ?? "partida");
  const [titulo, setTitulo] = useState(existing?.titulo ?? "");
  const [sesion, setSesion] = useState(existing?.sesion ?? "");
  const [fecha, setFecha] = useState(existing?.fecha ?? todayStr());
  const [contenido, setContenido] = useState(existing?.contenido ?? "");

  useEffect(() => {
    if (isOpen) {
      setTipo(existing?.tipo ?? "partida");
      setTitulo(existing?.titulo ?? "");
      setSesion(existing?.sesion ?? "");
      setFecha(existing?.fecha ?? todayStr());
      setContenido(existing?.contenido ?? "");
    }
  }, [isOpen, existing]);

  const handleSave = () => {
    if (!titulo.trim() && !contenido.trim()) return;
    onSave({
      id: existing?.id ?? Date.now().toString(),
      tipo,
      titulo: titulo || "(sin título)",
      sesion,
      fecha,
      contenido,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 580,
        maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
              {existing ? "Editar entrada" : "Nueva entrada de historia"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "2px 0 0" }}>
              Registrá lo que ocurrió en sesión o algo personal de Naevara
            </p>
          </div>
          <button onClick={onClose} style={{ fontSize: 20, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tipo */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Tipo de entrada
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {(["partida", "personal"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  style={{
                    padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                    border: tipo === t ? "2px solid #7F77DD" : "1.5px solid var(--border)",
                    background: tipo === t ? "var(--accent-bg)" : "var(--bg-subtle)",
                    color: tipo === t ? "var(--accent-strong)" : "var(--text-muted)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    {t === "partida" ? <Swords size={14} strokeWidth={2} /> : <Sparkles size={14} strokeWidth={2} />}
                    {t === "partida" ? "Sesión / Partida" : "Personal de Naevara"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fila: sesion + fecha */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                Sesión / Referencia
              </label>
              <input
                type="text"
                placeholder="Sesión 1, Capítulo 2..."
                value={sesion}
                onChange={(e) => setSesion(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                  border: "1.5px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7F77DD"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div style={{ width: 150 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                  border: "1.5px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7F77DD"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>

          {/* Título */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
              Título
            </label>
            <input
              type="text"
              placeholder="¿Qué pasó? (ej: Primera visita a la Gran Biblioteca)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
                border: "1.5px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)",
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#7F77DD"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* Contenido */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Historia / Notas
              </label>
              {openAI && (
                <button
                  onClick={() => openAI("Nueva entrada de historia", contenido, (t) => setContenido(t), tipo)}
                  style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 8,
                    background: "var(--accent-bg)", color: "var(--accent-strong)",
                    border: "1px solid var(--accent-border)", cursor: "pointer", fontWeight: 500,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Sparkles size={11} strokeWidth={2} /> Mejorar con IA
                  </span>
                </button>
              )}
            </div>
            <textarea
              placeholder={
                tipo === "partida"
                  ? "¿Qué sucedió en la sesión? ¿Qué fue importante para el grupo?"
                  : "¿Qué vivió Naevara? ¿Qué descubrió, sintió, decidió?"
              }
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={6}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: "1.5px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-main)",
                lineHeight: 1.65, resize: "vertical", outline: "none", fontFamily: "inherit",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#7F77DD"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-soft)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: "1.5px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-muted)", cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "9px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: "none", background: "#1a1830", color: "#fff", cursor: "pointer",
            }}
          >
            {existing ? "Guardar cambios" : "Agregar entrada"}
          </button>
        </div>
      </div>
    </div>
  );
}
