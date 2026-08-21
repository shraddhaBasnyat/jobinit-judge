"use client"

import { Fragment, useState } from "react"

import {
  ARCHETYPE_LABELS,
  archetypeKeyForLabel,
  FIT_VERDICT_OPTIONS,
  type RevisedState,
} from "@/lib/stages/blind-call"
import type { ReviseField } from "@/lib/stages/revise"
import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { CardContentRow } from "@/components/blind-call/CardContentRow"
import { AssessStatementSummary } from "@/components/blind-call/AssessStatementSummary"
import { InputWithButton } from "@/components/blind-call/InputWithButton"
import { MultiSelectWithNote, describeSelection } from "@/components/blind-call/MultiSelectWithNote"
import {
  MultiStatementAssess,
  describeStatementAssess,
} from "@/components/blind-call/MultiStatementAssess"
import { ASSESS_OPTIONS } from "@/components/blind-call/StatementAssess"
import {
  BranchingSingleSelect,
  describeBranchingSelection,
} from "@/components/blind-call/BranchingSingleSelect"
import { Button } from "@/components/ui/button"

export type ReviseStageContentProps = {
  revised: RevisedState
  onRevisedChange: (next: RevisedState) => void
  onEditModeChange: (isEditing: boolean) => void
}

function buildReviseFields(
  revised: RevisedState,
  onRevisedChange: (next: RevisedState) => void,
  onRealAskDraftDirtyChange: (isDirty: boolean) => void,
  onJdNoteDraftDirtyChange: (isDirty: boolean) => void,
  onResumeNoteDraftDirtyChange: (isDirty: boolean) => void
): ReviseField[] {
  const archetypeOptions = Object.values(ARCHETYPE_LABELS)
  const jdSelectedLabels = revised.jd.archetype.selected.map((k) => ARCHETYPE_LABELS[k])
  const resumeSelectedLabels = revised.resume.archetype.selected.map((k) => ARCHETYPE_LABELS[k])
  const fitDescribed = describeBranchingSelection(FIT_VERDICT_OPTIONS, revised.fit.verdict)
  const statementEntries = describeStatementAssess(revised.resume.values, revised.resume.statements)

  function toggleJdArchetype(label: string) {
    const key = archetypeKeyForLabel(label)
    if (!key) return
    const isSelected = revised.jd.archetype.selected.includes(key)
    onRevisedChange({
      ...revised,
      jd: {
        ...revised.jd,
        archetype: {
          ...revised.jd.archetype,
          selected: isSelected
            ? revised.jd.archetype.selected.filter((k) => k !== key)
            : [...revised.jd.archetype.selected, key],
        },
      },
    })
  }

  function toggleResumeArchetype(label: string) {
    const key = archetypeKeyForLabel(label)
    if (!key) return
    const isSelected = revised.resume.archetype.selected.includes(key)
    onRevisedChange({
      ...revised,
      resume: {
        ...revised.resume,
        archetype: {
          ...revised.resume.archetype,
          selected: isSelected
            ? revised.resume.archetype.selected.filter((k) => k !== key)
            : [...revised.resume.archetype.selected, key],
        },
      },
    })
  }

  return [
    {
      label: "JD Archetype",
      ReadRows: () => (
        <CardContentRow
          variant="pill"
          label="JD Archetype"
          pillLabel={describeSelection(jdSelectedLabels).join(", ")}
          content={revised.jd.archetype.customNote || "No note added"}
        />
      ),
      EditField: () => (
        <MultiSelectWithNote
          title="Forget the job title, what career pattern is this role actually built around?"
          instructionLabel="Select candidate archetype. Select all that apply."
          options={archetypeOptions}
          selected={jdSelectedLabels}
          onToggle={toggleJdArchetype}
          notePlaceholder="None fit, describe it yourself"
          note={revised.jd.archetype.customNote}
          onNoteChange={(customNote) =>
            onRevisedChange({
              ...revised,
              jd: { ...revised.jd, archetype: { ...revised.jd.archetype, customNote } },
            })
          }
          onNoteDraftDirtyChange={onJdNoteDraftDirtyChange}
        />
      ),
    },
    {
      label: "JD Real Ask",
      ReadRows: () => (
        <CardContentRow variant="text" label="JD Real Ask" content={revised.jd.realAsk.value} />
      ),
      EditField: () => (
        <InputWithButton
          title="Underneath the requirements list, what's the real problem this role exists to solve?"
          value={revised.jd.realAsk.value}
          onAdd={(value) => onRevisedChange({ ...revised, jd: { ...revised.jd, realAsk: { value } } })}
          onDraftDirtyChange={onRealAskDraftDirtyChange}
          placeholder="Add the job description's real ask"
        />
      ),
    },
    {
      label: "Resume Statements",
      ReadRows: () => <AssessStatementSummary label="Resume Statements" entries={statementEntries} />,
      EditField: () => (
        <MultiStatementAssess
          question={"To match the role, here's what the resume claims.\nAssess each statement, pick one of:"}
          options={ASSESS_OPTIONS}
          statements={revised.resume.statements}
          values={revised.resume.values}
          onChange={(statementId, value) =>
            onRevisedChange({
              ...revised,
              resume: { ...revised.resume, values: { ...revised.resume.values, [statementId]: value } },
            })
          }
        />
      ),
    },
    {
      label: "Resume Archetype",
      ReadRows: () => (
        <CardContentRow
          variant="pill"
          label="Resume Archetype"
          pillLabel={describeSelection(resumeSelectedLabels).join(", ")}
          content={revised.resume.archetype.customNote || "No note added"}
        />
      ),
      EditField: () => (
        <MultiSelectWithNote
          title="What's the career pattern?"
          instructionLabel="Select candidate archetype. Select all that apply."
          options={archetypeOptions}
          selected={resumeSelectedLabels}
          onToggle={toggleResumeArchetype}
          notePlaceholder="None fit, describe it yourself"
          note={revised.resume.archetype.customNote}
          onNoteChange={(customNote) =>
            onRevisedChange({
              ...revised,
              resume: { ...revised.resume, archetype: { ...revised.resume.archetype, customNote } },
            })
          }
          onNoteDraftDirtyChange={onResumeNoteDraftDirtyChange}
        />
      ),
    },
    {
      label: "Fit",
      ReadRows: () => (
        <>
          <CardContentRow
            variant="pill"
            label="Fit"
            pillLabel={fitDescribed?.label ?? ""}
            content={fitDescribed?.hook ?? ""}
          />
          {fitDescribed?.subLabel && (
            <CardContentRow
              variant="pill"
              label="Fit Sub-option"
              pillLabel={fitDescribed.subLabel}
              content={fitDescribed.subHook ?? ""}
            />
          )}
        </>
      ),
      EditField: () => (
        <BranchingSingleSelect
          title="Based on everything you've seen, what's the read here?"
          options={FIT_VERDICT_OPTIONS}
          value={revised.fit.verdict}
          onChange={(verdict) => onRevisedChange({ ...revised, fit: { ...revised.fit, verdict } })}
        />
      ),
    },
  ]
}

