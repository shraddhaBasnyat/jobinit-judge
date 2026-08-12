import { expect, test } from "@playwright/test"

test.describe("Judge page", () => {
  test("renders all 6 nav dots in order with the correct labels", async ({ page }) => {
    await page.goto("/judge")
    const labels = page.getByTestId("nav-dot-strip").locator(":scope > span > span:nth-child(2)")
    await expect(labels).toHaveText(["JD", "Resume", "Fit", "Reveal", "Revise", "Done"])
  })

  test("all 6 stage panels are mounted in the DOM even though only jd/resume are reachable", async ({
    page,
  }) => {
    await page.goto("/judge")
    for (const id of ["jd", "resume", "fit", "reveal", "revise", "done"]) {
      await expect(page.locator(`[data-blind-call-stage="${id}"]`)).toHaveCount(1)
    }
  })

  test("jd completeness requires both archetype AND real-ask", async ({ page }) => {
    await page.goto("/judge")
    const status = page.getByTestId("jd-stage-complete-status")
    await expect(status).toHaveText("Incomplete")

    await page.getByTestId("jd-toggle-archetype").click()
    await expect(status).toHaveText("Incomplete")

    await page.getByTestId("jd-toggle-real-ask").click()
    await expect(status).toHaveText("Complete")
  })
})
