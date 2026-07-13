"use client"

import * as React from "react"
import { Tabs as BaseTabs } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

/**
 * Tabs in three languages, one primitive:
 *  - pill (default): a soft rail; the active cue is a quiet pill with an
 *    accent hairline that rides the sliding indicator.
 *  - underline: flat triggers on a hairline with an ember underline that
 *    springs between tabs.
 *  - browser: folder chrome; the active tab lifts into paper and merges
 *    with the panel below, like a browser window.
 */

export type TabsVariant = "pill" | "underline" | "browser"

const TabsVariantContext = React.createContext<TabsVariant>("pill")

const LIST: Record<TabsVariant, string> = {
  pill: "relative isolate inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-surface-1/80 p-1 backdrop-blur-md",
  underline:
    "relative isolate inline-flex w-fit items-center gap-1 border-b border-border",
  browser:
    "relative inline-flex w-full items-end gap-0.5 border-b border-border px-1",
}

const TRIGGER: Record<TabsVariant, string> = {
  pill: "h-7 rounded-md px-3 data-active:font-semibold",
  underline: "h-9 rounded-none px-3 data-active:font-semibold",
  browser:
    "h-9 rounded-t-lg border border-transparent px-3.5 data-active:z-10 data-active:-mb-px data-active:border-border data-active:border-b-transparent data-active:bg-surface-1 data-active:shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
}

const CONTENT: Record<TabsVariant, string> = {
  pill: "rounded-md",
  underline: "rounded-md",
  browser: "rounded-b-lg border border-t-0 border-border bg-surface-1 p-4",
}

function Tabs({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<typeof BaseTabs.Root> & { variant?: TabsVariant }) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root
        data-clow="tabs"
        data-variant={variant}
        className={cn(
          "flex flex-col",
          variant === "browser" ? "gap-0" : "gap-2",
          className
        )}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <BaseTabs.List
      data-clow-part="tabs-list"
      className={cn(LIST[variant], className)}
      {...props}
    >
      {children}
      {variant === "pill" ? (
        <BaseTabs.Indicator
          data-clow-part="tabs-indicator"
          renderBeforeHydration
          className={cn(
            "absolute top-0 left-0 -z-10 rounded-md bg-surface-3/75",
            "h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top)",
            "transition-[translate,width,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "after:pointer-events-none after:absolute after:bottom-[3px] after:left-1/2 after:h-[1.5px]",
            "after:w-[min(1.75rem,55%)] after:-translate-x-1/2 after:rounded-full",
            "after:bg-[color-mix(in_oklch,var(--accent)_82%,transparent)]",
            "after:shadow-[0_0_10px_-1px_var(--glow-accent)]",
            "after:transition-[width,opacity] after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)]"
          )}
        />
      ) : null}
      {variant === "underline" ? (
        <BaseTabs.Indicator
          data-clow-part="tabs-indicator"
          renderBeforeHydration
          className={cn(
            "absolute bottom-[-1px] left-0 -z-10 h-[2px] rounded-full",
            "w-(--active-tab-width) translate-x-(--active-tab-left)",
            "bg-[color-mix(in_oklch,var(--accent)_85%,transparent)] shadow-[0_0_10px_-1px_var(--glow-accent)]",
            "transition-[translate,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          )}
        />
      ) : null}
    </BaseTabs.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <BaseTabs.Tab
      data-clow-part="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground select-none outline-none",
        "transition-colors duration-(--motion-base) ease-out-quart",
        "hover:text-foreground data-active:text-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-45",
        TRIGGER[variant],
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <BaseTabs.Panel
      data-clow-part="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-starting-style:translate-y-0.5 data-starting-style:opacity-0",
        CONTENT[variant],
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
