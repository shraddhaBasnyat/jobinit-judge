import type { LucideIcon } from "lucide-react"
import { Radio } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"
import type { AssessOption } from "@/components/blind-call/StatementAssess"

// AssessOptionBase's structural shape (icon + label) lives here, unexported,
// with AssessOptionLegend (visible label) and AssessOptionRadio (sr-only
// label) as the only wrappers — colocated deliberately, same reasoning as
// Pill.tsx's base/StatusPill/TogglePill grouping: JS/TS module privacy is
// per-file, so splitting this out would force the base to be exported (and
// renderable, unstyled, from anywhere else) just so the wrappers could reach
// it. Keep them together.

type AssessOptionBaseProps = {
  icon: LucideIcon
  label: string
  hideLabel?: boolean
  iconClassName?: string
}

function AssessOptionBase({ icon: Icon, label, hideLabel, iconClassName }: AssessOptionBaseProps) {
  return (
    <>
      <Icon aria-hidden="true" className={iconClassName} />
      <span className={cn("text-[11px] leading-5 font-bold text-primary", hideLabel && "sr-only")}>
        {label}
      </span>
    </>
  )
}

export type AssessOptionLegendProps = {
  option: AssessOption
}

export function AssessOptionLegend({ option }: AssessOptionLegendProps) {
  return (
    <span
      data-testid={`assess-option-legend-${option.value}`}
      className="flex items-center justify-center gap-1"
    >
      <AssessOptionBase icon={option.icon} label={option.label} iconClassName="size-4 text-primary" />
    </span>
  )
}

export type AssessOptionRadioProps = {
  option: AssessOption
}

// Presentational only — value/onValueChange live on the owning RadioGroup in
// StatementAssess, which is the sole selection driver for both click and
// keyboard nav (confirmed by reading Base UI's Radio/RadioGroup source: a
// per-item click handler here would never fire on arrow-key navigation,
// since that path clicks the hidden input directly, not this element).
//
// aria-label is set explicitly here rather than relying on the sr-only
// label text nested inside: ARIA's accessible-name computation for
// role="radio" is "Name from: author" only, unlike button/link — content
// text is never used as a fallback, confirmed by an actual failing
// getByRole("radio", { name: ... }) Playwright assertion before this was
// added.
export function AssessOptionRadio({ option }: AssessOptionRadioProps) {
  return (
    <Radio.Root
      value={option.value}
      aria-label={`Mark as ${option.label.toLowerCase()}`}
      data-testid={`assess-option-radio-${option.value}`}
      className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-full group-data-checked:bg-secondary group-data-unchecked:border group-data-unchecked:border-border group-data-unchecked:bg-background"
      >
        <AssessOptionBase
          icon={option.icon}
          label={`Mark as ${option.label.toLowerCase()}`}
          hideLabel
          iconClassName="size-4 group-data-checked:text-primary group-data-unchecked:text-muted-foreground"
        />
      </div>
    </Radio.Root>
  )
}
