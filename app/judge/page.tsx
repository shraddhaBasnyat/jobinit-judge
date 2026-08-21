"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"

import { CarouselShell, type Stage } from "@/components/blind-call/CarouselShell"
import { BlindCallToaster } from "@/components/blind-call/Toast"
import { JDStageContent } from "@/components/blind-call/JDStageContent"
import { ResumeStageContent } from "@/components/blind-call/ResumeStageContent"
import { FitStageContent } from "@/components/blind-call/FitStageContent"
import { RevealStageContent } from "@/components/blind-call/RevealStageContent"
import { LockInterstitialContent } from "@/components/blind-call/LockInterstitialContent"
import { ReviseStageContent } from "@/components/blind-call/ReviseStageContent"
import {
  STAGE_META,
  canAdvanceJDStage,
  jdStageBlockedMessage,
  canAdvanceResumeStage,
  resumeStageBlockedMessage,
  isFitStageComplete,
  isRevealStageComplete,
  canAdvanceReviseStage,
  reviseStageBlockedMessage,
  type BlindCallStageId,
  type JDStageState,
  type ResumeStageState,
  type FitStageState,
  type RevisedState,
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
  archetype: { selected: [], customNote: "" },
}

const INITIAL_FIT_STATE: FitStageState = {
  verdict: {},
}

function PlaceholderStage({ title }: { title: string }) {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  )
}

// Freezes jd/resume/fit content once locked, without CarouselShell itself
// ever needing to know `locked` exists — applied unconditionally on
// `locked`, independent of whether the wrapped stage is currently active.
function FrozenStageWrapper({ locked, children }: { locked: boolean; children: ReactNode }) {
  return (
    <div className={locked ? "opacity-40 pointer-events-none" : undefined} inert={locked}>
      {children}
    </div>
  )
}

export default function JudgePage() {
  // "lock" addresses the lock-interstitial screen for track position only —
  // it deliberately never enters BlindCallStageId, since the interstitial
  // is not a Stage.
  const [currentStageId, setCurrentStageId] = useState<BlindCallStageId | "lock">("jd")
  const [jd, setJd] = useState<JDStageState>(INITIAL_JD_STATE)
  const [hasDirtyRealAskDraft, setHasDirtyRealAskDraft] = useState(false)
  const [hasDirtyNoteDraft, setHasDirtyNoteDraft] = useState(false)
  const [resume, setResume] = useState<ResumeStageState>(INITIAL_RESUME_STATE)
  const [hasDirtyResumeNoteDraft, setHasDirtyResumeNoteDraft] = useState(false)
  const [fit, setFit] = useState<FitStageState>(INITIAL_FIT_STATE)
  const [locked, setLocked] = useState(false)
  const [revised, setRevised] = useState<RevisedState | undefined>(undefined)
  const [isRevising, setIsRevising] = useState(false)

  const handleLockForward = useCallback(() => {
    setRevised(structuredClone({ jd, resume, fit }))
    setLocked(true)
    setCurrentStageId("reveal")
  }, [jd, resume, fit])

  // Resets isRevising in the same event handler that moves the reviewer off
  // "revise" (rather than an effect watching for the change) — the
  // React-recommended way to sync state to an event, not a useEffect. Fires
  // regardless of which nav path was used (button or drag), since both flow
  // through CarouselShell's onStageChange.
  const handleStageChange = useCallback((id: string) => {
    setCurrentStageId(id as BlindCallStageId | "lock")
    if (id !== "revise") setIsRevising(false)
  }, [])

  const stages: Stage[] = useMemo(
    () =>
      STAGE_META.map((meta) => {
        if (meta.id === "jd") {
          return {
            ...meta,
            isComplete: () => canAdvanceJDStage(jd, hasDirtyRealAskDraft, hasDirtyNoteDraft),
            blockedMessage: () => jdStageBlockedMessage(hasDirtyRealAskDraft, hasDirtyNoteDraft),
            content: (
              <FrozenStageWrapper locked={locked}>
                <JDStageContent
                  jd={jd}
                  onChange={setJd}
                  onRealAskDraftDirtyChange={setHasDirtyRealAskDraft}
                  onNoteDraftDirtyChange={setHasDirtyNoteDraft}
                />
              </FrozenStageWrapper>
            ),
          }
        }
        if (meta.id === "resume") {
          return {
            ...meta,
            isComplete: () => canAdvanceResumeStage(resume, hasDirtyResumeNoteDraft),
            blockedMessage: () => resumeStageBlockedMessage(hasDirtyResumeNoteDraft),
            content: (
              <FrozenStageWrapper locked={locked}>
                <ResumeStageContent
                  resume={resume}
                  onChange={setResume}
                  onNoteDraftDirtyChange={setHasDirtyResumeNoteDraft}
                />
              </FrozenStageWrapper>
            ),
          }
        }
        if (meta.id === "fit") {
          return {
            ...meta,
            isComplete: () => isFitStageComplete(fit),
            content: (
              <FrozenStageWrapper locked={locked}>
                <FitStageContent fit={fit} onChange={setFit} />
              </FrozenStageWrapper>
            ),
          }
        }
        if (meta.id === "reveal") {
          return {
            ...meta,
            isComplete: () => isRevealStageComplete(),
            content: <RevealStageContent reveal={MOCK_CASE.reveal} />,
          }
        }
        if (meta.id === "revise") {
          return {
            ...meta,
            isComplete: () => canAdvanceReviseStage(isRevising),
            blockedMessage: () => reviseStageBlockedMessage(isRevising),
            // No FrozenStageWrapper here, deliberately — Revise is the one
            // place still interactive post-lock.
            content: revised ? (
              <ReviseStageContent
                key={currentStageId === "revise" ? "revise-active" : "revise-inactive"}
                revised={revised}
                onRevisedChange={setRevised}
                onEditModeChange={setIsRevising}
              />
            ) : (
              <PlaceholderStage title="Revise" />
            ),
          }
        }
        return {
          ...meta,
          isComplete: () => false,
          content: <PlaceholderStage title={`${meta.label} — coming soon`} />,
        }
      }),
    [
      jd,
      hasDirtyRealAskDraft,
      hasDirtyNoteDraft,
      resume,
      hasDirtyResumeNoteDraft,
      fit,
      locked,
      revised,
      isRevising,
      currentStageId,
    ]
  )

  return (
    <BlindCallToaster>
      <main className="flex flex-1 items-center justify-center bg-muted p-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
          <CarouselShell
            stages={stages}
            currentStageId={currentStageId}
            onStageChange={handleStageChange}
            interstitial={{
              id: "lock",
              afterStageId: "fit",
              content: <LockInterstitialContent locked={locked} />,
              forwardLabel: locked
                ? undefined
                : "This will lock your answers — you can still revise them later.",
              backLabel: locked ? "Answers are already locked" : undefined,
              blockedMessage: locked ? undefined : "Tap the arrow to lock and continue",
              onForward: handleLockForward,
            }}
          />
        </div>
      </main>
    </BlindCallToaster>
  )
}
