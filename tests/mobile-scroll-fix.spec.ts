import { test, expect, devices } from "@playwright/test"

import { forceJDComplete } from "./helpers"

// Mobile-emulation-only regression test for the scroll-to-top workaround in
// CarouselShell.tsx — the underlying Chromium mobile-emulation quirk never
// reproduces on desktop Chromium, so this needs its own device-emulated
// context rather than running under the suite's default "chromium" project.
test.use({ ...devices["Pixel 7"] })

test.describe("Mobile scroll-to-top workaround", () => {
  test("tapping a radio past index 0 does not leave window.scrollY snapped to 0", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    await page.getByRole("button", { name: "Next stage" }).click()
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    await page.evaluate(() => window.scrollTo(0, 200))
    const before = await page.evaluate(() => window.scrollY)
    expect(before).toBe(200)

    const radio = page
      .getByTestId("statement-assess-current-jobinit")
      .getByTestId("assess-option-radio-backedUp")
    await radio.click()
    await page.waitForTimeout(300)

    const after = await page.evaluate(() => window.scrollY)
    expect(after).toBe(before)
  })

  test("the workaround never engages on jd (index 0) — nothing to correct there", async ({
    page,
  }) => {
    await page.goto("/judge")
    await page.evaluate(() => window.scrollTo(0, 200))

    await page
      .locator('[data-blind-call-stage="jd"]')
      .getByTestId("multi-select-with-note-pill-Specialist Depth")
      .click()
    await page.waitForTimeout(300)

    // Nothing to assert about scrollY specifically staying put here beyond
    // "the click succeeded normally" — this test exists to confirm the
    // guard's early-return on selectedIndex === 0 doesn't throw or
    // otherwise misbehave, not to reproduce a bug that only manifests past
    // index 0 in the first place.
    await expect(
      page
        .locator('[data-blind-call-stage="jd"]')
        .getByTestId("multi-select-with-note-pill-Specialist Depth")
    ).toHaveAttribute("aria-pressed", "true")
  })
})
