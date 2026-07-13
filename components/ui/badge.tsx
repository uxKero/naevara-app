import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Status chip. Soft wash + border; glow is outer only.
 * Optional leading status bead via `dot`.
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium select-none",
    "transition-[border-color,background-color,box-shadow,transform] duration-(--motion-fast) ease-out-quart",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  ],
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/12 text-primary",
        outline: "border-border-strong bg-transparent text-foreground",
        success: "border-success/30 bg-success/12 text-success",
        warning: "border-warning/30 bg-warning/12 text-warning",
        destructive: "border-destructive/30 bg-destructive/12 text-destructive",
        glow: [
          "border-accent/40 bg-accent-soft/70 text-accent",
          "shadow-[0_0_14px_-3px_var(--glow-accent)]",
        ].join(" "),
        glass: [
          "border-glass-menu-border text-foreground",
          "[background-color:var(--glass-field)]",
          "[backdrop-filter:var(--glass-filter)]",
          "[-webkit-backdrop-filter:var(--glass-filter)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const dotColor: Record<
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>,
  string
> = {
  default: "bg-primary",
  outline: "bg-foreground/55",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  glow: "bg-accent shadow-[0_0_6px_var(--glow-accent)]",
  glass: "bg-foreground/55",
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Leading status bead tinted by variant. */
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const v = variant ?? "default"
  return (
    <span
      data-clow="badge"
      className={cn(badgeVariants({ variant: v }), className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          data-clow-part="badge-dot"
          className={cn(
            "size-1.5 shrink-0 rounded-full transition-transform duration-(--motion-base) ease-spring",
            v === "glow" && "animate-pulse",
            dotColor[v]
          )}
        />
      ) : null}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