// Distinct from reviseStageBlockedMessage in lib/stages/revise.ts, which
// gates leaving the stage entirely (CarouselShell's forward-nav, via
// canAdvanceReviseStage/isEditing). This gates the in-screen Save action
// specifically: Save must not silently discard an uncommitted draft the
// reviewer typed but never explicitly committed (Add, or blur for the note
// fields) — the same "has content" vs. "differs from committed" distinction
// InputWithButton/InputWithInlineSave's onDraftDirtyChange callbacks already
// exist to police elsewhere (JD/Resume's own canAdvanceJDStage/
// canAdvanceResumeStage), reused here rather than reinvented. Cancel is
// deliberately NOT gated by this — discarding everything, including
// uncommitted drafts, is Cancel's whole point; only Save (which reads as
// "keep my changes" to the reviewer) needs the guard.
function reviseSaveBlockedMessage(
  hasDirtyRealAskDraft: boolean,
  hasDirtyJdNoteDraft: boolean,
  hasDirtyResumeNoteDraft: boolean
): string | undefined {
  // Checked in this fixed order — Real Ask, then JD note, then Resume note —
  // so if a reviewer somehow leaves two drafts dirty at once, only the
  // first-checked one's message shows. Matches jdStageBlockedMessage's own
  // "realAsk checked first when both happen to be dirty simultaneously"
  // precedent. Worth knowing if this is ever debugged later: a dirty draft
  // that isn't reflected in the shown message may still be blocking Save,
  // just silently, behind whichever one is checked first here.
  if (hasDirtyRealAskDraft) {
    return "You have an unsaved draft in JD Real Ask — tap Add or clear it before saving"
  }
  if (hasDirtyJdNoteDraft) {
    return "You have an unsaved note in JD Archetype — tap elsewhere to save it, or clear it before saving"
  }
  if (hasDirtyResumeNoteDraft) {
    return "You have an unsaved note in Resume Archetype — tap elsewhere to save it, or clear it before saving"
  }
  return undefined
}

