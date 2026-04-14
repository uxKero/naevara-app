"use client";
import { useEffect } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: "min(480px, 90vw)", maxHeight: "90vh" }}
      >
        <Image
          src={src}
          alt={alt}
          width={480}
          height={600}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
          priority
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: -12, right: -12,
            width: 32, height: 32, borderRadius: "50%",
            background: "#fff", border: "none", cursor: "pointer",
            fontSize: 18, lineHeight: "32px", textAlign: "center",
            color: "#1a1a1a", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >×</button>
      </div>
    </div>
  );
}
