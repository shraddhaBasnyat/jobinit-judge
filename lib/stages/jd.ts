import type { JDSummary } from "@/lib/mock-data/case"
import {
  isInputWithButtonFilled,
  type InputWithButtonValue,
} from "@/components/blind-call/InputWithButton"
import { isMultiSelectWithNoteComplete } from "@/components/blind-call/MultiSelectWithNote"
import type { RoleArchetype } from "@/lib/stages/blind-call"

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

