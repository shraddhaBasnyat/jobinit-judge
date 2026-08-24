"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"

import { CarouselShell, type Stage } from "@/components/blind-call/CarouselShell"
import { JDStageContent } from "@/components/blind-call/JDStageContent"
import { ResumeStageContent } from "@/components/blind-call/ResumeStageContent"
import { FitStageContent } from "@/components/blind-call/FitStageContent"
import { RevealStageContent } from "@/components/blind-call/RevealStageContent"
import { LockInterstitialContent } from "@/components/blind-call/LockInterstitialContent"
import { ReviseStageContent } from "@/components/blind-call/ReviseStageContent"
import {
  STAGE_META,
  isJDStageComplete,
  isResumeStageComplete,
  isFitStageComplete,
  isRevealStageComplete,
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
  const [jd, setJd] = useState<JDStageState>(INITIAL_JD_STATE)
  const [resume, setResume] = useState<ResumeStageState>(INITIAL_RESUME_STATE)
  const [fit, setFit] = useState<FitStageState>(INITIAL_FIT_STATE)
  const [locked, setLocked] = useState(false)
  const [revised, setRevised] = useState<RevisedState | undefined>(undefined)
  // Replaces isRevising/canAdvanceReviseStage — Revise's own completion
  // signal for the prefix-scan walk, flipped only by the explicit "I commit
  // to this, I'm done" button (see ReviseStageContent's onCommitDone).
  const [hasCommittedRevise, setHasCommittedRevise] = useState(false)
  // Pure observer of CarouselShell's position, sourced entirely from its
  // onStageChange callback — CarouselShell owns position internally now
  // (see CarouselShell.tsx), this is never fed back in. The only consumer
  // is ReviseStageContent's remount-on-leave key below.
  const [activeStageId, setActiveStageId] = useState<BlindCallStageId>("jd")

  // Data side effect only — the append-to-"reveal"-and-advance is automatic
  // inside CarouselShell once its own prefix-scan walk sees isComplete()
  // (== locked) flip, driven by the "reveal" stage's autoAdvanceOnReveal
  // flag below. setRevised and setLocked must stay synchronous within this
  // one handler call (no await/deferred boundary between them) — that's
  // what guarantees React batches them into a single render, so
  // CarouselShell's isComplete: () => locked closure never observes
  // locked === true on a render where revised hasn't also already been
  // updated to match. Their relative order doesn't itself change runtime
  // behavior (state updates don't take effect until the batched
  // re-render), but revised is snapshotted first for readability, matching
  // "snapshot happens at the moment of locking."
  const handleReadyToLock = useCallback(() => {
    setRevised(structuredClone({ jd, resume, fit }))
    setLocked(true)
  }, [jd, resume, fit])

  // Purely a track-advance trigger, same shape as handleReadyToLock minus
  // any side effect — "done" auto-appends and CarouselShell auto-advances
  // to it once this flips isComplete() true for "revise".
  const handleCommitRevise = useCallback(() => {
    setHasCommittedRevise(true)
  }, [])

  const handleStageChange = useCallback((id: string) => {
    setActiveStageId(id as BlindCallStageId)
  }, [])

  const stages: Stage[] = useMemo(
    () =>
      STAGE_META.map((meta) => {
        if (meta.id === "jd") {
          return {
            ...meta,
            isComplete: () => isJDStageComplete(jd),
            content: (
              <FrozenStageWrapper locked={locked}>
                <JDStageContent jd={jd} onChange={setJd} />
              </FrozenStageWrapper>
            ),
          }
        }
        if (meta.id === "resume") {
          return {
            ...meta,
            isComplete: () => isResumeStageComplete(resume),
            content: (
              <FrozenStageWrapper locked={locked}>
                <ResumeStageContent resume={resume} onChange={setResume} />
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
        if (meta.id === "lock") {
          // No autoAdvanceOnReveal here, deliberately — that flag belongs
          // on the stage being advanced TO once its predecessor completes
          // (see "reveal" below), not on the stage that just became
          // mounted. Putting it here would auto-scroll to "lock" itself the
          // instant fit completes, before the reviewer ever taps anything.
          return {
            ...meta,
            navDot: false,
            isComplete: () => locked,
            content: <LockInterstitialContent locked={locked} onReadyToLock={handleReadyToLock} />,
          }
        }
        if (meta.id === "reveal") {
          return {
            ...meta,
            autoAdvanceOnReveal: true,
            isComplete: () => isRevealStageComplete(),
            content: <RevealStageContent reveal={MOCK_CASE.reveal} />,
          }
        }
        if (meta.id === "revise") {
          return {
            ...meta,
            isComplete: () => hasCommittedRevise,
            // No FrozenStageWrapper here, deliberately — Revise is the one
            // place still interactive post-lock.
            content: revised ? (
              <ReviseStageContent
                key={activeStageId === "revise" ? "revise-active" : "revise-inactive"}
                revised={revised}
                onRevisedChange={setRevised}
                onCommitDone={handleCommitRevise}
              />
            ) : (
              <PlaceholderStage title="Revise" />
            ),
          }
        }
        // "done" — no ticket builds this yet, renders as a placeholder.
        return {
          ...meta,
          autoAdvanceOnReveal: true,
          isComplete: () => false,
          content: <PlaceholderStage title={`${meta.label} — coming soon`} />,
        }
      }),
    [jd, resume, fit, locked, revised, hasCommittedRevise, activeStageId, handleReadyToLock, handleCommitRevise]
  )

  return (
    <main className="flex flex-1 items-center justify-center bg-muted p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-4">
        <CarouselShell stages={stages} onStageChange={handleStageChange} />
      </div>
    </main>
  )
}
