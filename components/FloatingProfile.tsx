"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  imageSrc: string;
  firstName: string;
  lastName: string;
}

const NAV_ITEMS = [
  { id: "stats",    label: "Stats",    icon: "⚔️", color: "#E65100", bg: "#FFF3E0", border: "#FFB74D" },
  { id: "hechizos", label: "Hechizos", icon: "✦",  color: "#534AB7", bg: "#EEEDFE", border: "#C8C5F6" },
  { id: "historia", label: "Historia", icon: "📖", color: "#1B5E20", bg: "#E8F5E9", border: "#A5D6A7" },
  { id: "mundo",    label: "El Mundo", icon: "🌍", color: "#0D47A1", bg: "#E3F2FD", border: "#90CAF9" },
];

const SPRING = { type: "spring" as const, stiffness: 360, damping: 26 };

export default function FloatingProfile({ visible, activeTab, onTabChange, imageSrc, firstName, lastName }: Props) {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);

  return (
    <>
      {/* ══ DESKTOP: left photo sidebar ═══════════════════════════ */}
      {/* Wrapper div carries the CSS class — framer-motion inner div won't fight display:none on parent */}
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
            {/* Left column: photo + name + button */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>

              {/* Photo */}
              <div style={{
                width: 260, height: 340,
                borderRadius: 8,
                overflow: "hidden",
                border: "2px solid rgba(200,197,246,0.7)",
                boxShadow: "0 8px 40px rgba(26,24,48,0.28)",
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
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1830" }}>{firstName}</div>
                <div style={{ fontSize: 12, color: "#7c7a8a", letterSpacing: "0.05em" }}>{lastName}</div>
              </div>

              {/* Button */}
              <motion.button
                onClick={() => setDesktopMenuOpen((o) => !o)}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                transition={SPRING}
                style={{
                  padding: "8px 22px", borderRadius: 20,
                  background: desktopMenuOpen ? "#1a1830" : "#EEEDFE",
                  border: desktopMenuOpen ? "none" : "1.5px solid #C8C5F6",
                  color: desktopMenuOpen ? "#fff" : "#534AB7",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: desktopMenuOpen ? "0 3px 16px rgba(83,74,183,0.4)" : "0 1px 6px rgba(0,0,0,0.1)",
                }}
              >
                <span style={{ fontSize: 16 }}>{desktopMenuOpen ? "×" : "⊕"}</span>
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
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "9px 18px 9px 12px", borderRadius: 26,
                          border: `${isActive ? 2 : 1.5}px solid ${item.border}`,
                          background: isActive ? item.bg : "#fff",
                          cursor: "pointer",
                          boxShadow: isActive ? `0 2px 14px ${item.border}88` : "0 1px 8px rgba(0,0,0,0.09)",
                          whiteSpace: "nowrap", position: "relative", overflow: "hidden", minWidth: 130,
                        }}
                      >
                        {isActive && (
                          <motion.div
                            animate={{ x: ["-100%", "220%"] }}
                            transition={{ repeat: Infinity, duration: 2.4, ease: "linear", delay: i * 0.35 }}
                            style={{
                              position: "absolute", inset: 0,
                              background: `linear-gradient(90deg, transparent 0%, ${item.border}66 50%, transparent 100%)`,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                        <span style={{ fontSize: 17 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? item.color : "#444" }}>
                          {item.label}
                        </span>
                        {isActive && (
                          <motion.span layoutId="nav-dot-desktop"
                            style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, marginLeft: "auto" }}
                          />
                        )}
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

      {/* ══ MOBILE: speed-dial FAB bottom-right ═══════════════════ */}
      <div className="floating-profile-mobile">
        {/* Backdrop when open */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 88,
                background: "rgba(10,8,30,0.35)", backdropFilter: "blur(2px)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Speed-dial items (above FAB) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div style={{
              position: "fixed", right: 16, bottom: 90, zIndex: 89,
              display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
            }}>
              {[...NAV_ITEMS].reverse().map((item, i) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 16, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ ...SPRING, delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 18px 10px 14px", borderRadius: 28,
                      background: isActive ? item.bg : "#fff",
                      border: `${isActive ? 2 : 1.5}px solid ${item.border}`,
                      boxShadow: isActive
                        ? `0 4px 20px ${item.border}99`
                        : "0 2px 12px rgba(0,0,0,0.14)",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 15, fontWeight: isActive ? 700 : 500,
                      color: isActive ? item.color : "#333",
                    }}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, marginLeft: 2, display: "inline-block" }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.button
          onClick={() => setMobileMenuOpen((o) => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            position: "fixed", right: 16, bottom: 20, zIndex: 89,
            width: 56, height: 56, borderRadius: "50%",
            background: mobileMenuOpen ? "#1a1830" : "#7F77DD",
            border: "none", color: "#fff",
            fontSize: 24, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: mobileMenuOpen
              ? "0 4px 20px rgba(26,24,48,0.5)"
              : "0 4px 20px rgba(127,119,221,0.55)",
          }}
        >
          <motion.span
            animate={{ rotate: mobileMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          >
            {mobileMenuOpen ? "×" : "⊕"}
          </motion.span>
        </motion.button>
      </div>
    </>
  );
}
