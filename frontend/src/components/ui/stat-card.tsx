"use client"

// From chatcn, chat, voice and agent UI for shadcn: https://chatcn.dev

import * as React from "react"
import { forwardRef, createElement, type SVGAttributes, type ForwardRefExoticComponent, type RefAttributes } from "react"
import { cn } from "@/lib/utils"

/** chatcn theme variables and utilities this file uses, light and dark. */
const CHATCN_CSS = ":root{--chatcn-border:var(--chatcn-gray-400);--chatcn-card:oklch(1 0 0);--chatcn-chart-1:oklch(0.560 0.170 255);--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-gray-100:oklch(0.970 0 0);--chatcn-gray-1000:oklch(0.145 0 0);--chatcn-gray-400:oklch(0.910 0 0);--chatcn-gray-700:oklch(0.700 0 0);--chatcn-gray-800:oklch(0.525 0 0);--chatcn-gray-900:oklch(0.440 0 0);--chatcn-green:oklch(0.530 0.130 150);--chatcn-radius-lg:12px;--chatcn-radius-xs:4px;--chatcn-red:oklch(0.560 0.200 27);--chatcn-shadow-sm:0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)}.dark{--chatcn-border:var(--chatcn-gray-400);--chatcn-card:oklch(0.175 0 0);--chatcn-chart-1:oklch(0.700 0.150 252);--chatcn-fg:var(--chatcn-gray-1000);--chatcn-fg-faint:var(--chatcn-gray-700);--chatcn-fg-muted:var(--chatcn-gray-900);--chatcn-fg-subtle:var(--chatcn-gray-800);--chatcn-fill:var(--chatcn-gray-100);--chatcn-gray-100:oklch(0.195 0 0);--chatcn-gray-1000:oklch(0.970 0 0);--chatcn-gray-400:oklch(0.285 0 0);--chatcn-gray-700:oklch(0.500 0 0);--chatcn-gray-800:oklch(0.620 0 0);--chatcn-gray-900:oklch(0.720 0 0);--chatcn-green:oklch(0.760 0.150 152);--chatcn-red:oklch(0.700 0.175 22);--chatcn-shadow-sm:0 0 0 1px oklch(1 0 0 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.03), 0 2px 4px oklch(0 0 0 / 0.4)}"
if (typeof document !== "undefined" && !document.getElementById("chatcn-stat-card")) {
  const style = document.createElement("style")
  style.id = "chatcn-stat-card"
  style.textContent = CHATCN_CSS
  document.head.appendChild(style)
}

/* -------------------------------------------------------------------------------------------------
 * Group: a row of stats split by hairlines instead of nested cards.
 * -----------------------------------------------------------------------------------------------*/

export function StatCardGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of figures, not form controls
    <div
      data-slot="stat-card-group"
      role="group"
      className={cn(
        "rounded-(--chatcn-radius-lg) bg-(color:--chatcn-card) shadow-(--chatcn-shadow-sm) flex min-w-0 flex-wrap overflow-hidden",
        // Hairlines between cells, however they wrap: every cell draws its start and top edge and
        // pulls back 1 px, so the outer edges fall outside the clip.
        "[&>[data-slot=stat-card]]:-ms-px [&>[data-slot=stat-card]]:-mt-px [&>[data-slot=stat-card]]:flex-[1_1_11rem]",
        "[&>[data-slot=stat-card]]:border-(color:--chatcn-border) [&>[data-slot=stat-card]]:border-s [&>[data-slot=stat-card]]:border-t",
        "[&>[data-slot=stat-card]]:rounded-none [&>[data-slot=stat-card]]:shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type StatValueFormat = "number" | "compact" | "percent" | "currency"

export interface StatDelta {
  /** Signed change. `0.124` with `format="percent"` reads +12.4%. */
  value: number
  format?: StatValueFormat
  /** The period it compares against: "vs last week". */
  label?: string
}

export interface StatCardProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  /** The figure. Numbers are formatted with `format`; strings render as is. */
  value?: number | string | null
  format?: StatValueFormat
  /** Unit after the value, joined with a non-breaking space. */
  unit?: string
  currency?: string
  locale?: string
  delta?: StatDelta
  /** Which direction is good news. Picks the delta tone. Defaults to `up`. */
  goodDirection?: "up" | "down" | "neutral"
  /** Recent values, oldest first. Drawn as a sparkline; the last point is the current value. */
  trend?: number[]
  /** One quiet line under the value. */
  hint?: React.ReactNode
  loading?: boolean
  streaming?: boolean
  size?: "default" | "lg"
  variant?: "card" | "plain"
}

function formatValue(
  value: number,
  format: StatValueFormat = "number",
  { currency = "USD", locale = "en-US", signed = false } = {},
) {
  const options: Intl.NumberFormatOptions =
    format === "currency"
      ? { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }
      : format === "percent"
        ? { style: "percent", maximumFractionDigits: 1 }
        : format === "compact"
          ? { notation: "compact", maximumFractionDigits: 1 }
          : { maximumFractionDigits: 2 }
  return new Intl.NumberFormat(locale, {
    ...options,
    ...(signed ? { signDisplay: "exceptZero" } : {}),
  }).format(value)
}

interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Width and height. Number means px. Default 24. */
  size?: number | string
  /** Stroke width in viewBox units (24 grid). Default 1.5. */
  strokeWidth?: number | string
  /** Keep the rendered stroke at `strokeWidth` px at any size. */
  absoluteStrokeWidth?: boolean
  /** Stroke color. Default currentColor. */
  color?: string
  /** Accessible name. Renders <title> and sets role="img"; without it the icon is aria-hidden. */
  title?: string
}

