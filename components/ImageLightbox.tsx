"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { descargarImagen } from "@/lib/descargar";

interface Props {
  images: string[];
  startIndex?: number;
  alt: string;
  onClose: () => void;
  captions?: string[]; // texto opcional por imagen (pie de foto)
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export default function ImageLightbox({ images, startIndex = 0, alt, onClose, captions }: Props) {
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
  const caption = captions?.[idx];

  // Cromo neutro y plano: funciona sobre cualquier página (Naevara o Vaegrant)
  const btn: React.CSSProperties = {
    height: 34, minWidth: 34, padding: "0 8px", borderRadius: 6,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.85)", cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    fontSize: 12, fontWeight: 600, transition: "background 0.15s",
  };
  const arrowStyle: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 40, height: 56, borderRadius: 6,
    background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.8)", cursor: "pointer", zIndex: 3,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(5,7,10,0.96)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      <style>{`
        .ilb-btn:hover { background: rgba(255,255,255,0.14) !important; }
        .ilb-thumbs::-webkit-scrollbar { display: none; }
        @media (max-width: 640px) { .ilb-label { display: none; } }
      `}</style>

      {/* Barra superior */}
      <div
        onClick={stop}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", flexShrink: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
        }}
      >
        <span style={{ fontSize: 12, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
          {idx + 1} / {count}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="ilb-btn" onClick={() => applyScale(scale / 1.4)} aria-label="Alejar" style={btn}><ZoomOut size={16} /></button>
          <button className="ilb-btn" onClick={resetZoom} aria-label="Restablecer zoom" style={{ ...btn, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(scale * 100)}%
          </button>
          <button className="ilb-btn" onClick={() => applyScale(scale * 1.4)} aria-label="Acercar" style={btn}><ZoomIn size={16} /></button>
          <button className="ilb-btn" onClick={() => descargarImagen(images[idx])} aria-label="Descargar imagen" title="Descargar" style={btn}>
            <Download size={16} /> <span className="ilb-label">Descargar</span>
          </button>
          <button className="ilb-btn" onClick={onClose} aria-label="Cerrar" style={{ ...btn, marginLeft: 6 }}><X size={17} /></button>
        </div>
      </div>

      {/* Imagen */}
      <div
        ref={areaRef}
        onClick={stop}
        onDoubleClick={() => (scale > 1 ? resetZoom() : applyScale(2.5))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative", flex: 1, width: "100%", maxWidth: 1000, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", touchAction: "none",
          cursor: scale > 1 ? "grab" : "default",
          padding: "0 6px",
        }}
      >
        {count > 1 && (
          <button className="ilb-btn" onClick={() => go(-1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Anterior" style={{ ...arrowStyle, left: 10 }}>
            <ChevronLeft size={22} />
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
            alt={caption ? `${alt}: ${caption}` : `${alt} ${idx + 1}`}
            fill
            sizes="(max-width: 1000px) 100vw, 1000px"
            style={{ objectFit: "contain", borderRadius: 3, pointerEvents: "none", userSelect: "none" }}
            draggable={false}
            priority
          />
        </div>

        {count > 1 && (
          <button className="ilb-btn" onClick={() => go(1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Siguiente" style={{ ...arrowStyle, right: 10 }}>
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Pie: caption + miniaturas */}
      <div onClick={stop} style={{ width: "100%", flexShrink: 0, padding: "8px 14px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}>
        {caption && (
          <p style={{ textAlign: "center", fontSize: 12.5, color: "rgba(255,255,255,0.75)", margin: "0 0 8px", lineHeight: 1.4 }}>
            {caption}
          </p>
        )}
        {count > 1 && (
          <div className="ilb-thumbs" style={{ display: "flex", gap: 6, justifyContent: "safe center", maxWidth: "100%", overflowX: "auto", scrollbarWidth: "none", padding: "2px 0" }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Imagen ${i + 1}`}
                style={{
                  flexShrink: 0, width: 46, height: 58, borderRadius: 3, overflow: "hidden",
                  border: i === idx ? "1px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.12)",
                  opacity: i === idx ? 1 : 0.45, cursor: "pointer", padding: 0,
                  background: "#111", transition: "opacity 0.15s",
                }}
              >
                <Image src={src} alt={`miniatura ${i + 1}`} width={46} height={58} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
