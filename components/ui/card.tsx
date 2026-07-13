import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { clow, cn } from "@/lib/utils"

/**
 * Glass panel with edge-light. Surfaces rest on the page —
 * outer glow only, never carved inset.
 *
 *  - glass (default): frosted panel
 *  - plain: solid paper
 *  - soft: quieter border, no blur
 *  - interactive: lifts on hover
 */
const cardVariants = cva(["relative text-foreground", clow.edgeLightCard], {
  variants: {
    variant: {
      glass: [
        "rounded-xl border border-glass-menu-border",
        "[background-color:var(--glass-field)]",
        "[backdrop-filter:var(--glass-filter)]",
        "[-webkit-backdrop-filter:var(--glass-filter)]",
        "shadow-glow-sm",
      ].join(" "),
      plain: "rounded-xl border border-border bg-background",
      soft: "rounded-xl border border-border/70 bg-surface-1/50",
      interactive: [
        "rounded-xl border border-glass-menu-border shadow-glow-sm",
        "[background-color:var(--glass-field)]",
        "[backdrop-filter:var(--glass-filter)]",
        "[-webkit-backdrop-filter:var(--glass-filter)]",
        "transition-[box-shadow,transform,border-color] duration-(--motion-base) ease-out-quart",
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow",
        "active:translate-y-0 active:shadow-glow-sm",
        "cursor-pointer",
      ].join(" "),
    },
  },
  defaultVariants: {
    variant: "glass",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-clow="card"
      data-variant={variant ?? "glass"}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-clow-part="card-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-clow-part="card-title"
      className={cn(
        "font-display text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-clow-part="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-clow-part="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-clow-part="card-footer"
      className={cn("flex items-center gap-2 p-6 pt-0", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
