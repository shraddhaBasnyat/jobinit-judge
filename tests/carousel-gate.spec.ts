import { expect, test } from "@playwright/test"

import { dragCarousel, forceJDComplete } from "./helpers"

test.describe("CarouselShell gating", () => {
  test("blocked forward drag does not advance and fires the toast exactly once per attempt", async ({
    page,
  }) => {
    await page.goto("/judge")
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
    await expect(page.getByText("A few more answers to go")).toHaveCount(1)
  })

  test("rapid repeat blocked attempts while the toast is showing do not queue or restart it", async ({
    page,
  }) => {
    await page.goto("/judge")
    await dragCarousel(page, -200)
    await expect(page.getByText("A few more answers to go")).toHaveCount(1)
    await dragCarousel(page, -200)
    await dragCarousel(page, -200)
    await expect(page.getByText("A few more answers to go")).toHaveCount(1)
  })

  test("successful forward drag advances with no toast", async ({ page }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByText("A few more answers to go")).toHaveCount(0)
  })

  test("backward drag always succeeds regardless of the target stage's completeness, never shows a toast", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click() // now on resume, isComplete() false
    await dragCarousel(page, 200) // drag right = backward
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
    await expect(page.getByText("A few more answers to go")).toHaveCount(0)
  })

  test("first-stage backward drag is a no-op with no error and no toast", async ({ page }) => {
    await page.goto("/judge")
    await dragCarousel(page, 200)
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
    await expect(page.getByText("A few more answers to go")).toHaveCount(0)
  })
})
