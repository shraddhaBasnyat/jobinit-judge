import { expect, test } from "@playwright/test"

import { dragCarousel, resolveColorVar } from "./helpers"

test.describe("Toast", () => {
  test("blocked forward swipe shows the toast with correct copy and token-derived styling", async ({
    page,
  }) => {
    await page.goto("/judge")
    await dragCarousel(page, -200) // drag left = forward, jd is incomplete

    const toast = page.getByText("A few more answers to go")
    await expect(toast).toBeVisible()

    const root = page.locator('[data-slot="toast-root"]')
    const background = await resolveColorVar(page, "--background")
    const border = await resolveColorVar(page, "--border")
    await expect(root).toHaveCSS("background-color", background)
    await expect(root).toHaveCSS("border-color", border)
    await expect(root).toHaveCSS("border-radius", "6px")

    const title = page.locator('[data-slot="toast-title"]')
    await expect(title).toHaveCSS("font-weight", "600")
    await expect(title).toHaveCSS("font-size", "14px")

    await page.locator('[data-slot="toast-close"]').click()
    await expect(toast).toHaveCount(0)
  })

  test("toast auto-dismisses within ~2.5s", async ({ page }) => {
    await page.goto("/judge")
    await dragCarousel(page, -200)

    const toast = page.getByText("A few more answers to go")
    await expect(toast).toBeVisible()
    await page.waitForTimeout(1000)
    await expect(toast).toBeVisible()
    await expect(toast).toHaveCount(0, { timeout: 2500 })
  })
})
