import type { JDStageState } from "@/lib/stages/jd"
import type { ResumeStageState } from "@/lib/stages/resume"
import type { FitStageState } from "@/lib/stages/fit"
import type { SelectOption } from "@/components/blind-call/RadioCard"

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

// Real backend enum values (confirmed with the domain expert) — unlike the
// two Narrative Gap sub-option ids below, which are deliberately exploratory
// and must NOT collide with JobInit's production schema. Relocated here from
// fit.ts (Ticket 17): scenarioId (Reveal) is the same four-value vocabulary
// as Fit's verdict, meeting the shared-vocabulary bar established by the
// ARCHETYPE_LABELS relocation (Ticket 11/13).
export type FitVerdict = "confirmed_fit" | "invisible_expert" | "narrative_gap" | "honest_verdict"

export const FIT_VERDICT_OPTIONS: SelectOption[] = [
  {
    id: "confirmed_fit",
    label: "Confirmed fit",
    hook: "They're ready. The resume backs it up cleanly.",
  },
  {
    id: "invisible_expert",
    label: "Invisible fit",
    hook: "Qualified, but the vocabulary risks falling through application-tracking filters.",
  },
  {
    id: "narrative_gap",
    label: "Narrative gap",
    hook: "Skills transfer, wrong story. Needs reframing to connect them.",
    subOptionsPrompt: "What's missing?",
    subOptions: [
      { id: "needs_reframing", label: "Needs reframing", hook: "What's there is told wrong" },
      { id: "needs_depth", label: "Needs more", hook: "The experience isn't fully there" },
    ],
  },
  {
    id: "honest_verdict",
    label: "Honest verdict",
    hook: "Real gap, not a fit yet.",
  },
]

// scenarioId → human-readable display, same label/value-split pattern as
// ARCHETYPE_LABELS. Derived from FIT_VERDICT_OPTIONS rather than
// hand-authored, so the label text has one source of truth.
export const SCENARIO_LABELS: Record<string, string> = Object.fromEntries(
  FIT_VERDICT_OPTIONS.map((option) => [option.id, option.label])
)

export type BlindCallStageId = "jd" | "resume" | "fit" | "reveal" | "revise" | "done"

export type BlindCallState = {
  currentStageId: BlindCallStageId
  jd: JDStageState
  resume: ResumeStageState
  fit: FitStageState
  // reveal — deliberately no field: it's pure read-only display of AI
  // ground truth (MOCK_CASE.reveal), no reviewer-editable state to hold.
  // revise / done — no fields yet, no ticket builds these; render as
  // placeholder stage content until they have real tickets.
  locked: boolean
  revised?: { jd: JDStageState; resume: ResumeStageState; fit: FitStageState }
}

export const STAGE_META: { id: BlindCallStageId; label: string }[] = [
  { id: "jd", label: "JD" },
  { id: "resume", label: "Resume" },
  { id: "fit", label: "Fit" },
  { id: "reveal", label: "Reveal" },
  { id: "revise", label: "Revise" },
  { id: "done", label: "Done" },
]
