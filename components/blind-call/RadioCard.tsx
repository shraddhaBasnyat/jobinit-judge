import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

export type SubOption = { id: string; label: string; hook: string }

export type SelectOption = {
  id: string
  label: string
  hook: string
  subOptions?: SubOption[]
  subOptionsPrompt?: string
}

// Top-level and sub-level indicators use different white tokens per the raw
// Figma export — top-level maps to --card, sub-level to --background — not
// the same color, despite looking similar in the rendered screenshots.
function RadioIndicator({ selected, background }: { selected: boolean; background: "card" | "background" }) {
  const bg = background === "card" ? "bg-card" : "bg-background"
  if (selected) {
    return (
      <div aria-hidden="true" className={cn("relative size-4 shrink-0 rounded-full border border-primary", bg)}>
        <div className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </div>
    )
  }
  return (
    <div aria-hidden="true" className={cn("size-[18px] shrink-0 rounded-full border border-primary", bg)} />
  )
}

export type RadioCardProps = {
  option: SelectOption
  selected: boolean
  selectedSubId?: string
  onSelectSub: (subId: string) => void
}

// Radio.Root *is* the card — no separate wrapping div. It renders a <span>
// by default, but applying flex classes directly works fine since
// display:flex overrides the span's inline default. This keeps the whole
// card as a single Base UI interactive element (no competing onClick on a
// wrapper vs. Base UI's own click/keyboard path) — same reasoning
// StatementAssess.tsx documents for why per-item click handlers break
// keyboard nav. Top-level selection is driven entirely by the enclosing
// RadioGroup in BranchingSingleSelect; this component relays nothing upward
// for its own selection, only for its nested sub-choice.
export function RadioCard({ option, selected, selectedSubId, onSelectSub }: RadioCardProps) {
  const hasSubOptions = Boolean(option.subOptions?.length)

  return (
    <Radio.Root
      value={option.id}
      aria-label={option.label}
      data-testid={`radio-card-${option.id}`}
      className={cn(
        "flex w-full items-start gap-3 rounded-[12px] px-3.5 py-4 text-left",
        selected ? "border-2 border-primary bg-secondary" : "border border-border bg-muted/30"
      )}
    >
      <RadioIndicator selected={selected} background="card" />
      <div className="flex w-full flex-col">
        <p className="text-sm leading-[14px] font-bold text-primary">{option.label}</p>
        <p className="text-[13px] leading-[14px] font-medium text-foreground">{option.hook}</p>
        {selected && hasSubOptions && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-[13px] leading-[14px] font-medium text-foreground">
              {option.subOptionsPrompt}
            </p>
            <RadioGroup
              aria-label={option.subOptionsPrompt}
              value={selectedSubId ?? ""}
              onValueChange={(next) => onSelectSub(next as string)}
              className="flex flex-col gap-2"
            >
              {option.subOptions!.map((sub) => (
                <Radio.Root
                  key={sub.id}
                  value={sub.id}
                  aria-label={`${sub.label}. ${sub.hook}`}
                  data-testid={`radio-card-sub-${sub.id}`}
                  className="flex h-7 w-full items-center gap-2 text-left"
                >
                  <RadioIndicator selected={selectedSubId === sub.id} background="background" />
                  <p className="text-sm leading-[14px] font-semibold text-primary">
                    {sub.label}. {sub.hook}
                  </p>
                </Radio.Root>
              ))}
            </RadioGroup>
          </div>
        )}
      </div>
    </Radio.Root>
  )
}