// "Entering Revise always shows recap" (regardless of exit path — Cancel,
// Save, or an unconditional back-out mid-edit, since backward nav is never
// gated, same as every other stage) is guaranteed by page.tsx keying this
// component on whether "revise" is the active stage: React fully remounts
// it — resetting every piece of local state below to its initial value in
// one shot — at the exact moment the reviewer leaves, rather than this
// component manually calling multiple setState functions inside a
// useEffect watching an `isActive` prop (the React-recommended fix for
// "reset all state when some condition changes" is a key-based remount, not
// an effect — the effect version trips eslint's react-hooks/set-state-in-effect
// rule for good reason: it's the "adjusting state based on a prop change"
// anti-pattern the rule exists to catch). page.tsx separately resets its own
// isRevising state in the same nav-change handler that moves the reviewer
// off "revise", so this component doesn't need to report an exit itself.
export function ReviseStageContent({
  revised,
  onRevisedChange,
  onEditModeChange,
}: ReviseStageContentProps) {
  const [view, setView] = useState<"recap" | "editing">("recap")
  const [sessionSnapshot, setSessionSnapshot] = useState<RevisedState | null>(null)
  const [hasDirtyRealAskDraft, setHasDirtyRealAskDraft] = useState(false)
  const [hasDirtyJdNoteDraft, setHasDirtyJdNoteDraft] = useState(false)
  const [hasDirtyResumeNoteDraft, setHasDirtyResumeNoteDraft] = useState(false)

  const fields = buildReviseFields(
    revised,
    onRevisedChange,
    setHasDirtyRealAskDraft,
    setHasDirtyJdNoteDraft,
    setHasDirtyResumeNoteDraft
  )

  const saveBlockedMessage = reviseSaveBlockedMessage(
    hasDirtyRealAskDraft,
    hasDirtyJdNoteDraft,
    hasDirtyResumeNoteDraft
  )
  const saveBlocked = saveBlockedMessage !== undefined

  function handleStartEditing() {
    setSessionSnapshot(structuredClone(revised))
    setView("editing")
    onEditModeChange(true)
  }

  function handleSave() {
    if (saveBlocked) return // defensive — the Save button is already disabled in this state
    setSessionSnapshot(null)
    setView("recap")
    onEditModeChange(false)
  }

  function handleCancel() {
    if (sessionSnapshot) onRevisedChange(sessionSnapshot)
    setSessionSnapshot(null)
    setHasDirtyRealAskDraft(false)
    setHasDirtyJdNoteDraft(false)
    setHasDirtyResumeNoteDraft(false)
    setView("recap")
    onEditModeChange(false)
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4" data-testid="revise-stage-content">
      <HeaderNodeInfo badgeLabel="Revise" label="Review Your Answers" />
      {view === "recap" ? (
        <div className="flex flex-col gap-4" data-testid="revise-stage-content-recap">
          {fields.map((field) => (
            <Fragment key={field.label}>{field.ReadRows()}</Fragment>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleStartEditing}
            data-testid="revise-stage-content-start-editing"
          >
            Let me change something
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-testid="revise-stage-content-editing">
          {fields.map((field) => (
            <Fragment key={field.label}>{field.EditField()}</Fragment>
          ))}
          <div className="flex flex-row items-center justify-end gap-2">
            {saveBlockedMessage && (
              <span
                className="text-xs text-muted-foreground"
                data-testid="revise-stage-content-save-blocked-message"
              >
                {saveBlockedMessage}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              data-testid="revise-stage-content-cancel"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveBlocked}
              aria-disabled={saveBlocked}
              data-testid="revise-stage-content-save"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
