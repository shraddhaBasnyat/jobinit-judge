import { StatusPill } from "@/components/blind-call/Pill"

export type HeaderNodeInfoProps = {
  badgeLabel: string
  label: string
}

export function HeaderNodeInfo({ badgeLabel, label }: HeaderNodeInfoProps) {
  return (
    <div className="flex flex-row items-center gap-2 py-1" data-testid="header-node-info">
      <StatusPill tone="default" label={badgeLabel} />
      <span className="text-sm leading-5 font-semibold text-foreground">{label}</span>
    </div>
  )
}
