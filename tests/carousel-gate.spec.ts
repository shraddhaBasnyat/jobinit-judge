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

  // Regression test: Framer Motion's drag="x" listens for pointerdown on the
  // track itself, with no built-in distinction between "the user meant to
  // swipe" and "the user clicked a wide interactive control and their mouse
  // drifted a few px mid-click." Before the onPointerDownCapture guard in
  // CarouselShell, that drift alone (well under a deliberate swipe gesture)
  // was enough to hijack the click into a stage-navigation drag — reproduced
  // directly against StatementAssess's existing radio, not just RadioCard.
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
