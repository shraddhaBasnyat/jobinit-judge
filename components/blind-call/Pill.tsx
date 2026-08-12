import { cn } from "@/lib/utils"

export type PillTone = "default" | "positive" | "neutral" | "negative"

export type PillProps = {
  tone: PillTone
  label: string
}

export function Pill({ tone, label }: PillProps) {
  return (
    <span
      data-testid="pill"
      data-pill-tone={tone}
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-full px-3 text-[11px] leading-none",
        tone === "default" && "bg-secondary font-normal text-foreground",
        tone === "positive" && "border border-success font-medium text-success",
        tone === "neutral" && "border border-border font-medium text-muted-foreground",
        tone === "negative" && "border border-warning font-medium text-warning"
      )}
    >
      {label}
    </span>
  )
}
