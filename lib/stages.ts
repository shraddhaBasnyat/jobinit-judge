import type { JDSummary } from "@/lib/mock-data/case"
import {
  isInputWithButtonFilled,
  type InputWithButtonValue,
} from "@/components/blind-call/InputWithButton"

export type RoleArchetype =
  | "specialist_depth"
  | "scale_operator"
  | "modernization_refactor"
  | "growth_hire"
  | "greenfield_builder"
  | "founding_engineer"

export type JDStageState = {
  // Ticket 2 — read-only, fixed at hardcode time, never changes
  summary: JDSummary
  // Ticket 4 — user-editable
  archetype: {
    selected: RoleArchetype[]
    customNote?: string
  }
  // Ticket 3 — user-editable, single value, edited and overwrites (not a list)
  realAsk: InputWithButtonValue
}

export type BlindCallStageId = "jd" | "resume" | "fit" | "reveal" | "revise" | "done"

export type BlindCallState = {
  currentStageId: BlindCallStageId
  jd: JDStageState
  // resume / fit / reveal / revise / done — no fields yet, no ticket builds
  // these; render as placeholder stage content until they have real tickets
}

// Field-level rule, colocated here only until Ticket 4 builds the real
// MultiSelectWithNote component — move this function to live next to it
// then, keeping this file as the composer only.
export function isArchetypeFilled(archetype: JDStageState["archetype"]): boolean {
  return archetype.selected.length > 0 || Boolean(archetype.customNote?.trim())
}

// The single isComplete() CarouselShell calls for the "jd" stage — composes
// the field-level rules above. This is the only place that knows both are
// required (AND, not either/or); no individual field predicate should.
export function isJDStageComplete(jd: JDStageState): boolean {
  return isArchetypeFilled(jd.archetype) && isInputWithButtonFilled(jd.realAsk)
}

// The stage-level "can advance" signal CarouselShell's forward-nav gate
// actually reads (via Stage.isComplete) — distinct from isJDStageComplete
// itself: a stage can be complete AND have an unsaved InputWithButton draft
// sitting in the field, which should still block forward navigation until
// the user taps Add or clears it. Backward navigation is unconditional and
// never consults this.
export function canAdvanceJDStage(jd: JDStageState, hasDirtyRealAskDraft: boolean): boolean {
  return isJDStageComplete(jd) && !hasDirtyRealAskDraft
}

// Stage.blockedMessage for "jd" — returns undefined (CarouselShell's
// existing generic default applies) unless the block is specifically caused
// by an unsaved draft, which gets its own copy.
export function jdStageBlockedMessage(hasDirtyRealAskDraft: boolean): string | undefined {
  return hasDirtyRealAskDraft
    ? "You have an unsaved draft — tap Add or clear it before continuing"
    : undefined
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
