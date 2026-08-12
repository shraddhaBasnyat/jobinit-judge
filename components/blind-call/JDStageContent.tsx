"use client"

import { ARCHETYPE_LABELS, archetypeKeyForLabel, type JDStageState } from "@/lib/stages"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { CardContentRow } from "@/components/blind-call/CardContentRow"
import { InputWithButton } from "@/components/blind-call/InputWithButton"
import { MultiSelectWithNote } from "@/components/blind-call/MultiSelectWithNote"

export type JDStageContentProps = {
  jd: JDStageState
  onChange: (next: JDStageState) => void
  onRealAskDraftDirtyChange?: (isDirty: boolean) => void
  onNoteDraftDirtyChange?: (isDirty: boolean) => void
}

// Ticket 2 built the real badge/team content below; Ticket 3 built the real
// InputWithButton below; Ticket 4 built the real MultiSelectWithNote below.
export function JDStageContent({
  jd,
  onChange,
  onRealAskDraftDirtyChange,
  onNoteDraftDirtyChange,
}: JDStageContentProps) {
  const archetypeOptions = Object.values(ARCHETYPE_LABELS)
  const selectedLabels = jd.archetype.selected.map((key) => ARCHETYPE_LABELS[key])

  function handleToggleArchetype(label: string) {
    const key = archetypeKeyForLabel(label)
    if (!key) return
    const isSelected = jd.archetype.selected.includes(key)
    onChange({
      ...jd,
      archetype: {
        ...jd.archetype,
        selected: isSelected
          ? jd.archetype.selected.filter((k) => k !== key)
          : [...jd.archetype.selected, key],
      },
    })
  }

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
      <MultiSelectWithNote
        title="Forget the job title, what career pattern is this role actually built around?"
        instructionLabel="Select candidate archetype. Select all that apply."
        options={archetypeOptions}
        selected={selectedLabels}
        onToggle={handleToggleArchetype}
        notePlaceholder="None fit, describe it yourself"
        note={jd.archetype.customNote}
        onNoteChange={(customNote) =>
          onChange({ ...jd, archetype: { ...jd.archetype, customNote } })
        }
        onNoteDraftDirtyChange={onNoteDraftDirtyChange}
      />
      <InputWithButton
        title="Underneath the requirements list, what's the real problem this role exists to solve?"
        value={jd.realAsk.value}
        onAdd={(value) => onChange({ ...jd, realAsk: { value } })}
        onDraftDirtyChange={onRealAskDraftDirtyChange}
        placeholder="Add the job description's real ask"
      />
    </div>
  )
}
