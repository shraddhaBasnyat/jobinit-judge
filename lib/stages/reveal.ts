import type { RevealCaseData } from "@/lib/mock-data/case"
import { ARCHETYPE_LABELS, type RoleArchetype } from "@/lib/stages/blind-call"

// No fields to compose — Reveal is pure read-only display of AI ground
// truth, unlike jd/resume/fit which each hold reviewer-editable state. Takes
// no arguments, matching CarouselShell's Stage.isComplete() signature.
export function isRevealStageComplete(): boolean {
  return true
}

export function describeJdArchetype(jdArchetype: RevealCaseData["jdArchetype"]): string {
  const ideal = ARCHETYPE_LABELS[jdArchetype.ideal]
  const couldWork = jdArchetype.couldWork.map((key) => ARCHETYPE_LABELS[key])
  if (couldWork.length === 0) return `Ideal fit: ${ideal}.`
  return `Ideal fit: ${ideal}. Could also work: ${couldWork.join(", ")}.`
}

// transitions is append-ordered chronologically (oldest → newest) — the
// latest transition is the last element. Only single-hop transitions exist
// today, so this is a no-op in practice, but encodes the intended ordering
// for whenever multi-hop data shows up.
function latestTransition(careerArcNote: RevealCaseData["careerArcNote"]) {
  return careerArcNote.transitions.at(-1)
}

export function candidateArchetypePillLabel(
  candidateArchetype: RoleArchetype,
  careerArcNote: RevealCaseData["careerArcNote"]
): string {
  const transition = latestTransition(careerArcNote)
  if (!transition) return ARCHETYPE_LABELS[candidateArchetype]
  return `${ARCHETYPE_LABELS[transition.from]} → ${ARCHETYPE_LABELS[transition.to]}`
}

export function describeCandidateArchetype(
  candidateArchetype: RoleArchetype,
  careerArcNote: RevealCaseData["careerArcNote"]
): string {
  const transition = latestTransition(careerArcNote)
  if (!transition) {
    return `Reads as a ${ARCHETYPE_LABELS[candidateArchetype]} candidate.`
  }
  return `Transitioning from ${ARCHETYPE_LABELS[transition.from]} to ${ARCHETYPE_LABELS[transition.to]}.`
}
