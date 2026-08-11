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

// The single isComplete() CarouselShell calls for the "jd" stage —
// user must satisfy BOTH archetype AND real-ask, not either/or.
export function isJDStageComplete(jd: JDStageState): boolean {
  const archetypeDone =
    jd.archetype.selected.length > 0 || Boolean(jd.archetype.customNote?.trim())
  const realAskDone = jd.realAsk.value.trim().length > 0
  return archetypeDone && realAskDone
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
