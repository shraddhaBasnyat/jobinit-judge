import { expect, test } from "@playwright/test"

test.describe("NavDotStrip", () => {
  test("horizontal, 6 dots, gap/padding tokens, spans the width of its parent (not the viewport)", async ({
    page,
  }) => {
    await page.goto("/judge")
    const strip = page.getByTestId("nav-dot-strip")

    await expect(strip).toHaveCSS("flex-direction", "row")
    await expect(strip).toHaveCSS("gap", "10px")
    await expect(strip).toHaveCSS("padding-left", "8px")
    await expect(strip).toHaveCSS("padding-right", "8px")
    await expect(strip.locator(":scope > span")).toHaveCount(6)

    const matchesParentWidth = await strip.evaluate((el) => {
      const parent = el.parentElement!
      return Math.abs(el.getBoundingClientRect().width - parent.getBoundingClientRect().width) < 1
    })
    expect(matchesParentWidth).toBe(true)

    const viewport = page.viewportSize()
    const stripBox = await strip.boundingBox()
    expect(stripBox!.width).toBeLessThan(viewport!.width)
  })
})