type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>

/** Shape elements an icon may contain. */
type IconElement = "path" | "circle" | "rect" | "ellipse" | "line" | "polyline" | "polygon"

/** An icon's drawing: a flat list of [element, attributes] pairs, lucide compatible. */
type IconNode = ReadonlyArray<readonly [IconElement, Readonly<Record<string, string>>]>

const toPascal = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

/**
 * Builds a React icon component from an icon node.
 * `name` is the kebab-case icon name, used for the class `chatcn-icon-<name>` and displayName.
 */
function createIcon(name: string, iconNode: IconNode): Icon {
  // biome-ignore lint/correctness/noComponentHookFactories: runs once per icon at module load
  const Component = forwardRef<SVGSVGElement, IconProps>(function ChatcnIcon(
    {
      size = 24,
      strokeWidth = 1.5,
      absoluteStrokeWidth = false,
      color = "currentColor",
      title,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const stroke = absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number.parseFloat(String(size))
      : strokeWidth
    const labelled = Boolean(title || rest["aria-label"] || rest["aria-labelledby"])
    return createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "data-slot": "icon",
        className: className
          ? `chatcn-icon chatcn-icon-${name} ${className}`
          : `chatcn-icon chatcn-icon-${name}`,
        ...(labelled ? { role: "img" } : { "aria-hidden": true }),
        ...rest,
      },
      title ? createElement("title", null, title) : null,
      ...iconNode.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })),
      children,
    )
  })
  Component.displayName = `${toPascal(name)}Icon`
  return Component
}

const iconNode: IconNode = [
  ["path", {"d":"M5 12h14"}],
]

const MinusIcon: Icon = /* @__PURE__ */ createIcon("minus", iconNode)

const iconNode2: IconNode = [
  ["path", {"d":"M7 7h7.5A2.5 2.5 0 0 1 17 9.5V17"}],
  ["path", {"d":"m7 17 6.46-6.46"}],
]

const ArrowUpRightIcon: Icon = /* @__PURE__ */ createIcon("arrow-up-right", iconNode2)

const iconNode3: IconNode = [
  ["path", {"d":"M17 7v7.5a2.5 2.5 0 0 1-2.5 2.5H7"}],
  ["path", {"d":"m7 7 6.46 6.46"}],
]

const ArrowDownRightIcon: Icon = /* @__PURE__ */ createIcon("arrow-down-right", iconNode3)

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

const NBSP = " "

/* -------------------------------------------------------------------------------------------------
 * Sparkline
 * -----------------------------------------------------------------------------------------------*/

export interface SparklineProps extends Omit<React.ComponentProps<"svg">, "values"> {
  values: number[]
  /** Draw a 10% wash under the line. */
  area?: boolean
}

