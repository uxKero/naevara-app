import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shared Clow surface recipes.
 *
 * Focus language (no halo rings):
 *  - fields: border warms toward accent + surface lifts slightly
 *  - keyboard still gets a visible cue via border/bg — never ring-offset boxes
 *
 * Materials sit ON the page (outer glow for elevation only).
 */
export const clow = {
  /** Shared focus for paper fields — no ring, no offset. */
  fieldFocus:
    "outline-none focus-visible:border-accent/45 focus-visible:[background-color:var(--glass-menu)]",

  /** Shared focus for controls without a strong border change. */
  controlFocus:
    "outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/30",

  /** Hairline of light on the top edge — raised surfaces only. */
  edgeLight:
    "before:pointer-events-none before:absolute before:inset-x-4 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  edgeLightWide:
    "before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  edgeLightNarrow:
    "before:pointer-events-none before:absolute before:inset-x-2 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  edgeLightCard:
    "before:pointer-events-none before:absolute before:inset-x-6 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",

  /** Soft white wash from the top of float panels. */
  topWash:
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-gradient-to-b after:from-white/[0.14] after:to-transparent after:to-45%",

  /**
   * Real frosted glass (iOS material).
   * Low-alpha fill + strong backdrop blur. Never paint an opaque slab —
   * page content under the panel (buttons, fields) must still read through.
   *
   * IMPORTANT: no `filter` / `scale` on this same node — both create a
   * backdrop root and kill the see-through blur of the page.
   */
  glassSurface: [
    "border border-glass-menu-border text-foreground",
    "[background-color:var(--glass-menu)]",
    "[backdrop-filter:var(--glass-filter)]",
    "[-webkit-backdrop-filter:var(--glass-filter)]",
  ].join(" "),

  /**
   * Glass field — inputs / select triggers. Slightly denser than menus
   * so typed text stays crisp; still frosted, not paper.
   */
  paperField: [
    "rounded-md border border-input text-foreground",
    "[background-color:var(--glass-field)]",
    "[backdrop-filter:var(--glass-filter)]",
    "[-webkit-backdrop-filter:var(--glass-filter)]",
    "outline-none",
    "transition-[border-color,background-color,color] duration-(--motion-base) ease-out-quart",
    "focus-visible:border-accent/45 focus-visible:[background-color:var(--glass-menu)]",
    "aria-invalid:border-destructive/65 aria-invalid:bg-destructive/[0.05]",
    "disabled:pointer-events-none disabled:opacity-45",
  ].join(" "),

  /**
   * Bottom focus mark for buttons/groups that support ::after.
   * Grows from center on focus / open — soft detail, not a border.
   */
  focusMark: [
    "relative",
    "after:pointer-events-none after:absolute after:bottom-px after:left-1/2 after:z-[1]",
    "after:h-px after:w-0 after:-translate-x-1/2 after:rounded-full",
    "after:bg-[color-mix(in_oklch,var(--accent)_75%,transparent)]",
    "after:transition-[width] after:duration-700 after:ease-[cubic-bezier(0.22,1,0.36,1)]",
  ].join(" "),

  /** Frost chip — tooltips, tiny floating labels. */
  frostChip: [
    "relative rounded-md border border-glass-menu-border text-foreground",
    "shadow-[0_4px_16px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_0_10px_2px_rgba(255,255,255,0.25)]",
    "[background-color:var(--glass-menu)]",
    "[backdrop-filter:var(--glass-filter)]",
    "[-webkit-backdrop-filter:var(--glass-filter)]",
    "before:pointer-events-none before:absolute before:inset-x-2 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  /**
   * Float glass — dialogs, sheets, command.
   * A bit denser than menus for longer reading; still see-through.
   */
  floatGlass: [
    "relative border border-glass-menu-border text-foreground",
    "shadow-[0_12px_48px_0_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(255,255,255,0.1),inset_0_0_24px_6px_rgba(255,255,255,0.25)]",
    "[background-color:var(--glass-float)]",
    "[backdrop-filter:var(--glass-filter)]",
    "[-webkit-backdrop-filter:var(--glass-filter)]",
    "before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  /**
   * Float glass compact — select / combobox / dropdown / context menus.
   * Must stay translucent enough to read content under it (e.g. Register).
   */
  floatMenu: [
    "relative border border-glass-menu-border text-foreground outline-none",
    "[background-color:var(--glass-menu)]",
    "[backdrop-filter:var(--glass-filter)]",
    "[-webkit-backdrop-filter:var(--glass-filter)]",
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(255,255,255,0.1),inset_0_0_16px_4px_rgba(255,255,255,0.28)]",
    "before:pointer-events-none before:absolute before:inset-x-4 before:-top-px before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  /**
   * Enter/exit — opacity only.
   * No scale/filter here: both create a backdrop root and kill glass blur.
   */
  floatEnter: [
    "transition-opacity duration-(--motion-base) ease-out-quart",
    "data-starting-style:opacity-0",
    "data-ending-style:opacity-0 data-ending-style:duration-(--motion-fast)",
  ].join(" "),

  /**
   * Solid material — the opaque sibling of every glass recipe.
   * Same geometry, edge-light and shadows; zero see-through. Components
   * expose it via `material="solid"`; glass stays the default.
   */
  solidMenu: [
    "relative border border-border bg-solid-surface text-foreground outline-none",
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
    "before:pointer-events-none before:absolute before:inset-x-4 before:-top-px before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  solidFloat: [
    "relative border border-border bg-solid-surface text-foreground",
    "shadow-[0_12px_48px_0_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
    "before:pointer-events-none before:absolute before:inset-x-8 before:-top-px before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  solidChip: [
    "relative rounded-md border border-border bg-solid-surface text-foreground",
    "shadow-[0_4px_16px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
    "before:pointer-events-none before:absolute before:inset-x-2 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-(--edge-light) before:to-transparent",
  ].join(" "),

  /** Menu / list item — soft vibrancy wash, never a left bar. */
  menuItem: [
    "relative z-[1] flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
    "transition-[background-color,color] duration-(--motion-fast) ease-out-quart",
    "data-highlighted:[background-color:var(--glass-highlight)] data-highlighted:text-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),

  menuItemDestructive:
    "text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive",

  /** Dimmed overlay with soft vignette for modals. */
  vignette:
    "bg-overlay [backdrop-filter:blur(var(--overlay-blur,6px))] [-webkit-backdrop-filter:blur(var(--overlay-blur,6px))] [background-image:radial-gradient(ellipse_at_center,transparent_0%,oklch(0.2_0.01_84_/_0.18)_100%)]",

  /** Soft luminous head on the leading edge of a progress fill. */
  luminousHead:
    "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-3 after:rounded-full after:bg-gradient-to-r after:from-transparent after:to-white/40",
} as const
