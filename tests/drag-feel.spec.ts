import { expect, test } from "@playwright/test"

import { forceJDComplete } from "./helpers"

// Feel-parity check for the Embla migration, per the ticket's AC: Embla's
// default dragThreshold/friction/duration is accepted as-is, no bespoke
// tuning to match the old PEEK_THRESHOLD_PX/COMMIT_VELOCITY/spring configs.
// The bar is differences in KIND, not magnitude — a misfire (commits when
// it shouldn't, or vice versa), an overshoot (settles past the intended
// slide before correcting), or getting stuck mid-position. Verified
// manually against the real dev server before this was written; these
// three cases capture that pass as a durable regression check.
async function trackTransform(page: import("@playwright/test").Page) {
  return page.getByTestId("carousel-track").evaluate((el) => getComputedStyle(el).transform)
}

// matrix(1, 0, 0, 1, tx, 0) → tx. Sub-pixel residue (Embla's friction-based
// settle rarely lands on an exact integer) is magnitude noise, not a kind
// difference — real assertions below use a tolerance, not exact equality.
function translateX(matrix: string): number {
  const match = matrix.match(/matrix\(1, 0, 0, 1, (-?[\d.]+), 0\)/)
  if (!match) throw new Error(`unexpected transform: ${matrix}`)
  return parseFloat(match[1])
}

test.describe("Drag feel — no misfire, overshoot, or stuck mid-position", () => {
  test("a small jiggle well below any commit threshold snaps cleanly back to rest, not stuck mid-position", async ({
    page,
  }) => {
    await page.goto("/judge")
    const viewport = page.getByTestId("carousel-viewport")
    const box = await viewport.boundingBox()
    if (!box) throw new Error("viewport not found")
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX - 15, startY, { steps: 3 })
    await page.mouse.up()
    await page.waitForTimeout(500)

    await expect(page.locator('[data-blind-call-stage="jd"]')).toHaveAttribute("data-active", "true")
    // Settled back at rest (0), not left partway through a drag — within a
    // few px of 0, not the ~15px jiggle distance itself.
    const tx = translateX(await trackTransform(page))
    expect(Math.abs(tx)).toBeLessThan(5)
  })

  test("a deliberate large drag commits with no overshoot — settles exactly at the next slide's snap position", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    const viewport = page.getByTestId("carousel-viewport")
    const box = await viewport.boundingBox()
    if (!box) throw new Error("viewport not found")
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX - 100, startY, { steps: 5 })
    await page.mouse.move(startX - 200, startY, { steps: 5 })
    await page.mouse.move(startX - 250, startY, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(1000)

    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    const tx1 = translateX(await trackTransform(page))
    await page.waitForTimeout(300)
    const tx2 = translateX(await trackTransform(page))
    // Stable, not still animating/correcting (a genuine overshoot would
    // show a different, closer-to-target value on the second read).
    expect(Math.abs(tx1 - tx2)).toBeLessThan(1)
    // Within a couple px of exactly one slide width — not a few dozen px
    // off, which would indicate a real overshoot rather than sub-pixel
    // friction-settle residue.
    expect(Math.abs(Math.abs(tx1) - box.width)).toBeLessThan(3)
  })

  test("a fast short flick commits via velocity, same as the old COMMIT_VELOCITY intent — not a misfire in either direction", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)
    const viewport = page.getByTestId("carousel-viewport")
    const box = await viewport.boundingBox()
    if (!box) throw new Error("viewport not found")
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    // Short distance, single fast jump — high velocity, well under a
    // deliberate full-drag distance.
    await page.mouse.move(startX - 60, startY, { steps: 1 })
    await page.mouse.up()
    await page.waitForTimeout(1000)

    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })
})
