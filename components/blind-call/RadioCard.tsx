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

// Styled entirely off the enclosing Radio.Root's own data-checked/
// data-unchecked — no selected prop, since both call sites already sit
// directly inside a Radio.Root that tracks this boolean for free.
//
// `nested` picks a *named* Tailwind group (group/option vs group/sub)
// rather than the plain `group` class: the nested sub-option Radio.Root
// sits inside the top-level card's own Radio.Root, and Tailwind's
// group-data-* variant matches *any* ancestor with a matching group class
// that has the attribute — not just the nearest one. With both Radio.Roots
// sharing the unnamed `group` class, a checked top-level card bled its
// data-checked down into every nested sub-option indicator regardless of
// that sub-option's own state (all sub-options rendered as checked
// whenever the parent card was selected). Named groups scope each
// indicator to its own Radio.Root only.
function RadioIndicator({ nested = false }: { nested?: boolean }) {
  if (nested) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "relative shrink-0 rounded-full border border-primary bg-card",
          "group-data-unchecked/sub:size-4.5",
          "group-data-checked/sub:size-4"
        )}
      >
        <div className="absolute top-1/2 left-1/2 hidden size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary group-data-checked/sub:block" />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative shrink-0 rounded-full border border-primary bg-card",
        "group-data-unchecked/option:size-4.5",
        "group-data-checked/option:size-4"
      )}
    >
      <div className="absolute top-1/2 left-1/2 hidden size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary group-data-checked/option:block" />
    </div>
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
        "group/option flex w-full items-start gap-3 rounded-[12px] px-3.5 py-4 text-left",
        selected ? "border-2 border-primary bg-secondary" : "border border-border bg-muted/30"
      )}
    >
      <RadioIndicator />
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
                  className="group/sub flex h-7 w-full items-center gap-2 text-left"
                >
                  <RadioIndicator nested />
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
