import { expect, test } from "@playwright/test"

import { resolveColorVar } from "./helpers"

test.describe("Pill", () => {
  test("all four tones render with the correct colors, weight, and shape", async ({ page }) => {
    await page.goto("/dev/showcase")
    const pills = page.getByTestId("pill-tone-showcase").getByTestId("pill")
    await expect(pills).toHaveCount(4)

    const secondary = await resolveColorVar(page, "--secondary")
    const foreground = await resolveColorVar(page, "--foreground")
    const success = await resolveColorVar(page, "--success")
    const border = await resolveColorVar(page, "--border")
    const mutedForeground = await resolveColorVar(page, "--muted-foreground")
    const warning = await resolveColorVar(page, "--warning")

    const defaultPill = pills.nth(0)
    await expect(defaultPill).toHaveAttribute("data-pill-tone", "default")
    await expect(defaultPill).toHaveCSS("background-color", secondary)
    await expect(defaultPill).toHaveCSS("color", foreground)
    await expect(defaultPill).toHaveCSS("font-weight", "400")

    const positivePill = pills.nth(1)
    await expect(positivePill).toHaveAttribute("data-pill-tone", "positive")
    await expect(positivePill).toHaveCSS("border-color", success)
    await expect(positivePill).toHaveCSS("color", success)
    await expect(positivePill).toHaveCSS("font-weight", "500")

    const neutralPill = pills.nth(2)
    await expect(neutralPill).toHaveAttribute("data-pill-tone", "neutral")
    await expect(neutralPill).toHaveCSS("border-color", border)
    await expect(neutralPill).toHaveCSS("color", mutedForeground)
    await expect(neutralPill).toHaveCSS("font-weight", "500")

    const negativePill = pills.nth(3)
    await expect(negativePill).toHaveAttribute("data-pill-tone", "negative")
    await expect(negativePill).toHaveCSS("border-color", warning)
    await expect(negativePill).toHaveCSS("color", warning)
    await expect(negativePill).toHaveCSS("font-weight", "500")

    for (let i = 0; i < 4; i++) {
      const pill = pills.nth(i)
      await expect(pill).toHaveCSS("font-size", "11px")
      const box = await pill.boundingBox()
      expect(box?.height).toBeCloseTo(20, 0)
      const radius = await pill.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))
      // A radius at least half the pill's height gives fully-rounded ends,
      // matching the spec's 20px radius on a 20px-tall pill regardless of
      // which exact large value Tailwind's rounded-full resolves to.
      expect(radius).toBeGreaterThanOrEqual(10)
    }
  })
})
