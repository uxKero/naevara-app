"use client";
import { useState, useRef, useEffect } from "react";

interface EditableNumberProps {
  value: number | string;
  onChange: (val: string) => void;
  className?: string;
}

export default function EditableNumber({ value, onChange, className = "" }: EditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => {
    if (editing && ref.current) { ref.current.focus(); ref.current.select(); }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== String(value)) onChange(draft);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-text group relative inline-block ${className}`}
        onClick={() => setEditing(true)}
        title="Clic para editar"
      >
        {value}
        <span style={{ marginLeft: 3, opacity: 0, fontSize: "0.65em", color: "#7F77DD", transition: "opacity 0.15s" }}
          className="group-hover:opacity-50">✎</span>
      </span>
    );
  }

  return (
    <input
      ref={ref}
      type="text"
      style={{
        width: 72,
        textAlign: "center",
        background: "#fff",
        border: "1.5px solid #7F77DD",
        borderRadius: 6,
        padding: "2px 4px",
        fontSize: "inherit",
        fontFamily: "inherit",
        fontWeight: "inherit",
        color: "#1a1a1a",          // ← siempre legible
        outline: "none",
        boxShadow: "0 0 0 3px rgba(127,119,221,0.12)",
      }}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setDraft(String(value)); setEditing(false); }
      }}
    />
  );
}
