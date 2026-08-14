"use client"

import { useRef, useState } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { TextField } from "@/components/blind-call/TextField"

const CHAR_LIMIT = 140
const COUNTER_VISIBLE_THRESHOLD = 100
const COUNTER_WARNING_THRESHOLD = 130

// Distinct from InputWithButton's isDirtyDraft: that one requires a non-empty
// draft (it's gating an explicit Add action, and you can't "add" nothing).
// This one must report dirty even when the draft is cleared to empty, since
// committing that clear is itself a pending change that could be lost.
function isDraftDirty(draft: string, lastCommitted: string): boolean {
  return draft.trim() !== lastCommitted.trim()
}

export type InputWithInlineSaveProps = {
  value: string
  onCommit: (value: string) => void
  onDraftDirtyChange?: (isDirty: boolean) => void
  placeholder?: string
}

export function InputWithInlineSave({
  value,
  onCommit,
  onDraftDirtyChange,
  placeholder,
}: InputWithInlineSaveProps) {
  const [draft, setDraft] = useState(value)
  const [lastCommitted, setLastCommitted] = useState(value)
  const scrollYOnFocusRef = useRef<number | null>(null)

  // filled means "the currently-displayed draft matches what's committed" —
  // recomputed live on every keystroke, not a one-way flag set at first save.
  // Re-editing an already-committed note un-checks it immediately, the same
  // "differs from committed" comparison InputWithButton uses for its Add
  // button's disabled state.
  const filled = Boolean(lastCommitted.trim()) && draft.trim() === lastCommitted.trim()

  const charCount = draft.length
  const showCounter = charCount >= COUNTER_VISIBLE_THRESHOLD
  const counterIsWarning = charCount >= COUNTER_WARNING_THRESHOLD

  function handleDraftChange(next: string) {
    setDraft(next)
    onDraftDirtyChange?.(isDraftDirty(next, lastCommitted))
  }

  // Same mobile-viewport-Chromium bug CarouselShell's track-wide guard
  // covers for pills/radios (see its comment), but that general,
  // detection-based guard doesn't reliably catch this field's jump —
  // confirmed via real device testing after it looked fixed in automation.
  // Narrower fix instead: this field's known bad trigger is blur/commit,
  // so just record the scroll position on focus and force it back,
  // unconditionally, right after blur — no attempt to detect whether a
  // jump actually happened. Checked whether a matching per-keystroke
  // restore is also needed for a mid-typing jump; couldn't reproduce one
  // under this fix across repeated runs, so not adding it speculatively —
  // if a visible mid-typing jump shows up in real use, add the same
  // pattern to handleDraftChange below.
  function handleFocus() {
    scrollYOnFocusRef.current = window.scrollY
  }

  function handleBlur() {
    // MVP scope: this only commits to local component state. Backend write happens
    // once, batched across all stages, on Next-click/swipe-forward — not per field.
    // If the user closes the tab before finishing the flow, everything here is lost
    // despite the checkmark showing "saved." Accepted tradeoff for MVP (short,
    // single-sitting flow). Revisit with a sessionStorage/localStorage safety net
    // if usage data shows people abandoning and returning mid-flow.
    setLastCommitted(draft)
    onCommit(draft)
    onDraftDirtyChange?.(false)

    const savedScrollY = scrollYOnFocusRef.current
    scrollYOnFocusRef.current = null
    if (savedScrollY != null) {
      requestAnimationFrame(() => {
        if (window.scrollY !== savedScrollY) {
          window.scrollTo(0, savedScrollY)
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2" data-testid="multi-select-with-note-note-row">
        <TextField
          value={draft}
          onValueChange={handleDraftChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          data-testid="multi-select-with-note-note-field"
        />
        <div className="flex h-3 w-3 shrink-0 items-center justify-center">
          <div
            data-testid="multi-select-with-note-note-checkmark"
            aria-hidden="true"
            className={cn(
              "flex h-3 w-3 items-center justify-center rounded-full bg-reviewed transition-opacity",
              filled ? "opacity-100" : "opacity-0"
            )}
          >
            <Check className="h-2 w-2 text-background" strokeWidth={3} />
          </div>
        </div>
      </div>
      {showCounter ? (
        <span
          className={cn(
            "text-[10px]",
            counterIsWarning ? "text-warning" : "text-muted-foreground"
          )}
        >
          {charCount}/{CHAR_LIMIT}
        </span>
      ) : null}
    </div>
  )
}
