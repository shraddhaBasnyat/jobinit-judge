import type { SelectOption } from "@/components/blind-call/RadioCard"
import {
  isBranchingSingleSelectComplete,
  type BranchingSingleSelectValue,
} from "@/components/blind-call/BranchingSingleSelect"

// Real backend enum values (confirmed with the domain expert) — unlike the
// two Narrative Gap sub-option ids below, which are deliberately exploratory
// and must NOT collide with JobInit's production schema.
export type FitVerdict = "confirmed_fit" | "invisible_expert" | "narrative_gap" | "honest_verdict"

export type FitStageState = {
  verdict: BranchingSingleSelectValue
}

export const FIT_VERDICT_OPTIONS: SelectOption[] = [
  {
    id: "confirmed_fit",
    label: "Confirmed fit",
    hook: "They're ready. The resume backs it up cleanly.",
  },
  {
    id: "invisible_expert",
    label: "Invisible fit",
    hook: "Qualified, but the vocabulary risks falling through application-tracking filters.",
  },
  {
    id: "narrative_gap",
    label: "Narrative gap",
    hook: "Skills transfer, wrong story. Needs reframing to connect them.",
    subOptionsPrompt: "What's missing?",
    subOptions: [
      { id: "needs_reframing", label: "Needs reframing", hook: "What's there is told wrong" },
      { id: "needs_depth", label: "Needs more", hook: "The experience isn't fully there" },
    ],
  },
  {
    id: "honest_verdict",
    label: "Honest verdict",
    hook: "Real gap, not a fit yet.",
  },
]

// The single isComplete() CarouselShell calls for the "fit" stage — a thin
// composition, same shape as isJDStageComplete/isResumeStageComplete. No
// canAdvanceFitStage wrapper: unlike jd/resume, Fit has no free-text draft
// field, so there's no dirty-draft gating concern to AND in.
export function isFitStageComplete(fit: FitStageState): boolean {
  return isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, fit.verdict)
}
