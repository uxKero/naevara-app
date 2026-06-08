"use client";
import { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

export default function EditableText({
  value,
  onChange,
  multiline = false,
  className = "",
  placeholder = "Escribir...",
  inputClassName = "",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      if (multiline) {
        const el = ref.current as HTMLTextAreaElement;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
      }
    }
  }, [editing, multiline]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const baseStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-subtle)",
    border: "1.5px solid var(--accent)",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: "inherit",
    fontFamily: "inherit",
    lineHeight: "inherit",
    color: "var(--text-main)",        // ← siempre legible
    resize: "none",
    outline: "none",
    boxShadow: "0 0 0 3px rgba(127,119,221,0.12)",
  };

  if (!editing) {
    return (
      <span
        className={`cursor-text group relative inline ${className}`}
        onClick={() => setEditing(true)}
        title="Clic para editar"
        style={{ cursor: "text" }}
      >
        {value || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>{placeholder}</span>}
        <span
          style={{
            marginLeft: 4,
            opacity: 0,
            fontSize: "0.75em",
            color: "#7F77DD",
            transition: "opacity 0.15s",
            userSelect: "none",
            pointerEvents: "none",
          }}
          className="group-hover:opacity-60"
        >
          ✎
        </span>
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        style={{ ...baseStyle, minHeight: 60, display: "block" }}
        className={inputClassName}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value);
          const el = e.target as HTMLTextAreaElement;
          el.style.height = "auto";
          el.style.height = el.scrollHeight + "px";
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      style={baseStyle}
      className={inputClassName}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setDraft(value); setEditing(false); }
      }}
    />
  );
}
