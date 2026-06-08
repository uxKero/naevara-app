"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  images: string[];
  startIndex?: number;
  alt: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export default function ImageLightbox({ images, startIndex = 0, alt, onClose }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const count = images.length;
  const areaRef = useRef<HTMLDivElement>(null);

  // Pointer / pinch tracking
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const prevDist = useRef(0);
  const lastPan = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, []);

  const applyScale = useCallback((next: number) => {
    const s = clamp(next);
    setScale(s);
    if (s === 1) setOffset({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (delta: number) => { setIdx((i) => (i + delta + count) % count); resetZoom(); },
    [count, resetZoom]
  );

  // Reset zoom whenever the image changes
  useEffect(() => { resetZoom(); }, [idx, resetZoom]);

  // Keyboard + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "+" || e.key === "=") applyScale(scale * 1.3);
      else if (e.key === "-") applyScale(scale / 1.3);
      else if (e.key === "0") resetZoom();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, go, applyScale, resetZoom, scale]);

  // Non-passive wheel zoom
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => {
        const next = clamp(s * (e.deltaY < 0 ? 1.12 : 0.89));
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pointer handlers (pan + pinch) ──────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) lastPan.current = { x: e.clientX, y: e.clientY };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      prevDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (prevDist.current > 0) applyScale(scale * (dist / prevDist.current));
      prevDist.current = dist;
    } else if (pts.length === 1 && scale > 1) {
      const dx = e.clientX - lastPan.current.x;
      const dy = e.clientY - lastPan.current.y;
      lastPan.current = { x: e.clientX, y: e.clientY };
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) prevDist.current = 0;
    if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0];
      lastPan.current = { x: p.x, y: p.y };
    }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const ctrlBtn: React.CSSProperties = {
    width: 38, height: 38, borderRadius: "50%",
    background: "rgba(20,17,40,0.8)", border: "1px solid var(--accent-border)",
    color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  };
  const arrowStyle: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 44, height: 44, borderRadius: "50%",
    background: "rgba(20,17,40,0.8)", border: "1px solid var(--accent-border)",
    color: "#fff", cursor: "pointer", zIndex: 3,
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(6,4,16,0.94)", backdropFilter: "blur(4px)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "14px 12px 12px",
      }}
    >
      {/* Top bar */}
      <div
        onClick={stop}
        style={{ width: "100%", maxWidth: 860, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}
      >
        <span className="display-font" style={{ fontSize: 13, letterSpacing: "0.14em", color: "var(--accent-strong)", textTransform: "uppercase" }}>
          {idx + 1} / {count}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => applyScale(scale / 1.4)} aria-label="Alejar" style={ctrlBtn}><ZoomOut size={18} /></button>
          <button onClick={resetZoom} aria-label="Restablecer zoom" style={{ ...ctrlBtn, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(scale * 100)}%
          </button>
          <button onClick={() => applyScale(scale * 1.4)} aria-label="Acercar" style={ctrlBtn}><ZoomIn size={18} /></button>
          <button onClick={onClose} aria-label="Cerrar" style={{ ...ctrlBtn, marginLeft: 4 }}><X size={20} /></button>
        </div>
      </div>

      {/* Main image area */}
      <div
        ref={areaRef}
        onClick={stop}
        onDoubleClick={() => (scale > 1 ? resetZoom() : applyScale(2.5))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative", flex: 1, width: "100%", maxWidth: 860, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", touchAction: "none",
          cursor: scale > 1 ? "grab" : "default",
        }}
      >
        {count > 1 && (
          <button onClick={() => go(-1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Anterior" style={{ ...arrowStyle, left: 4 }}>
            <ChevronLeft size={24} />
          </button>
        )}

        <div
          style={{
            position: "relative", width: "100%", height: "100%",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: pointers.current.size ? "none" : "transform 0.16s ease-out",
            willChange: "transform",
          }}
        >
          <Image
            key={idx}
            src={images[idx]}
            alt={`${alt} — ${idx + 1}`}
            fill
            sizes="(max-width: 860px) 100vw, 860px"
            style={{ objectFit: "contain", borderRadius: 12, pointerEvents: "none", userSelect: "none" }}
            draggable={false}
            priority
          />
        </div>

        {count > 1 && (
          <button onClick={() => go(1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Siguiente" style={{ ...arrowStyle, right: 4 }}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div
          onClick={stop}
          style={{ display: "flex", gap: 8, marginTop: 12, padding: "4px 2px", maxWidth: "100%", overflowX: "auto", flexShrink: 0 }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                flexShrink: 0, width: 52, height: 66, borderRadius: 8, overflow: "hidden",
                border: i === idx ? "2px solid var(--accent)" : "1px solid var(--border)",
                opacity: i === idx ? 1 : 0.55, cursor: "pointer", padding: 0,
                background: "var(--bg-subtle)", transition: "opacity 0.15s",
              }}
            >
              <Image src={src} alt={`miniatura ${i + 1}`} width={52} height={66} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
