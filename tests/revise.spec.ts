import { expect, test } from "@playwright/test"

import {
  dragCarousel,
  forceJDComplete,
  forceResumeComplete,
  reachRevisedState,
} from "./helpers"

// CarouselShell mounts every REACHED stage panel in the DOM (inert when not
// active) and never un-mounts one once reached — once `revised` exists,
// Revise-editing renders a second copy of several shared field components
// (InputWithButton, MultiSelectWithNote, BranchingSingleSelect), so their
// testids collide with the original jd/resume/fit panels' own copies
// (still mounted, just frozen) unless scoped to
// [data-blind-call-stage="revise"] first, same reasoning already documented
// in helpers.ts/card-content-row.spec.ts for the pre-existing jd/resume
// collision.

test.describe("Revise recap", () => {
  test("renders 4 card-content-rows and one 3-row assess-statement-summary when Fit has no sub-option", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)

    const panel = page.locator('[data-blind-call-stage="revise"]')
    await expect(panel.getByTestId("card-content-row")).toHaveCount(4)
    await expect(panel.getByTestId("assess-statement-summary")).toHaveCount(1)
    await expect(panel.locator('[data-testid^="assess-statement-summary-row-"]')).toHaveCount(3)
  })

  test("renders a 5th row (Fit Sub-option) when Fit has a sub-option selected", async ({ page }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click()
    await forceResumeComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click()
    await page
      .locator('[data-blind-call-stage="fit"]')
      .getByTestId("radio-card-narrative_gap")
      .click()
    await page.getByTestId("radio-card-sub-needs_reframing").click()
    await page.getByRole("button", { name: "Next stage" }).click() // fit -> lock interstitial
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await page.getByTestId("lock-interstitial-content-commit").click() // lock -> reveal
    await page.getByRole("button", { name: "Next stage" }).click() // reveal -> revise

    const panel = page.locator('[data-blind-call-stage="revise"]')
    await expect(panel.getByTestId("card-content-row")).toHaveCount(5)
    await expect(panel.getByTestId("card-content-row").last()).toContainText("Fit Sub-option")
  })

  test("forward button is disabled on entry — 'done' isn't mounted until the commit button is tapped", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    await expect(page.getByRole("button", { name: "Next stage" })).toBeDisabled()

    const dots = page.getByTestId("nav-dot-strip").locator(":scope > span")
    await expect(dots).toHaveCount(6)
    await expect(dots.nth(4)).toHaveAttribute("data-nav-dot-state", "current")
  })
})

test.describe("Revise-editing entry", () => {
  test("Let me change something switches to editing with fields prefilled from revised", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')

    await page.getByTestId("revise-stage-content-start-editing").click()
    await expect(page.getByTestId("revise-stage-content-editing")).toBeVisible()
    await expect(panel.getByTestId("revise-stage-content-recap")).toHaveCount(0)
    await expect(panel.getByTestId("input-with-button-field")).toHaveValue("Placeholder real ask")
  })
})

test.describe("Revise-editing — live mutation, no draft layer", () => {
  test("toggling an archetype pill updates its own selected state immediately on tap; recap reflects it only once Save returns to recap", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')

    await page.getByTestId("revise-stage-content-start-editing").click()

    // forceJDComplete already selected "Specialist Depth" for JD Archetype —
    // the first of the two "Specialist Depth" pills rendered inside Revise
    // (JD Archetype's field is built before Resume Archetype's).
    const jdArchetypePill = panel
      .getByTestId("multi-select-with-note-pill-Specialist Depth")
      .first()
    await expect(jdArchetypePill).toHaveAttribute("aria-pressed", "true")

    await jdArchetypePill.click()
    // Immediate — no Save tapped yet. This is the actual property under
    // test: there's no separate commit step for a pill toggle, unlike
    // InputWithButton's explicit Add.
    await expect(jdArchetypePill).toHaveAttribute("aria-pressed", "false")

    await page.getByTestId("revise-stage-content-save").click()
    await expect(panel.getByTestId("revise-stage-content-recap")).toBeVisible()
    // Recap re-renders whatever `revised` already holds — Save didn't cause
    // this write, it only switched which sub-view is shown.
    await expect(panel.getByTestId("card-content-row").first()).toContainText("None selected")
  })
})

