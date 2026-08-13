import type { ResumeSummary } from "@/lib/mock-data/case"
import type { Statement } from "@/components/blind-call/StatementAssess"
import { isStatementAssessComplete } from "@/components/blind-call/StatementAssess"

export type ResumeStageState = {
  // Read-only, fixed at hardcode time — feeds HeaderNodeInfo, mirrors how
  // JDStageState.summary carries JDSummary alongside its editable fields.
  summary: ResumeSummary
  statements: Statement[]
  values: Record<string, string>
}

// The single isComplete() CarouselShell calls for the "resume" stage —
// composes the field-level rule above. Same shape as isJDStageComplete.
export function isResumeStageComplete(resume: ResumeStageState): boolean {
  return resume.statements.every((s) => isStatementAssessComplete(resume.values[s.id]))
}
