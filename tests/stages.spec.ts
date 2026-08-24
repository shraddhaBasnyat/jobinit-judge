import { expect, test } from "@playwright/test"

import { isFitStageComplete, type FitStageState } from "@/lib/stages"

function fitState(verdict: FitStageState["verdict"] = {}): FitStageState {
  return { verdict }
}

// No canAdvanceFitStage exists — Fit has no free-text draft field, so
// isFitStageComplete itself is what CarouselShell's Stage.isComplete reads.
test.describe("isFitStageComplete", () => {
  test("false when nothing is selected", () => {
    expect(isFitStageComplete(fitState())).toBe(false)
  })

  test("true when a no-subOptions verdict is selected", () => {
    expect(isFitStageComplete(fitState({ selectedId: "confirmed_fit" }))).toBe(true)
  })

  test("false when narrative_gap is selected but no sub-option is chosen", () => {
    expect(isFitStageComplete(fitState({ selectedId: "narrative_gap" }))).toBe(false)
  })

  test("true when narrative_gap is selected and a sub-option is chosen", () => {
    expect(
      isFitStageComplete(
        fitState({ selectedId: "narrative_gap", selectedSubId: "needs_reframing" })
      )
    ).toBe(true)
  })
})
