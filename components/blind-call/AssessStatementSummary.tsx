import type { StatementAssessDescription } from "@/components/blind-call/MultiStatementAssess"

export type AssessStatementSummaryProps = {
  label: string
  entries: StatementAssessDescription[]
}

// Not a CardContentRow variant (Ticket 22, confirmed during grilling) — this
// needs a list of icon-trailing rows CardContentRow's {label, content} shape
// can't express, and that capability would exist for exactly one caller.
// Copies CardContentRow's shell tokens directly instead of importing it.
export function AssessStatementSummary({ label, entries }: AssessStatementSummaryProps) {
  return (
    <div
      data-testid="assess-statement-summary"
      className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/30 px-2 py-3"
    >
      <p className="font-mono text-[11px] leading-5 font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => {
          const Icon = entry.icon
          return (
            <div
              key={entry.id}
              data-testid={`assess-statement-summary-row-${entry.id}`}
              className="flex items-center justify-between gap-2"
            >
              <p className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground">
                {entry.statement}
              </p>
              <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
