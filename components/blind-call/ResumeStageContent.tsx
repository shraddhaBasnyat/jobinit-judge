"use client"

import type { ResumeStageState } from "@/lib/stages"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { MultiStatementAssess } from "@/components/blind-call/MultiStatementAssess"
import { ASSESS_OPTIONS } from "@/components/blind-call/StatementAssess"

export type ResumeStageContentProps = {
  resume: ResumeStageState
  onChange: (next: ResumeStageState) => void
}

export function ResumeStageContent({ resume, onChange }: ResumeStageContentProps) {
  function handleChange(statementId: string, value: string) {
    onChange({ ...resume, values: { ...resume.values, [statementId]: value } })
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel={resume.summary.badgeLabel} label={resume.summary.roleTitle} />
      <MultiStatementAssess
        question={"To match the role, here's what the resume claims.\nAssess each statement, pick one of:"}
        options={ASSESS_OPTIONS}
        statements={resume.statements}
        values={resume.values}
        onChange={handleChange}
      />
    </div>
  )
}
