import { expect, test } from "@playwright/test"

import { canAdvanceJDStage, jdStageBlockedMessage, type JDStageState } from "@/lib/stages"

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
  test("complete jd with a dirty real-ask draft cannot advance", () => {
    expect(canAdvanceJDStage(jdState(), true, false)).toBe(false)
  })

  test("complete jd with a dirty note draft cannot advance", () => {
    expect(canAdvanceJDStage(jdState(), false, true)).toBe(false)
  })

  test("complete jd with both drafts dirty cannot advance", () => {
    expect(canAdvanceJDStage(jdState(), true, true)).toBe(false)
  })

  test("complete jd with both drafts clean can advance", () => {
    expect(canAdvanceJDStage(jdState(), false, false)).toBe(true)
  })

  test("incomplete jd with both drafts clean cannot advance", () => {
    const incomplete = jdState({ archetype: { selected: [], customNote: "" } })
    expect(canAdvanceJDStage(incomplete, false, false)).toBe(false)
  })

  test("jd complete via note-only archetype (no pills selected) can advance", () => {
    const noteOnly = jdState({ archetype: { selected: [], customNote: "Somewhere in between" } })
    expect(canAdvanceJDStage(noteOnly, false, false)).toBe(true)
  })
})

test.describe("jdStageBlockedMessage", () => {
  test("realAsk dirty message takes priority when both drafts are dirty", () => {
    expect(jdStageBlockedMessage(true, true)).toBe(
      "You have an unsaved draft — tap Add or clear it before continuing"
    )
  })

  test("note-specific copy shown when only the note draft is dirty", () => {
    expect(jdStageBlockedMessage(false, true)).toBe(
      "You have an unsaved note — tap elsewhere to save it, or clear it before continuing"
    )
  })

  test("undefined when neither draft is dirty", () => {
    expect(jdStageBlockedMessage(false, false)).toBeUndefined()
  })
})
