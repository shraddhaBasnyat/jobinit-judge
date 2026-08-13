"use client"

import { useMemo, useState } from "react"

import { CarouselShell, type Stage } from "@/components/blind-call/CarouselShell"
import { BlindCallToaster } from "@/components/blind-call/Toast"
import { JDStageContent } from "@/components/blind-call/JDStageContent"
import { ResumeStageContent } from "@/components/blind-call/ResumeStageContent"
import {
  STAGE_META,
  canAdvanceJDStage,
  jdStageBlockedMessage,
  isResumeStageComplete,
  type BlindCallStageId,
  type JDStageState,
  type ResumeStageState,
} from "@/lib/stages"
import { MOCK_CASE } from "@/lib/mock-data/case"

const INITIAL_JD_STATE: JDStageState = {
  summary: MOCK_CASE.jd,
  archetype: { selected: [], customNote: "" },
  realAsk: { value: "" },
}

const INITIAL_RESUME_STATE: ResumeStageState = {
  summary: MOCK_CASE.resume.summary,
  statements: MOCK_CASE.resume.statements,
  values: {},
}

function PlaceholderStage({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )
}

export default function JudgePage() {
  const [currentStageId, setCurrentStageId] = useState<BlindCallStageId>("jd")
  const [jd, setJd] = useState<JDStageState>(INITIAL_JD_STATE)
  const [hasDirtyRealAskDraft, setHasDirtyRealAskDraft] = useState(false)
  const [hasDirtyNoteDraft, setHasDirtyNoteDraft] = useState(false)
  const [resume, setResume] = useState<ResumeStageState>(INITIAL_RESUME_STATE)

  const stages: Stage[] = useMemo(
    () =>
      STAGE_META.map((meta) => {
        if (meta.id === "jd") {
          return {
            ...meta,
            isComplete: () => canAdvanceJDStage(jd, hasDirtyRealAskDraft, hasDirtyNoteDraft),
            blockedMessage: () => jdStageBlockedMessage(hasDirtyRealAskDraft, hasDirtyNoteDraft),
            content: (
              <JDStageContent
                jd={jd}
                onChange={setJd}
                onRealAskDraftDirtyChange={setHasDirtyRealAskDraft}
                onNoteDraftDirtyChange={setHasDirtyNoteDraft}
              />
            ),
          }
        }
        if (meta.id === "resume") {
          return {
            ...meta,
            isComplete: () => isResumeStageComplete(resume),
            content: <ResumeStageContent resume={resume} onChange={setResume} />,
          }
        }
        return {
          ...meta,
          isComplete: () => false,
          content: <PlaceholderStage title={`${meta.label} — coming soon`} />,
        }
      }),
    [jd, hasDirtyRealAskDraft, hasDirtyNoteDraft, resume]
  )

  return (
    <BlindCallToaster>
      <main className="flex flex-1 items-center justify-center bg-muted p-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
          <CarouselShell
            stages={stages}
            currentStageId={currentStageId}
            onStageChange={(id) => setCurrentStageId(id as BlindCallStageId)}
          />
        </div>
      </main>
    </BlindCallToaster>
  )
}
