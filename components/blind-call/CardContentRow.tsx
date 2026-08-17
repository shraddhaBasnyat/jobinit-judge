import { StatusPill } from "@/components/blind-call/Pill"

// "bucket" variant still deferred — see AGENTS.md convention log.
export type CardContentRowProps =
  | { variant: "text"; label: string; content: string }
  | { variant: "pill"; label: string; pillLabel: string; content: string }

export function CardContentRow(props: CardContentRowProps) {
  const { label, content } = props
  return (
    <div
      data-testid="card-content-row"
      className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/30 px-2 py-3"
    >
      <p className="font-mono text-[11px] leading-5 font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      {props.variant === "pill" && (
        // self-start on a wrapper, not the label/content <p>s: this row's
        // parent is flex-col with default align-items: stretch, which would
        // otherwise force the pill to the row's full width instead of
        // hugging its label text. StatusPill doesn't accept a className to
        // set this directly (its prop surface is deliberately {tone, label}
        // only), so it's applied on a plain wrapper instead of widening
        // Pill's shared API for one caller.
        <span className="self-start">
          <StatusPill tone="default" label={props.pillLabel} />
        </span>
      )}
      <p className="text-[13px] leading-5 text-foreground">{content}</p>
    </div>
  )
}
