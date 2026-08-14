"use client"

import { FIT_VERDICT_OPTIONS, type FitStageState } from "@/lib/stages"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { BranchingSingleSelect } from "@/components/blind-call/BranchingSingleSelect"

export type FitStageContentProps = {
  fit: FitStageState
  onChange: (next: FitStageState) => void
}

export function FitStageContent({ fit, onChange }: FitStageContentProps) {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel="Fit" label="Match the Fit" />
      <BranchingSingleSelect
        title="Based on everything you've seen, what's the read here?"
        options={FIT_VERDICT_OPTIONS}
        value={fit.verdict}
        onChange={(verdict) => onChange({ ...fit, verdict })}
      />
    </div>
  )
}
