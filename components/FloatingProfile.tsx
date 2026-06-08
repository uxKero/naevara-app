"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Sparkles, ScrollText, Globe2, Plus, Menu, X } from "lucide-react";

interface Props {
  visible: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddHistoria: () => void;
  imageSrc: string;
  firstName: string;
  lastName: string;
}

const NAV_ITEMS = [
  { id: "stats",    label: "Stats",     Icon: Swords },
  { id: "hechizos", label: "Hechizos",  Icon: Sparkles },
  { id: "historia", label: "Historia",  Icon: ScrollText },
  { id: "mundo",    label: "El Mundo",  Icon: Globe2 },
];

const SPRING = { type: "spring" as const, stiffness: 360, damping: 26 };

export default function FloatingProfile({ visible, activeTab, onTabChange, onAddHistoria, imageSrc, firstName, lastName }: Props) {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen]     = useState(false);

  return (
    <>
      {/* ══ DESKTOP: left photo sidebar ═══════════════════════════ */}
      <div className="floating-profile-desktop">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 90,
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            {/* Left column: photo + name + buttons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>

              {/* Photo */}
              <div style={{
                width: 260, height: 340,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--accent-border)",
                boxShadow: "0 12px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(175,169,236,0.12)",
              }}>
                <Image
                  src={imageSrc} alt={`${firstName} ${lastName}`}
                  width={260} height={340}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                  priority
                />
              </div>

              {/* Name */}
              <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                <div className="display-font" style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)", letterSpacing: "0.05em" }}>{firstName}</div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", letterSpacing: "0.08em" }}>{lastName}</div>
              </div>

              {/* Primary action: Agregar historia */}
              <motion.button
                onClick={onAddHistoria}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                transition={SPRING}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 20px", borderRadius: 22,
                  background: "linear-gradient(135deg, #8e85f2 0%, #6a61c8 100%)",
                  border: "1px solid var(--accent-border)",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 6px 22px rgba(142,133,242,0.45)",
                }}
              >
                <Plus size={16} strokeWidth={2.4} /> Agregar historia
              </motion.button>

              {/* Secondary: navigate */}
              <motion.button
                onClick={() => setDesktopMenuOpen((o) => !o)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                transition={SPRING}
                style={{
                  padding: "7px 18px", borderRadius: 20,
                  background: desktopMenuOpen ? "var(--accent-bg)" : "rgba(20,17,40,0.9)",
                  border: `1px solid ${desktopMenuOpen ? "var(--accent)" : "var(--accent-border)"}`,
                  color: desktopMenuOpen ? "var(--accent-strong)" : "var(--text-muted)",
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {desktopMenuOpen ? <X size={15} /> : <Menu size={15} />}
                {desktopMenuOpen ? "Cerrar" : "Navegar"}
              </motion.button>
            </div>

            {/* Nav pills sliding right */}
            <AnimatePresence>
              {desktopMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -14, scaleX: 0.75 }}
                  animate={{ opacity: 1, x: 0, scaleX: 1 }}
                  exit={{ opacity: 0, x: -14, scaleX: 0.75 }}
                  transition={{ ...SPRING, stiffness: 400 }}
                  style={{ display: "flex", flexDirection: "column", gap: 7, transformOrigin: "left bottom", paddingBottom: 4 }}
                >
                  {NAV_ITEMS.map((item, i) => {
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        transition={{ ...SPRING, delay: i * 0.05 }}
                        whileHover={{ scale: 1.04, x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { onTabChange(item.id); setDesktopMenuOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 18px", borderRadius: 24,
                          border: `1.5px solid ${isActive ? "var(--accent)" : "var(--accent-border)"}`,
                          background: isActive ? "var(--accent-bg)" : "rgba(20,17,40,0.92)",
                          cursor: "pointer",
                          boxShadow: isActive ? "0 4px 18px rgba(142,133,242,0.4)" : "0 3px 14px rgba(0,0,0,0.4)",
                          whiteSpace: "nowrap", minWidth: 130,
                          color: isActive ? "var(--accent-strong)" : "var(--text-muted)",
                        }}
                      >
                        <item.Icon size={17} strokeWidth={2} color={isActive ? "var(--accent-strong)" : "var(--accent)"} />
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* end .floating-profile-desktop */}

      {/* ══ MOBILE: bottom-right quick-access dial ════════════════ */}
      <div className="floating-profile-mobile">
        {/* Backdrop when open */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 88,
                background: "rgba(8,6,20,0.6)", backdropFilter: "blur(3px)",
              }}
            />
          )}
        </AnimatePresence>

        <div style={{
          position: "fixed", right: 16, bottom: 20, zIndex: 89,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9,
        }}>
          {/* Quick-access items */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9, marginBottom: 1 }}
              >
                {/* Nav items (top) */}
                {NAV_ITEMS.map((item, i) => {
                  const isActive = activeTab === item.id;
                  return (
                    <DialItem
                      key={item.id}
                      index={i}
                      label={item.label}
                      Icon={item.Icon}
                      active={isActive}
                      onClick={() => { onTabChange(item.id); setMobileNavOpen(false); }}
                    />
                  );
                })}
                {/* Primary action (closest to FAB) */}
                <DialItem
                  index={NAV_ITEMS.length}
                  label="Agregar historia"
                  Icon={Plus}
                  highlight
                  onClick={() => { setMobileNavOpen(false); onAddHistoria(); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAB toggle */}
          <motion.button
            onClick={() => setMobileNavOpen((o) => !o)}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: mobileNavOpen
                ? "rgba(20,17,40,0.96)"
                : "radial-gradient(circle at 32% 26%, #a89fff 0%, #8e85f2 50%, #6a61c8 100%)",
              border: "1px solid var(--accent-border)",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              boxShadow: mobileNavOpen
                ? "0 6px 22px rgba(0,0,0,0.55)"
                : "0 8px 28px rgba(142,133,242,0.6), inset 0 1px 2px rgba(255,255,255,0.32)",
            }}
          >
            <motion.span animate={{ rotate: mobileNavOpen ? 90 : 0 }} transition={{ duration: 0.22 }} style={{ display: "flex" }}>
              {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.span>
          </motion.button>
        </div>
      </div>
    </>
  );
}

// ── Single dial item (no circle around icon) ──────────────────────
function DialItem({
  index, label, Icon, active = false, highlight = false, onClick,
}: {
  index: number;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  const iconColor = highlight ? "#fff" : active ? "var(--accent-strong)" : "var(--accent)";
  const labelColor = highlight ? "#fff" : active ? "var(--accent-strong)" : "var(--text-muted)";
  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ ...SPRING, delay: index * 0.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 26,
        background: highlight
          ? "radial-gradient(circle at 30% 25%, #a89fff 0%, #8e85f2 52%, #6a61c8 100%)"
          : active ? "var(--accent-bg)" : "rgba(20,17,40,0.94)",
        border: `1.5px solid ${highlight || active ? "var(--accent)" : "var(--accent-border)"}`,
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        boxShadow: highlight
          ? "0 8px 26px rgba(142,133,242,0.6)"
          : active ? "0 6px 22px rgba(142,133,242,0.4)" : "0 6px 18px rgba(0,0,0,0.5)",
        cursor: "pointer", whiteSpace: "nowrap",
      }}
    >
      <Icon size={highlight ? 20 : 18} strokeWidth={highlight ? 2.5 : 2} color={iconColor} />
      <span style={{ fontSize: 15, fontWeight: highlight || active ? 700 : 500, letterSpacing: "0.02em", color: labelColor }}>
        {label}
      </span>
    </motion.button>
  );
}
