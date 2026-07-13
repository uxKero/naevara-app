import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Light is state: hover grows outer glow, press settles scale,
 * disabled is unlit. Focus is a soft surface cue — never a ring box.
 * Destructive never glows.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium select-none",
    "transition-[background-color,border-color,color,box-shadow,transform,filter] duration-(--motion-base) ease-out-quart",
    "outline-none focus-visible:brightness-105",
    "active:scale-[0.97] active:duration-(--motion-fast)",
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:saturate-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-glow-sm",
          "hover:bg-primary/92 hover:shadow-glow",
          "active:shadow-glow-sm",
          "focus-visible:shadow-glow",
        ].join(" "),
        glow: [
          "bg-accent text-accent-foreground shadow-glow-accent",
          "hover:brightness-105 hover:shadow-[0_2px_12px_-2px_var(--glow-accent),0_8px_28px_-6px_var(--glow-accent)]",
          "active:brightness-95 active:shadow-glow-accent",
        ].join(" "),
        outline: [
          "border border-border-strong bg-transparent text-foreground",
          "hover:border-accent/45 hover:bg-accent-soft/40 hover:text-foreground",
          "focus-visible:border-accent/50 focus-visible:bg-accent-soft/30",
          "active:bg-accent-soft/55",
        ].join(" "),
        ghost: [
          "text-muted-foreground",
          "hover:bg-muted/50 hover:text-foreground",
          "focus-visible:bg-muted/45 focus-visible:text-foreground",
          "active:bg-muted/65",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/88",
          "focus-visible:brightness-105",
        ].join(" "),
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return (
    <button
      data-clow="button"
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
