export {
  ARCHETYPE_LABELS,
  archetypeKeyForLabel,
  isJDStageComplete,
  canAdvanceJDStage,
  jdStageBlockedMessage,
  type RoleArchetype,
  type JDStageState,
} from "@/lib/stages/jd"

export {
  STAGE_META,
  type BlindCallStageId,
  type BlindCallState,
} from "@/lib/stages/blind-call"

export { isResumeStageComplete, type ResumeStageState } from "@/lib/stages/resume"
