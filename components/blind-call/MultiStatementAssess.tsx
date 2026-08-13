import { AssessOptionLegend } from "@/components/blind-call/AssessOption"
import {
  StatementAssess,
  type AssessOption,
  type Statement,
} from "@/components/blind-call/StatementAssess"

export type MultiStatementAssessProps = {
  question: string
  options: AssessOption[]
  statements: Statement[]
  values: Record<string, string>
  onChange: (statementId: string, value: string) => void
}

export function MultiStatementAssess({
  question,
  options,
  statements,
  values,
  onChange,
}: MultiStatementAssessProps) {
  return (
    <div className="flex w-full flex-col gap-3" data-testid="multi-statement-assess">
      <div className="flex flex-col gap-1">
        <p className="text-prompt-question whitespace-pre-line">{question}</p>
        <div className="flex gap-3" data-testid="multi-statement-assess-legend">
          {options.map((option) => (
            <AssessOptionLegend key={option.value} option={option} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4" data-testid="multi-statement-assess-statements">
        {statements.map((statement) => (
          <StatementAssess
            key={statement.id}
            statement={statement}
            options={options}
            value={values[statement.id]}
            onChange={(value) => onChange(statement.id, value)}
          />
        ))}
      </div>
    </div>
  )
}
