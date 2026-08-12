export type CardContentRowProps = {
  variant: "text" // "pill"/"bucket" variants deferred — see AGENTS.md convention log
  label: string
  content: string
}

export function CardContentRow({ label, content }: CardContentRowProps) {
  return (
    <div
      data-testid="card-content-row"
      className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/30 px-2 py-3"
    >
      <p className="font-mono text-[11px] leading-5 font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-[13px] leading-5 text-foreground">{content}</p>
    </div>
  )
}
