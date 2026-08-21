import type { ReactNode } from "react"

export type ReviseField = {
  label: string
  ReadRows: () => ReactNode
  EditField: () => ReactNode
}

// Data-completeness predicate — always true, since nothing on Revise is
// required (a reviewer may keep every locked answer as-is). Kept distinct
// from canAdvanceReviseStage for the same reason isJDStageComplete is kept
// distinct from canAdvanceJDStage: different callers want "is the data done"
// vs. "can we actually leave right now."
export function isReviseStageComplete(): boolean {
  return true
}

// The actual Stage.isComplete CarouselShell calls for "revise" — forward nav
// is blocked exactly while an editing session is open, regardless of
// whether any field was touched. Backward nav is never gated here, matching
// the app-wide unconditional-backward convention (see jd.ts's
// canAdvanceJDStage comment).
export function canAdvanceReviseStage(isEditing: boolean): boolean {
  return isReviseStageComplete() && !isEditing
}

export function reviseStageBlockedMessage(isEditing: boolean): string | undefined {
  if (isEditing) {
    return "Save or cancel your changes before continuing"
  }
  return undefined
}
