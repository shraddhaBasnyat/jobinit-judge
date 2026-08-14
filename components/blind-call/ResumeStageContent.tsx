"use client"

import { ARCHETYPE_LABELS, archetypeKeyForLabel, type ResumeStageState } from "@/lib/stages"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { MultiStatementAssess } from "@/components/blind-call/MultiStatementAssess"
import { ASSESS_OPTIONS } from "@/components/blind-call/StatementAssess"
import { MultiSelectWithNote } from "@/components/blind-call/MultiSelectWithNote"

export type ResumeStageContentProps = {
  resume: ResumeStageState
  onChange: (next: ResumeStageState) => void
  onNoteDraftDirtyChange?: (isDirty: boolean) => void
}

export function ResumeStageContent({
  resume,
  onChange,
  onNoteDraftDirtyChange,
}: ResumeStageContentProps) {
  const archetypeOptions = Object.values(ARCHETYPE_LABELS)
  const selectedLabels = resume.archetype.selected.map((key) => ARCHETYPE_LABELS[key])

  function handleChange(statementId: string, value: string) {
    onChange({ ...resume, values: { ...resume.values, [statementId]: value } })
  }

  function handleToggleArchetype(label: string) {
    const key = archetypeKeyForLabel(label)
    if (!key) return
    const isSelected = resume.archetype.selected.includes(key)
    onChange({
      ...resume,
      archetype: {
        ...resume.archetype,
        selected: isSelected
          ? resume.archetype.selected.filter((k) => k !== key)
          : [...resume.archetype.selected, key],
      },
    })
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel={resume.summary.badgeLabel} label={resume.summary.roleTitle} />
      <MultiStatementAssess
        question={"To match the role, here's what the resume claims.\nAssess each statement, pick one of:"}
        options={ASSESS_OPTIONS}
        statements={resume.statements}
        values={resume.values}
        onChange={handleChange}
      />
      <MultiSelectWithNote
        title="What's the career pattern?"
        instructionLabel="Select candidate archetype. Select all that apply."
        options={archetypeOptions}
        selected={selectedLabels}
        onToggle={handleToggleArchetype}
        notePlaceholder="None fit, describe it yourself"
        note={resume.archetype.customNote}
        onNoteChange={(customNote) =>
          onChange({ ...resume, archetype: { ...resume.archetype, customNote } })
        }
        onNoteDraftDirtyChange={onNoteDraftDirtyChange}
      />
    </div>
  )
}
