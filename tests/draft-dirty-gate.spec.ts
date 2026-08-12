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
})
