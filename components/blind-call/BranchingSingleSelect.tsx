import { RadioGroup } from "@base-ui/react/radio-group"

import { RadioCard, type SelectOption } from "@/components/blind-call/RadioCard"

export type BranchingSingleSelectValue = { selectedId?: string; selectedSubId?: string }

// Takes options as a parameter (not closed over) so it stays a pure,
// directly unit-testable function — mirrors isMultiSelectWithNoteComplete's
// shape. Needs the options list to know whether the selected option has
// subOptions, which a value-only signature couldn't answer.
export function isBranchingSingleSelectComplete(
  options: SelectOption[],
  value: BranchingSingleSelectValue
): boolean {
  if (!value.selectedId) return false
  const selected = options.find((o) => o.id === value.selectedId)
  if (selected?.subOptions?.length) return Boolean(value.selectedSubId)
  return true
}

export type BranchingSingleSelectProps = {
  title: string
  options: SelectOption[]
  value: BranchingSingleSelectValue
  onChange: (next: BranchingSingleSelectValue) => void
}

export function BranchingSingleSelect({ title, options, value, onChange }: BranchingSingleSelectProps) {
  return (
    <RadioGroup
      aria-label={title}
      value={value.selectedId ?? ""}
      onValueChange={(next) => onChange({ selectedId: next as string, selectedSubId: undefined })}
      className="flex w-full flex-col gap-2.5"
      data-testid="branching-single-select"
    >
      <p className="text-prompt-question">{title}</p>
      {options.map((option) => (
        <RadioCard
          key={option.id}
          option={option}
          selected={value.selectedId === option.id}
          selectedSubId={value.selectedId === option.id ? value.selectedSubId : undefined}
          onSelectSub={(subId) => onChange({ selectedId: option.id, selectedSubId: subId })}
        />
      ))}
    </RadioGroup>
  )
}
