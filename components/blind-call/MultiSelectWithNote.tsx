import { TogglePill } from "@/components/blind-call/Pill"
import { InputWithInlineSave } from "@/components/blind-call/InputWithInlineSave"

export type MultiSelectWithNoteValue = {
  selected: string[]
  note?: string
}

export function isMultiSelectWithNoteComplete(value: MultiSelectWithNoteValue): boolean {
  return value.selected.length > 0 || Boolean(value.note?.trim())
}

export type MultiSelectWithNoteProps = {
  title: string
  instructionLabel: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
  notePlaceholder?: string
  note?: string
  onNoteChange?: (value: string) => void
  onNoteDraftDirtyChange?: (isDirty: boolean) => void
}

export function MultiSelectWithNote({
  title,
  instructionLabel,
  options,
  selected,
  onToggle,
  notePlaceholder,
  note,
  onNoteChange,
  onNoteDraftDirtyChange,
}: MultiSelectWithNoteProps) {
  return (
    <div className="flex flex-col gap-3" data-testid="multi-select-with-note">
      <p className="text-prompt-question">{title}</p>
      <p className="text-[11px] leading-5 font-semibold text-muted-foreground">
        {instructionLabel}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option)}
              data-testid={`multi-select-with-note-pill-${option}`}
              className="cursor-pointer rounded-full border-0 bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <TogglePill selected={isSelected} label={option} />
            </button>
          )
        })}
      </div>
      <InputWithInlineSave
        value={note ?? ""}
        onCommit={(value) => onNoteChange?.(value)}
        onDraftDirtyChange={onNoteDraftDirtyChange}
        placeholder={notePlaceholder}
      />
    </div>
  )
}
