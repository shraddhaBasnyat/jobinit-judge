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
  type BlindCallStageId,
  type BlindCallState,
  type RoleArchetype,
} from "@/lib/stages/blind-call"

export {
  isResumeStageComplete,
  canAdvanceResumeStage,
  resumeStageBlockedMessage,
  type ResumeStageState,
} from "@/lib/stages/resume"

export {
  isFitStageComplete,
  FIT_VERDICT_OPTIONS,
  type FitStageState,
  type FitVerdict,
} from "@/lib/stages/fit"
