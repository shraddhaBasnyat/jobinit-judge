"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { TextField } from "@/components/blind-call/TextField"

export type InputWithButtonValue = { value: string }

export function isInputWithButtonFilled(value: InputWithButtonValue): boolean {
  return value.value.trim().length > 0
}

function isDirtyDraft(draft: string, lastCommitted: string): boolean {
  return draft.trim().length > 0 && draft !== lastCommitted
}

export type InputWithButtonProps = {
  title?: string
  value: string
  onAdd: (value: string) => void
  onDraftDirtyChange?: (isDirty: boolean) => void
  placeholder?: string
}

export function InputWithButton({
  title,
  value,
  onAdd,
  onDraftDirtyChange,
  placeholder,
}: InputWithButtonProps) {
  const [draft, setDraft] = useState(value)
  const [lastCommitted, setLastCommitted] = useState(value)
  // Add means "there's something new to add," not just "there's text" — a
  // draft matching what's already committed (e.g. right after a successful
  // Add) must not leave the button enabled. Same value doubles as this
  // component's "unsaved draft" signal for consumers.
  const canAdd = isDirtyDraft(draft, lastCommitted)

  // onDraftDirtyChange fires synchronously inside the handlers below, not
  // from a useEffect reacting to canAdd — an effect runs one commit+paint
  // after the state change it reacts to, leaving a window where a consumer
  // gating on it (CarouselShell's forward-nav check, via JDStageContent) can
  // read stale, not-yet-dirty state. Calling it here lets React 18 batch it
  // with the local state update into the same render.
  function handleDraftChange(next: string) {
    setDraft(next)
    onDraftDirtyChange?.(isDirtyDraft(next, lastCommitted))
  }

  function handleAdd() {
    if (!canAdd) return
    onAdd(draft)
    setLastCommitted(draft)
    onDraftDirtyChange?.(false)
  }

  return (
    <div className="flex flex-col gap-1" data-testid="input-with-button">
      {title ? <p className="text-prompt-question">{title}</p> : null}
      <div className="flex items-center justify-end gap-1">
        <TextField
          value={draft}
          onValueChange={handleDraftChange}
          placeholder={placeholder}
          data-testid="input-with-button-field"
        />
        {/* No visual confirmation that Add succeeded (e.g. a checkmark) —
            that affordance belongs to Ticket 4's InputWithInlineSave, out of
            scope here. */}
        <Button
          type="button"
          data-testid="input-with-button-add"
          disabled={!canAdd}
          aria-disabled={!canAdd}
          className="h-6 rounded-[12px] px-3 text-[11px] font-medium"
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
