export type RoleArchetype =
  | "specialist_depth"
  | "scale_operator"
  | "modernization_refactor"
  | "growth_hire"
  | "greenfield_builder"
  | "founding_engineer"

export type JDStageState = {
  // Ticket 2 — read-only, fixed at hardcode time, never changes
  summary: {
    badgeLabel: string
    roleTitle: string
    team: string
    whatYoullDo: string
    whatWereLookingFor: string
  }
  // Ticket 4 — user-editable
  archetype: {
    selected: RoleArchetype[]
    customNote?: string
  }
  // Ticket 3 — user-editable, single value, edited and overwrites (not a list)
  realAsk: {
    value: string
  }
}

export type BlindCallStageId = "jd" | "resume" | "fit" | "reveal" | "revise" | "done"

export type BlindCallState = {
  currentStageId: BlindCallStageId
  jd: JDStageState
  // resume / fit / reveal / revise / done — no fields yet, no ticket builds
  // these; render as placeholder stage content until they have real tickets
}

// Field-level rules, colocated here only until Tickets 3-4 build the real
// MultiSelectWithNote / real-ask input components — move each function to
// live next to its component then, keeping this file as the composer only.
export function isArchetypeFilled(archetype: JDStageState["archetype"]): boolean {
  return archetype.selected.length > 0 || Boolean(archetype.customNote?.trim())
}

export function isRealAskFilled(realAsk: JDStageState["realAsk"]): boolean {
  return realAsk.value.trim().length > 0
}

// The single isComplete() CarouselShell calls for the "jd" stage — composes
// the field-level rules above. This is the only place that knows both are
// required (AND, not either/or); no individual field predicate should.
export function isJDStageComplete(jd: JDStageState): boolean {
  return isArchetypeFilled(jd.archetype) && isRealAskFilled(jd.realAsk)
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
