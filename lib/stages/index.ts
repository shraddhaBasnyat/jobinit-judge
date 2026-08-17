export {
  isJDStageComplete,
  canAdvanceJDStage,
  jdStageBlockedMessage,
  type JDStageState,
} from "@/lib/stages/jd"

export {
  STAGE_META,
  ARCHETYPE_LABELS,
  archetypeKeyForLabel,
  FIT_VERDICT_OPTIONS,
  SCENARIO_LABELS,
  type BlindCallStageId,
  type BlindCallState,
  type RoleArchetype,
  type FitVerdict,
} from "@/lib/stages/blind-call"

export {
  isResumeStageComplete,
  canAdvanceResumeStage,
  resumeStageBlockedMessage,
  type ResumeStageState,
} from "@/lib/stages/resume"

export { isFitStageComplete, type FitStageState } from "@/lib/stages/fit"

export {
  isRevealStageComplete,
  describeJdArchetype,
  describeCandidateArchetype,
  candidateArchetypePillLabel,
} from "@/lib/stages/reveal"