/** 2 px line in a quiet gray, the latest point in ink. Scales to its box without stretching strokes. */
export function Sparkline({ values, area = true, className, ...props }: SparklineProps) {
  const points = values.filter((v) => Number.isFinite(v))
  if (points.length < 2) {
    return <svg aria-hidden="true" className={cn("h-8 w-24", className)} {...props} />
  }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  // 100 x 32 box with 3 units of air so the end dot is never clipped.
  const xy = points.map((v, i) => [
    (i / (points.length - 1)) * 94 + 3,
    29 - ((v - min) / span) * 26,
  ])
  const d = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join("")
  const [lx, ly] = xy[xy.length - 1] as [number, number]
  const [fx] = xy[0] as [number, number]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      data-slot="sparkline"
      className={cn("h-8 w-24 overflow-visible", className)}
      {...props}
    >
      {area ? (
        <path d={`${d}L${lx},32L${fx},32Z`} fill="var(--chatcn-chart-1)" opacity="0.12" />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="var(--chatcn-chart-1)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* A non-scaling dot: a zero-length round-capped line keeps its shape in a stretched box. */}
      <path
        d={`M${lx},${ly}h0`}
        stroke="var(--chatcn-card)"
        strokeWidth="9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${lx},${ly}h0`}
        stroke="var(--chatcn-chart-1)"
        strokeWidth="6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------------------------------
 * StatCard
 * -----------------------------------------------------------------------------------------------*/

export function StatCard({
  label,
  value,
  format = "number",
  unit,
  currency,
  locale,
  delta,
  goodDirection = "up",
  trend,
  hint,
  loading = false,
  streaming = false,
  size = "default",
  variant = "card",
  className,
  ...props
}: StatCardProps) {
  const hasValue = value !== undefined && value !== null && value !== ""
  const shown =
    typeof value === "number"
      ? formatValue(value, format, { currency, locale })
      : String(value ?? "")
  const pending = loading || (!hasValue && streaming)

  let tone = "text-(color:--chatcn-fg-muted)"
  let DeltaIcon = MinusIcon
  let deltaWord = "No change"
  if (delta && delta.value !== 0) {
    const up = delta.value > 0
    DeltaIcon = up ? ArrowUpRightIcon : ArrowDownRightIcon
    deltaWord = up ? "Up" : "Down"
    if (goodDirection !== "neutral") {
      const good = (goodDirection === "up") === up
      // Green for good news, red for bad; the arrow and the screen reader word carry it without color.
      tone = good ? "text-(color:--chatcn-green) font-medium" : "text-(color:--chatcn-red)"
    }
  }
  const deltaText = delta
    ? formatValue(delta.value, delta.format ?? "percent", { currency, locale, signed: true })
    : ""

  const trendLabel =
    trend && trend.length > 1
      ? `Trend over ${trend.length} periods, from ${formatValue(trend[0] as number, format, { currency, locale })} to ${formatValue(trend[trend.length - 1] as number, format, { currency, locale })}.`
      : undefined

  return (
    <div
      data-slot="stat-card"
      aria-busy={pending || undefined}
      className={cn(
        "text-[0.875rem]/[1.25rem] tracking-[-0.003em] text-(color:--chatcn-fg) flex min-w-0 flex-col gap-1",
        variant === "card" && "rounded-(--chatcn-radius-lg) bg-(color:--chatcn-card) shadow-(--chatcn-shadow-sm) p-4",
        className,
      )}
      {...props}
    >
      <div className="text-[0.8125rem]/[1.25rem] text-(color:--chatcn-fg-subtle) flex min-w-0 items-center gap-2">
        <span className="truncate">{label}</span>
      </div>
      {/* Value and sparkline share a row; the delta gets the full width under them. */}
      <div className="flex min-w-0 items-end justify-between gap-3">
        {pending ? (
          <span
            aria-hidden="true"
            className={cn(
              "bg-(color:--chatcn-fill) rounded-(--chatcn-radius-xs) block",
              // Bars sit in the figure's own line box (44 / 32 px), so the card keeps its height when data lands.
              size === "lg" ? "my-1.5 h-8 w-28" : "my-1 h-6 w-20",
            )}
          />
        ) : (
          <span
            data-slot="stat-card-value"
            className={cn(
              // The figure wins the row and never truncates: the sparkline gives up its width first.
              "text-(color:--chatcn-fg) shrink-0 font-semibold tracking-tight whitespace-nowrap tabular-nums",
              size === "lg" ? "text-[2.5rem]/[2.75rem] tracking-[-0.035em]" : "text-[1.5rem]/[2rem] tracking-[-0.022em]",
            )}
          >
            {hasValue ? shown : "-"}
            {unit && hasValue ? (
              <span className="text-[0.875rem]/[1.25rem] tracking-[-0.003em] text-(color:--chatcn-fg-subtle) ms-0.5 font-normal tracking-normal">
                {NBSP}
                {unit}
              </span>
            ) : null}
          </span>
        )}
        {trend && trend.length > 1 ? (
          <>
            <Sparkline
              values={trend}
              className={cn(
                "mb-1 min-w-6 flex-1",
                size === "lg" ? "h-10 max-w-32" : "h-7 max-w-20",
              )}
            />
            <span className="sr-only">{trendLabel}</span>
          </>
        ) : null}
      </div>
      {delta ? (
        <span className={cn("text-[0.8125rem]/[1.25rem] flex min-w-0 items-center gap-1 tabular-nums", tone)}>
          <DeltaIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">{deltaWord}</span>
          <span className="shrink-0 font-medium">{deltaText}</span>
          {delta.label ? (
            <span className="text-(color:--chatcn-fg-subtle) truncate">{delta.label}</span>
          ) : null}
        </span>
      ) : pending ? (
        <span aria-hidden="true" className="bg-(color:--chatcn-fill) rounded-(--chatcn-radius-xs) my-1 block h-3 w-24" />
      ) : null}
      {hint ? <p className="text-[0.75rem]/[1rem] text-(color:--chatcn-fg-subtle) text-pretty">{hint}</p> : null}
    </div>
  )
}

export default StatCard
