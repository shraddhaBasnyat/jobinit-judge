import { expect, test } from "@playwright/test"

import { forceJDComplete } from "./helpers"

test.describe("CardPrevNext", () => {
  test("Prev is disabled on the first stage, Next is disabled while jd is incomplete", async ({
    page,
  }) => {
    await page.goto("/judge")
    const prev = page.getByRole("button", { name: "Previous stage" })
    const next = page.getByRole("button", { name: "Next stage" })

    await expect(prev).toBeDisabled()
    await expect(prev).toHaveAttribute("aria-disabled", "true")
    await expect(prev).toHaveCSS("pointer-events", "none")
    await expect(prev).toHaveCSS("opacity", "0.5")

    await expect(next).toBeDisabled()
    await expect(next).toHaveAttribute("aria-disabled", "true")
    await expect(next).toHaveCSS("pointer-events", "none")
    await expect(next).toHaveCSS("opacity", "0.5")

    // Clicking a disabled Next must not fire onNext / advance the stage.
    await next.click({ force: true })
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
  })

  test("Next enables once jd is complete and advances; Prev then enables and returns unconditionally", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)

    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeEnabled()
    await next.click()
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    // resume is a placeholder stage that never completes.
    await expect(next).toBeDisabled()

    const prev = page.getByRole("button", { name: "Previous stage" })
    await expect(prev).toBeEnabled()
    await prev.click()
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")

    // Back on jd, which is still complete (state wasn't reset), so Next
    // re-enables — completeness is a live property of the current stage,
    // not a one-way ratchet.
    await expect(next).toBeEnabled()
  })

  test("a disabled button tap never fires the blocked-stage toast", async ({ page }) => {
    await page.goto("/judge")
    const next = page.getByRole("button", { name: "Next stage" })
    await next.click({ force: true })
    await next.click({ force: true })
    await expect(page.getByText("A few more answers to go")).toHaveCount(0)
  })
})
