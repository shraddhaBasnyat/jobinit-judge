import { cn } from "@/lib/utils"

// Pill's structural shape (padding/height/radius/font) lives in one
// unexported base component here, with StatusPill (tone-driven bucket tags)
// and TogglePill (selected-driven toggle chips) as the only exported
// wrappers — colocated deliberately, not split into separate files, because
// JS/TS module privacy is per-file: a non-exported symbol can only be
// imported by code in this same file. Splitting these into separate files
// would force the base Pill to be exported for StatusPill/TogglePill to
// reach it, making it importable (and renderable, unstyled and invisible)
// from anywhere else too. Keep them together.

type PillProps = {
  label: string
  className?: string
} & Omit<React.ComponentProps<"span">, "className" | "children">

function Pill({ label, className, ...rest }: PillProps) {
  return (
    <span
      data-testid="pill"
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-full px-3 text-[11px] leading-none",
        className
      )}
      {...rest}
    >
      {label}
    </span>
  )
}

export type PillTone = "default" | "positive" | "neutral" | "negative"

export type StatusPillProps = {
  tone: PillTone
  label: string
}

export function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <Pill
      label={label}
      data-pill-tone={tone}
      className={cn(
        tone === "default" && "bg-secondary font-normal text-foreground",
        tone === "positive" && "border border-success font-medium text-success",
        tone === "neutral" && "border border-border font-medium text-muted-foreground",
        tone === "negative" && "border border-warning font-medium text-warning"
      )}
    />
  )
}

export type TogglePillProps = {
  selected: boolean
  label: string
}

export function TogglePill({ selected, label }: TogglePillProps) {
  return (
    <Pill
      label={label}
      data-pill-selected={selected}
      className={cn(
        selected
          ? "bg-secondary font-normal text-foreground"
          : "border border-border font-medium text-muted-foreground"
      )}
    />
  )
}
