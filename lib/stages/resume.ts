import type { ResumeSummary } from "@/lib/mock-data/case"
import type { Statement } from "@/components/blind-call/StatementAssess"
import { isStatementAssessComplete } from "@/components/blind-call/StatementAssess"
import { isMultiSelectWithNoteComplete } from "@/components/blind-call/MultiSelectWithNote"
import type { RoleArchetype } from "@/lib/stages/blind-call"

export type ResumeStageState = {
  // Read-only, fixed at hardcode time — feeds HeaderNodeInfo, mirrors how
  // JDStageState.summary carries JDSummary alongside its editable fields.
  summary: ResumeSummary
  statements: Statement[]
  values: Record<string, string>
  // Independent instance from JD's archetype field — same shape, same
  // taxonomy, but a distinct candidate-archetype vs. jdArchetype judgment.
  archetype: {
    selected: RoleArchetype[]
    customNote?: string
  }
}

// The single isComplete() CarouselShell calls for the "resume" stage —
// composes the field-level rules above. Same shape as isJDStageComplete.
export function isResumeStageComplete(resume: ResumeStageState): boolean {
  return (
    resume.statements.every((s) => isStatementAssessComplete(resume.values[s.id])) &&
    isMultiSelectWithNoteComplete({
      selected: resume.archetype.selected,
      note: resume.archetype.customNote,
    })
  )
}

// Mirrors canAdvanceJDStage's shape, reduced to Resume's one draft-capable
// field — StatementAssess commits immediately via radio selection, so the
// archetype note is the only field here that can sit dirty/unsaved.
export function canAdvanceResumeStage(
  resume: ResumeStageState,
  hasDirtyNoteDraft: boolean
): boolean {
  return isResumeStageComplete(resume) && !hasDirtyNoteDraft
}

// Mirrors jdStageBlockedMessage's note branch verbatim.
export function resumeStageBlockedMessage(hasDirtyNoteDraft: boolean): string | undefined {
  if (hasDirtyNoteDraft) {
    return "You have an unsaved note — tap elsewhere to save it, or clear it before continuing"
  }
  return undefined
}
