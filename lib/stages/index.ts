export { isJDStageComplete, type JDStageState } from "@/lib/stages/jd"

export {
  STAGE_META,
  ARCHETYPE_LABELS,
  archetypeKeyForLabel,
  FIT_VERDICT_OPTIONS,
  SCENARIO_LABELS,
  ASSESS_VALUE_META,
  describeAssessValue,
  type BlindCallStageId,
  type BlindCallState,
  type RoleArchetype,
  type FitVerdict,
  type AssessValue,
  type RevisedState,
} from "@/lib/stages/blind-call"

export { isResumeStageComplete, type ResumeStageState } from "@/lib/stages/resume"

export { isFitStageComplete, type FitStageState } from "@/lib/stages/fit"

export {
  isRevealStageComplete,
  describeJdArchetype,
  describeCandidateArchetype,
  candidateArchetypePillLabel,
} from "@/lib/stages/reveal"

export { type ReviseField } from "@/lib/stages/revise"
