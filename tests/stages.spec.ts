import { expect, test } from "@playwright/test"

import { canAdvanceJDStage, type JDStageState } from "@/lib/stages"

const SUMMARY: JDStageState["summary"] = {
  badgeLabel: "JD",
  roleTitle: "Test Role",
  team: "",
  whatYoullDo: "",
  whatWereLookingFor: "",
}

function jdState(overrides: Partial<Pick<JDStageState, "archetype" | "realAsk">> = {}): JDStageState {
  return {
    summary: SUMMARY,
    archetype: { selected: ["specialist_depth"], customNote: "" },
    realAsk: { value: "The real ask" },
    ...overrides,
  }
}

// No UI hook exposes isJDStageComplete/canAdvanceJDStage's raw composition
// directly anymore (jd-stage-complete-status was removed) — this proves the
// AND logic itself at the function level instead of via a rendered signal.
test.describe("canAdvanceJDStage", () => {
  test("complete jd with a dirty draft cannot advance", () => {
    expect(canAdvanceJDStage(jdState(), true)).toBe(false)
  })

  test("complete jd with a clean draft can advance", () => {
    expect(canAdvanceJDStage(jdState(), false)).toBe(true)
  })

  test("incomplete jd with a clean draft cannot advance", () => {
    const incomplete = jdState({ archetype: { selected: [], customNote: "" } })
    expect(canAdvanceJDStage(incomplete, false)).toBe(false)
  })
})
