"use client"

import { isJDStageComplete, type JDStageState } from "@/lib/stages"
import { Button } from "@/components/ui/button"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { CardContentRow } from "@/components/blind-call/CardContentRow"
import { InputWithButton } from "@/components/blind-call/InputWithButton"

export type JDStageContentProps = {
  jd: JDStageState
  onChange: (next: JDStageState) => void
  onRealAskDraftDirtyChange?: (isDirty: boolean) => void
}

// Ticket 2 built the real badge/team content below; Ticket 3 built the real
// InputWithButton below. The archetype toggle button is still Ticket 4's
// placeholder surface.
export function JDStageContent({
  jd,
  onChange,
  onRealAskDraftDirtyChange,
}: JDStageContentProps) {
  const hasArchetype = jd.archetype.selected.length > 0

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel={jd.summary.badgeLabel} label={jd.summary.roleTitle} />
      <CardContentRow variant="text" label="THE TEAM" content={jd.summary.team} />
      <CardContentRow variant="text" label="WHAT YOU'LL DO" content={jd.summary.whatYoullDo} />
      <CardContentRow
        variant="text"
        label="WHAT WE'RE LOOKING FOR"
        content={jd.summary.whatWereLookingFor}
      />
      <Button
        type="button"
        variant="outline"
        data-testid="jd-toggle-archetype"
        onClick={() =>
          onChange({
            ...jd,
            archetype: {
              ...jd.archetype,
              selected: hasArchetype ? [] : ["specialist_depth"],
            },
          })
        }
      >
        {hasArchetype ? "Clear archetype" : "Set archetype"}
      </Button>
      <InputWithButton
        title="Underneath the requirements list, what's the real problem this role exists to solve?"
        value={jd.realAsk.value}
        onAdd={(value) => onChange({ ...jd, realAsk: { value } })}
        onDraftDirtyChange={onRealAskDraftDirtyChange}
        placeholder="Add the job description's real ask"
      />
      <p data-testid="jd-stage-complete-status" className="text-sm font-medium text-foreground">
        {isJDStageComplete(jd) ? "Complete" : "Incomplete"}
      </p>
    </div>
  )
}
