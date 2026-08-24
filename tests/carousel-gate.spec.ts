import { expect, test } from "@playwright/test"

import { dragCarousel, forceJDComplete } from "./helpers"

test.describe("CarouselShell gating", () => {
  test("blocked forward drag does not advance — resume isn't mounted yet, so it rubber-bands with no custom gating code", async ({
    page,
  }) => {
    await page.goto("/judge")
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveCount(0)
  })

  test("successful forward drag advances once resume is mounted", async ({ page }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("backward drag always succeeds regardless of the target stage's completeness", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click() // now on resume, isComplete() false
    await dragCarousel(page, 200) // drag right = backward
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
  })

  test("first-stage backward drag is a no-op with no error", async ({ page }) => {
    await page.goto("/judge")
    await dragCarousel(page, 200)
    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
  })

  // Regression test: Embla's watchDrag callback (migrated from Framer
  // Motion's onPointerDownCapture guard) must skip drag-handler engagement
  // for a pointer sequence that starts on an interactive control, so a
  // mouse drift mid-click never gets hijacked into a stage-navigation
  // swipe — reproduced directly against StatementAssess's existing radio,
  // not just RadioCard.
  test("mouse drift while clicking an interactive control never hijacks navigation", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click()
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    const radio = page
      .getByTestId("statement-assess-current-jobinit")
      .getByTestId("assess-option-radio-backedUp")
    const box = await radio.boundingBox()
    if (!box) throw new Error("radio not found")
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 80, cy, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(300)

    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })
})
