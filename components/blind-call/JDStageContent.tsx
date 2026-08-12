"use client"

import { isJDStageComplete, type JDStageState } from "@/lib/stages"
import { Button } from "@/components/ui/button"

export type JDStageContentProps = {
  jd: JDStageState
  onChange: (next: JDStageState) => void
}

// Ticket 1 only needs enough surface to exercise isJDStageComplete's real
// AND-logic for the CarouselShell gate. The real badge/team/archetype/
// real-ask UI is Tickets 2-4's job, not this ticket's.
export function JDStageContent({ jd, onChange }: JDStageContentProps) {
  const hasArchetype = jd.archetype.selected.length > 0
  const hasRealAsk = jd.realAsk.value.trim().length > 0

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <p className="text-sm text-muted-foreground">
        JD stage placeholder (Tickets 2–4 build the real content)
      </p>
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
      <Button
        type="button"
        variant="outline"
        data-testid="jd-toggle-real-ask"
        onClick={() =>
          onChange({
            ...jd,
            realAsk: { value: hasRealAsk ? "" : "placeholder answer" },
          })
        }
      >
        {hasRealAsk ? "Clear real ask" : "Set real ask"}
      </Button>
      <p data-testid="jd-stage-complete-status" className="text-sm font-medium text-foreground">
        {isJDStageComplete(jd) ? "Complete" : "Incomplete"}
      </p>
    </div>
  )
}
