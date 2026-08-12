import { expect, test } from "@playwright/test"

import { dragCarousel, forceJDComplete } from "./helpers"

test.describe("Draft-dirty forward-nav gate", () => {
  test("Next disables when jd is complete but the real-ask draft is unsaved, re-enables once Added", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)

    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeEnabled()

    await page.getByTestId("input-with-button-field").fill("A brand new unsaved edit")
    await expect(next).toBeDisabled()
    await expect(next).toHaveAttribute("aria-disabled", "true")

    // isJDStageComplete itself staying true here (unaffected by draft
    // dirtiness) has no remaining UI hook to assert against directly, now
    // that jd-stage-complete-status is gone — see tests/stages.spec.ts for
    // a direct unit test of that AND composition instead.

    await page.getByTestId("input-with-button-add").click()
    await expect(next).toBeEnabled()
  })

  test("blocked forward drag with a dirty draft shows the draft-specific toast copy, not the generic completion message", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByTestId("input-with-button-field").fill("A brand new unsaved edit")

    await dragCarousel(page, -200)

    await expect(
      page.getByText("You have an unsaved draft — tap Add or clear it before continuing")
    ).toBeVisible()
    await expect(page.getByText("A few more answers to go")).toHaveCount(0)
  })

  test("Next disables when jd is complete but the archetype note draft is unsaved, re-enables once blurred", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)

    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeEnabled()

    await page.getByTestId("multi-select-with-note-note-field").fill("An unsaved note edit")
    await expect(next).toBeDisabled()
    await expect(next).toHaveAttribute("aria-disabled", "true")

    await page.getByTestId("multi-select-with-note-note-field").blur()
    await expect(next).toBeEnabled()
  })

  // No drag-based "blocked toast" test for the note field, unlike realAsk
  // above — verified empirically that neither mouse-drag approach can reach
  // that state: starting the drag from the carousel track's center (like
  // dragCarousel) blurs-and-commits the still-focused note field before the
  // drag is ever evaluated (mousedown on any other element blurs it, and
  // this field commits on blur); starting the drag from the field itself
  // gets captured entirely by the browser's native text-selection drag
  // instead of ever reaching CarouselShell's pan gesture (confirmed via the
  // track's transform never changing and the field's full text ending up
  // selected). realAsk doesn't have this problem because it only commits on
  // an explicit Add click, so a drag from the track's center leaves it
  // genuinely dirty. The dirty-gate logic itself and jdStageBlockedMessage's
  // note-specific copy are still fully covered — see tests/stages.spec.ts.
})