test.describe("Revise-editing — forward/backward nav", () => {
  test("forward nav stays disabled throughout editing — 'done' still isn't mounted", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    await page.getByTestId("revise-stage-content-start-editing").click()

    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeDisabled()
    await expect(next).toHaveAttribute("aria-disabled", "true")

    // The commit button that would mount+advance to "done" only exists in
    // the recap sub-view — structurally unreachable while editing, not a
    // separate gate that needs its own toast.
    await expect(page.getByTestId("revise-stage-content-commit-done")).toHaveCount(0)

    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="revise"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("backward nav works unconditionally while editing, never blocked", async ({ page }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    await page.getByTestId("revise-stage-content-start-editing").click()

    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("leaving editing via back-arrow without Cancel/Save still shows recap on re-entry; forward stays disabled — leaving edit mode alone never enables it", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    await page.getByTestId("revise-stage-content-start-editing").click()
    await expect(page.getByTestId("revise-stage-content-editing")).toBeVisible()

    await page.getByRole("button", { name: "Previous stage" }).click() // back to reveal, mid-edit
    await page.getByRole("button", { name: "Next stage" }).click() // forward again into revise

    await expect(page.locator('[data-blind-call-stage="revise"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByTestId("revise-stage-content-recap")).toBeVisible()
    await expect(page.getByTestId("revise-stage-content-editing")).toHaveCount(0)
    // Forward stays disabled — nothing about leaving editing mounts "done".
    // Only the explicit commit button does that.
    await expect(page.getByRole("button", { name: "Next stage" })).toBeDisabled()
  })
})

// Revise has no draft layer per field (every tap mutates `revised` directly,
// immediately) and backward nav is unconditional everywhere in this app, so
// an open, unsaved edit session must be discarded on ANY exit, not just an
// explicit Cancel tap — otherwise an abandoned edit sits in `revised`
// permanently the moment the reviewer navigates away. This generalizes what
// used to be a narrow, Fit-specific gate (select narrative_gap, get blocked
// from Saving/committing past it) into something structural: the original
// bug can no longer produce an incomplete `revised` in the first place,
// regardless of which field or how the reviewer left.
test.describe("Revise-editing — any exit discards an open, unsaved session", () => {
  test("leaving via back-nav (not Save, not Cancel) mid-edit discards the abandoned edit, same as Cancel would", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    const beforeRows = await panel.getByTestId("card-content-row").allTextContents()

    await page.getByTestId("revise-stage-content-start-editing").click()
    // forceJDComplete already selected "Specialist Depth" — toggle it off,
    // an edit that would visibly change the recap if it survived.
    await panel.getByTestId("multi-select-with-note-pill-Specialist Depth").first().click()

    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await page.getByRole("button", { name: "Next stage" }).click()
    await expect(page.locator('[data-blind-call-stage="revise"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    await expect(panel.getByTestId("revise-stage-content-recap")).toBeVisible()
    const afterRows = await panel.getByTestId("card-content-row").allTextContents()
    expect(afterRows).toEqual(beforeRows)
  })

  test("sitting on recap with no open edit session, back-nav touches nothing in revised", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    const beforeRows = await panel.getByTestId("card-content-row").allTextContents()

    // No "Let me change something" tap here — no session is open.
    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await page.getByRole("button", { name: "Next stage" }).click()

    const afterRows = await panel.getByTestId("card-content-row").allTextContents()
    expect(afterRows).toEqual(beforeRows)
  })

  // The original bug this whole mechanism replaced: select narrative_gap,
  // leave without picking a sub-option, via back-nav specifically (the path
  // that bypassed Save's now-removed Fit-specific gate entirely). Confirms
  // this is structurally impossible now, not just gated — the underlying
  // `revised.fit.verdict` itself never ends up in the incomplete shape,
  // because the whole edit (not just the Fit field) is discarded on exit.
  test("narrative_gap selected with no sub-option, left via back-nav, cannot produce an incomplete revised.fit — the whole edit is discarded, not gated", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    const beforeRows = await panel.getByTestId("card-content-row").allTextContents()

    await page.getByTestId("revise-stage-content-start-editing").click()
    await panel.getByTestId("radio-card-narrative_gap").click()
    await page.getByRole("button", { name: "Previous stage" }).click()
    await page.getByRole("button", { name: "Next stage" }).click()

    await expect(panel.getByTestId("revise-stage-content-recap")).toBeVisible()
    const afterRows = await panel.getByTestId("card-content-row").allTextContents()
    expect(afterRows).toEqual(beforeRows)
    // No trace of narrative_gap, complete or otherwise.
    for (const row of afterRows) expect(row).not.toContain("Narrative gap")

    // Not just the recap display — the underlying data itself reverted.
    // Re-entering editing must show the original verdict selected, not
    // narrative_gap lingering underneath a correct-looking recap.
    await page.getByTestId("revise-stage-content-start-editing").click()
    await expect(
      panel.getByTestId("revise-stage-content-editing").getByTestId("radio-card-confirmed_fit")
    ).toHaveAttribute("aria-checked", "true")
    await expect(
      panel.getByTestId("revise-stage-content-editing").getByTestId("radio-card-narrative_gap")
    ).toHaveAttribute("aria-checked", "false")
  })
})

test.describe("Revise-editing — Cancel/Save session semantics", () => {
  test("Cancel reverts only the current session's edits; a prior Save survives", async ({ page }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')

    // Session 1: change Real Ask and Save.
    await page.getByTestId("revise-stage-content-start-editing").click()
    await panel.getByTestId("input-with-button-field").fill("First saved revision")
    await panel.getByTestId("input-with-button-add").click()
    await page.getByTestId("revise-stage-content-save").click()
    await expect(panel.getByTestId("revise-stage-content-recap")).toBeVisible()
    await expect(panel.getByTestId("card-content-row").nth(1)).toContainText("First saved revision")

    // Session 2: change it again, then Cancel.
    await page.getByTestId("revise-stage-content-start-editing").click()
    await panel.getByTestId("input-with-button-field").fill("Second unsaved edit")
    await panel.getByTestId("input-with-button-add").click()
    await page.getByTestId("revise-stage-content-cancel").click()

    await expect(panel.getByTestId("revise-stage-content-recap")).toBeVisible()
    await expect(panel.getByTestId("card-content-row").nth(1)).toContainText("First saved revision")
    await expect(panel.getByTestId("card-content-row").nth(1)).not.toContainText("Second unsaved edit")
  })

  test("Save with no edits leaves revised unchanged", async ({ page }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    const beforeText = await panel.getByTestId("card-content-row").first().textContent()

    await page.getByTestId("revise-stage-content-start-editing").click()
    await page.getByTestId("revise-stage-content-save").click()

    const afterText = await panel.getByTestId("card-content-row").first().textContent()
    expect(afterText).toBe(beforeText)
  })
})

test.describe("Revise-editing — Save blocked by an uncommitted draft", () => {
  test("Save disables with an unsaved Real Ask draft; Cancel still works; Save re-enables once committed", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    await page.getByTestId("revise-stage-content-start-editing").click()

    const save = page.getByTestId("revise-stage-content-save")
    await expect(save).toBeEnabled()

    await panel.getByTestId("input-with-button-field").fill("An unsaved draft")
    await expect(save).toBeDisabled()
    await expect(save).toHaveAttribute("aria-disabled", "true")
    await expect(page.getByTestId("revise-stage-content-save-blocked-message")).toHaveText(
      "You have an unsaved draft in JD Real Ask — tap Add or clear it before saving"
    )

    // Cancel is never gated by this — discarding a draft is what it's for.
    const cancel = page.getByTestId("revise-stage-content-cancel")
    await expect(cancel).toBeEnabled()
    await cancel.click()
    await expect(page.getByTestId("revise-stage-content-recap")).toBeVisible()

    await page.getByTestId("revise-stage-content-start-editing").click()
    await panel.getByTestId("input-with-button-field").fill("Another unsaved draft")
    await expect(page.getByTestId("revise-stage-content-save")).toBeDisabled()
    await panel.getByTestId("input-with-button-add").click()
    await expect(page.getByTestId("revise-stage-content-save")).toBeEnabled()
  })

  test("Save disables with an unsaved JD Archetype note draft, re-enables once blurred", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    await page.getByTestId("revise-stage-content-start-editing").click()

    // JD Archetype's note field is built before Resume Archetype's.
    const jdNoteField = panel.getByTestId("multi-select-with-note-note-field").first()
    await jdNoteField.fill("An unsaved JD note")

    const save = page.getByTestId("revise-stage-content-save")
    await expect(save).toBeDisabled()

    await jdNoteField.blur()
    await expect(save).toBeEnabled()
  })
})

test.describe("Revise — commit-done button", () => {
  test("'I commit to this, I'm done' mounts 'done' and advances to it in one action, purely a track-advance, no data write", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachRevisedState(page)
    const panel = page.locator('[data-blind-call-stage="revise"]')
    const beforeText = await panel.getByTestId("card-content-row").first().textContent()

    await page.getByTestId("revise-stage-content-commit-done").click()
    await expect(page.locator('[data-blind-call-stage="done"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    // Purely a track-advance — no data work, so backing up shows the exact
    // same recap content as before the button was tapped.
    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(panel.getByTestId("card-content-row").first()).toHaveText(beforeText ?? "")
  })
})
