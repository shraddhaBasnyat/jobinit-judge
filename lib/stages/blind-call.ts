import type { JDStageState } from "@/lib/stages/jd"
import type { ResumeStageState } from "@/lib/stages/resume"

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

export type BlindCallStageId = "jd" | "resume" | "fit" | "reveal" | "revise" | "done"

export type BlindCallState = {
  currentStageId: BlindCallStageId
  jd: JDStageState
  resume: ResumeStageState
  // fit / reveal / revise / done — no fields yet, no ticket builds these;
  // render as placeholder stage content until they have real tickets
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
