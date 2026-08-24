import { expect, test } from "@playwright/test"

test.describe("Judge page", () => {
  test("renders all 6 nav dots in order with the correct labels", async ({ page }) => {
    await page.goto("/judge")
    const labels = page.getByTestId("nav-dot-strip").locator(":scope > span > span:nth-child(2)")
    await expect(labels).toHaveText(["JD", "Resume", "Fit", "Reveal", "Revise", "Done"])
  })

  test("only jd is mounted in the DOM on first load — the rest mount only once their predecessor completes", async ({
    page,
  }) => {
    await page.goto("/judge")
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveCount(1)
    for (const id of ["resume", "fit", "lock", "reveal", "revise", "done"]) {
      await expect(page.locator(`[data-blind-call-stage="${id}"]`)).toHaveCount(0)
    }
  })

  test("jd completeness requires both archetype AND real-ask", async ({ page }) => {
    await page.goto("/judge")
    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeDisabled()

    // Scoped to the jd panel — resume also renders a MultiSelectWithNote
    // instance now, so an unscoped pill testid is ambiguous.
    await page
      .locator('[data-blind-call-stage="jd"]')
      .getByTestId("multi-select-with-note-pill-Specialist Depth")
      .click()
    await expect(next).toBeDisabled()

    await page.getByTestId("input-with-button-field").fill("The real ask")
    await page.getByTestId("input-with-button-add").click()
    await expect(next).toBeEnabled()
  })
})
