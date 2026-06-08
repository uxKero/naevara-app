"use client";
import { useState, useEffect } from "react";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  sectionTitle: string;
  currentText: string;
  context?: string; // contexto adicional del personaje para la IA
  mode?: "expand" | "rewrite" | "continue" | "free";
}

const MODELS = [
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku (rápido)" },
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (rápido)" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B (gratis)" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
];

export default function AIModal({
  isOpen,
  onClose,
  onApply,
  sectionTitle,
  currentText,
  context = "",
}: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Cargar configuración guardada
  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem("openrouter_key") || "";
      const savedModel = localStorage.getItem("openrouter_model") || "anthropic/claude-3.5-sonnet";
      setApiKey(savedKey);
      setModel(savedModel);
      setResult("");
      setError("");
      setPrompt("");
      setShowKeyInput(!savedKey);
    }
  }, [isOpen]);

  const saveConfig = () => {
    localStorage.setItem("openrouter_key", apiKey);
    localStorage.setItem("openrouter_model", model);
    setShowKeyInput(false);
  };

  const generate = async () => {
    if (!apiKey) {
      setShowKeyInput(true);
      setError("Primero configurá tu API key de OpenRouter.");
      return;
    }
    if (!prompt.trim()) {
      setError("Escribí qué querés que haga la IA.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          currentText,
          sectionTitle,
          context,
          model,
          apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al llamar a la IA");
      }

      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.55)", border: "1px solid var(--border)" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="display-font text-base font-semibold text-[var(--text-main)]">Asistente de escritura ✦</h2>
            <p className="text-xs text-[var(--text-faint)] mt-0.5">Sección: {sectionTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-xs text-[#7F77DD] hover:underline"
            >
              ⚙ Config
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-faint)] hover:text-[var(--text-main)] text-xl leading-none ml-2"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Config panel */}
          {showKeyInput && (
            <div className="bg-[var(--accent-bg)] rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[var(--accent-strong)] uppercase tracking-wide">
                Configuración OpenRouter
              </p>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">API Key</label>
                <input
                  type="password"
                  className="w-full border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-[var(--text-faint)] mt-1">
                  Obtené una en{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7F77DD] underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Modelo</label>
                <select
                  className="w-full border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveConfig}
                className="bg-[#7F77DD] text-white text-sm rounded-lg px-4 py-2 hover:bg-[#6B63C9] transition-colors"
              >
                Guardar configuración
              </button>
            </div>
          )}

          {/* Texto actual */}
          {currentText && (
            <div>
              <p className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide mb-1">
                Texto actual
              </p>
              <div className="bg-[var(--bg-subtle)] rounded-lg p-3 text-sm text-[var(--text-muted)] leading-relaxed max-h-32 overflow-y-auto border border-[var(--border)]">
                {currentText}
              </div>
            </div>
          )}

          {/* Prompt del usuario */}
          <div>
            <p className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide mb-1">
              ¿Qué querés que haga la IA?
            </p>
            <textarea
              className="w-full border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-main)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 resize-none"
              rows={3}
              placeholder="Ej: Expandí este párrafo con más detalle sobre la relación con su abuela. Mantené el tono misterioso y poético del resto del perfil."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) generate();
              }}
            />
            <p className="text-xs text-[var(--text-faint)] mt-1">Ctrl+Enter para generar</p>
          </div>

          {/* Botón generar */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-[#1a1830] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#2a2444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                Generando...
              </>
            ) : (
              "✦ Generar con IA"
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-[rgba(192,57,43,0.13)] border border-[rgba(192,57,43,0.4)] rounded-lg px-4 py-3 text-sm text-[#ff8b80]">
              {error}
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div>
              <p className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide mb-1">
                Resultado
              </p>
              <div className="bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-xl p-4">
                <p className="text-sm text-[var(--accent-strong)] leading-relaxed whitespace-pre-wrap">
                  {result}
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onApply(result)}
                  className="flex-1 bg-[#7F77DD] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#6B63C9] transition-colors"
                >
                  ✓ Aplicar este texto
                </button>
                <button
                  onClick={() => setResult("")}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
