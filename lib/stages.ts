import type { JDSummary } from "@/lib/mock-data/case"
import {
  isInputWithButtonFilled,
  type InputWithButtonValue,
} from "@/components/blind-call/InputWithButton"
import { isMultiSelectWithNoteComplete } from "@/components/blind-call/MultiSelectWithNote"

export type RoleArchetype =
  | "specialist_depth"
  | "scale_operator"
  | "modernization_refactor"
  | "growth_hire"
  | "greenfield_builder"
  | "founding_engineer"

// Display copy for MultiSelectWithNote's domain-agnostic string[] options —
// label text is cosmetic and intentionally decoupled from the backing enum
// key (e.g. "Modernization" vs. modernization_refactor is not a mismatch to
// fix, just a label/value split). Keys listed in the ticket's display order
// so Object.values(ARCHETYPE_LABELS) below yields the correct option order.
export const ARCHETYPE_LABELS: Record<RoleArchetype, string> = {
  specialist_depth: "Specialist Depth",
  scale_operator: "Scale Operator",
  modernization_refactor: "Modernization",
  growth_hire: "Growth Hire",
  greenfield_builder: "Greenfield Builder",
  founding_engineer: "Founding Engineer",
}

const ARCHETYPE_KEYS_BY_LABEL: Record<string, RoleArchetype> = Object.fromEntries(
  (Object.entries(ARCHETYPE_LABELS) as [RoleArchetype, string][]).map(([key, label]) => [
    label,
    key,
  ])
)

export function archetypeKeyForLabel(label: string): RoleArchetype | undefined {
  return ARCHETYPE_KEYS_BY_LABEL[label]
}

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

// The single isComplete() CarouselShell calls for the "jd" stage — composes
// the field-level rules above. This is the only place that knows both are
// required (AND, not either/or); no individual field predicate should.
export function isJDStageComplete(jd: JDStageState): boolean {
  return (
    isMultiSelectWithNoteComplete({
      selected: jd.archetype.selected,
      note: jd.archetype.customNote,
    }) && isInputWithButtonFilled(jd.realAsk)
  )
}

// The stage-level "can advance" signal CarouselShell's forward-nav gate
// actually reads (via Stage.isComplete) — distinct from isJDStageComplete
// itself: a stage can be complete AND still have an unsaved draft sitting in
// realAsk (blocked until Add or clear) or in the archetype note field
// (blocked until blur commits or clears it) — either should still block
// forward navigation. Backward navigation is unconditional and never
// consults this.
export function canAdvanceJDStage(
  jd: JDStageState,
  hasDirtyRealAskDraft: boolean,
  hasDirtyNoteDraft: boolean
): boolean {
  return isJDStageComplete(jd) && !hasDirtyRealAskDraft && !hasDirtyNoteDraft
}

// Stage.blockedMessage for "jd" — returns undefined (CarouselShell's
// existing generic default applies) unless the block is specifically caused
// by an unsaved draft, which gets its own copy. realAsk is checked first
// when both happen to be dirty simultaneously (e.g. user left realAsk
// mid-edit without tapping Add, then also started typing a note).
export function jdStageBlockedMessage(
  hasDirtyRealAskDraft: boolean,
  hasDirtyNoteDraft: boolean
): string | undefined {
  if (hasDirtyRealAskDraft) {
    return "You have an unsaved draft — tap Add or clear it before continuing"
  }
  if (hasDirtyNoteDraft) {
    return "You have an unsaved note — tap elsewhere to save it, or clear it before continuing"
  }
  return undefined
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
