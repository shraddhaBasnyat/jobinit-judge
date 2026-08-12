import { expect, test } from "@playwright/test"

import { forceJDComplete, resolveColorVar } from "./helpers"

test.describe("NavDot", () => {
  test("initial load: jd is current, the other five are incomplete", async ({ page }) => {
    await page.goto("/judge")
    const dots = page.getByTestId("nav-dot-strip").locator(":scope > span")
    await expect(dots).toHaveCount(6)

    const primary = await resolveColorVar(page, "--primary")
    const mutedGrayBorder = await resolveColorVar(page, "--muted-gray-border")

    const jdDot = dots.nth(0)
    await expect(jdDot).toHaveAttribute("data-nav-dot-state", "current")
    const jdGlyph = jdDot.locator("span").first()
    const jdLabel = jdDot.locator("span").nth(1)
    await expect(jdGlyph).toHaveCSS("background-color", primary)
    const jdBox = await jdGlyph.boundingBox()
    expect(jdBox?.width).toBeCloseTo(6, 0)
    expect(jdBox?.height).toBeCloseTo(6, 0)
    await expect(jdLabel).toHaveText("JD")
    await expect(jdLabel).toBeVisible()

    for (let i = 1; i < 6; i++) {
      const dot = dots.nth(i)
      await expect(dot).toHaveAttribute("data-nav-dot-state", "incomplete")
      const glyph = dot.locator("span").first()
      const label = dot.locator("span").nth(1)
      await expect(glyph).toHaveCSS("border-color", mutedGrayBorder)
      await expect(glyph).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
      // Structural facts require the label to stay in the accessibility
      // tree even when visually hidden — never display:none.
      await expect(label).not.toHaveCSS("display", "none")
    }
  })

  test("jd becomes completed and the strip advances once isJDStageComplete is satisfied", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click()

    const dots = page.getByTestId("nav-dot-strip").locator(":scope > span")
    const jdDot = dots.nth(0)
    await expect(jdDot).toHaveAttribute("data-nav-dot-state", "completed")

    const jdGlyph = jdDot.locator("span").first()
    const mutedGray = await resolveColorVar(page, "--muted-gray")
    await expect(jdGlyph).toHaveCSS("background-color", mutedGray)
    await expect(jdDot.locator("span").nth(1)).not.toHaveCSS("display", "none")

    await expect(dots.nth(1)).toHaveAttribute("data-nav-dot-state", "current")
  })
})
