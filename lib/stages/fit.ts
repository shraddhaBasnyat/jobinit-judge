import {
  isBranchingSingleSelectComplete,
  type BranchingSingleSelectValue,
} from "@/components/blind-call/BranchingSingleSelect"
import { FIT_VERDICT_OPTIONS } from "@/lib/stages/blind-call"

export type FitStageState = {
  verdict: BranchingSingleSelectValue
}

// The single isComplete() CarouselShell calls for the "fit" stage — a thin
// composition, same shape as isJDStageComplete/isResumeStageComplete. No
// canAdvanceFitStage wrapper: unlike jd/resume, Fit has no free-text draft
// field, so there's no dirty-draft gating concern to AND in.
export function isFitStageComplete(fit: FitStageState): boolean {
  return isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, fit.verdict)
}
