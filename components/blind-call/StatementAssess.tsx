import type { LucideIcon } from "lucide-react"
import { RadioGroup } from "@base-ui/react/radio-group"

import { CardContentRow } from "@/components/blind-call/CardContentRow"
import { AssessOptionRadio } from "@/components/blind-call/AssessOption"
import { ASSESS_VALUE_META, type AssessValue } from "@/lib/stages/blind-call"

export type AssessOption = {
  value: AssessValue
  icon: LucideIcon
  label: string
}

// Derived from ASSESS_VALUE_META (lib/stages/blind-call.ts) rather than
// hand-authored, so the value->icon/label mapping has one source of truth —
// relocated there in Ticket 22 so the recap's describeAssessValue selector
// can share it. Key order in that map is load-bearing for this array's
// order (see its own comment).
export const ASSESS_OPTIONS: AssessOption[] = (
  Object.entries(ASSESS_VALUE_META) as [AssessValue, { icon: LucideIcon; label: string }][]
).map(([value, meta]) => ({ value, ...meta }))

export type Statement = {
  id: string
  statement: string
}

export function isStatementAssessComplete(value: string | undefined): boolean {
  return value != null
}

export type StatementAssessProps = {
  statement: Statement
  options: AssessOption[]
  value: string | undefined
  onChange: (value: string) => void
}

export function StatementAssess({ statement, options, value, onChange }: StatementAssessProps) {
  return (
    <div
      data-testid={`statement-assess-${statement.id}`}
      className="flex w-full flex-col items-end justify-end gap-2"
    >
      <CardContentRow variant="text" label="" content={statement.statement} />
      <RadioGroup
        aria-label={statement.statement}
        value={value ?? ""}
        onValueChange={(next) => onChange(next as string)}
        className="flex gap-4"
      >
        {options.map((option) => (
          <AssessOptionRadio key={option.value} option={option} />
        ))}
      </RadioGroup>
    </div>
  )
}
