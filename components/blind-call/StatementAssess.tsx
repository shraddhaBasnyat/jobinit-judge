import { BadgeCheck, MessageSquareQuote, ThumbsDown, type LucideIcon } from "lucide-react"
import { RadioGroup } from "@base-ui/react/radio-group"

import { CardContentRow } from "@/components/blind-call/CardContentRow"
import { AssessOptionRadio } from "@/components/blind-call/AssessOption"

export type AssessOption = {
  value: "backedUp" | "allTalk" | "soWhat"
  icon: LucideIcon
  label: string
}

// Domain-agnostic scale data, not case-specific content (unlike the
// statements themselves, which live in lib/mock-data/case.ts) — colocated
// with its own type here, same reasoning as ARCHETYPE_LABELS sitting next to
// RoleArchetype in lib/stages/jd.ts.
export const ASSESS_OPTIONS: AssessOption[] = [
  { value: "backedUp", icon: BadgeCheck, label: "Backed Up" },
  { value: "allTalk", icon: MessageSquareQuote, label: "All Talk" },
  { value: "soWhat", icon: ThumbsDown, label: "So What" },
]

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
          <AssessOptionRadio key={option.value} option={option} selected={value === option.value} />
        ))}
      </RadioGroup>
    </div>
  )
}
