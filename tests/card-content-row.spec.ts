import { expect, test } from "@playwright/test"

import { resolveColorVar } from "./helpers"

test.describe("CardContentRow", () => {
  test("renders three rows in order with correct labels, content, and styling", async ({ page }) => {
    await page.goto("/judge")
    const rows = page.getByTestId("card-content-row")
    await expect(rows).toHaveCount(3)

    const expected = [
      { label: "THE TEAM", content: /Small, high-ownership team/ },
      { label: "WHAT YOU'LL DO", content: /Full product loop/ },
      { label: "WHAT WE'RE LOOKING FOR", content: /Looking for 5\+ years/ },
    ]

    const mutedForeground = await resolveColorVar(page, "--muted-foreground")
    const foreground = await resolveColorVar(page, "--foreground")

    for (let i = 0; i < expected.length; i++) {
      const row = rows.nth(i)
      const label = row.locator("p").first()
      const content = row.locator("p").nth(1)

      await expect(label).toHaveText(expected[i].label)
      await expect(content).toHaveText(expected[i].content)

      await expect(label).toHaveCSS("font-family", /Courier New/)
      await expect(label).toHaveCSS("text-transform", "uppercase")
      await expect(label).toHaveCSS("letter-spacing", "0.88px")
      await expect(label).toHaveCSS("color", mutedForeground)

      await expect(content).toHaveCSS("font-size", "13px")
      await expect(content).toHaveCSS("color", foreground)
    }
  })

  test("height grows to fit long content instead of clipping (Hug behavior)", async ({ page }) => {
    await page.goto("/dev/showcase")
    const row = page.getByTestId("long-content-showcase").getByTestId("card-content-row")

    const box = await row.boundingBox()
    // A single short line would be well under 100px (label line + one
    // content line + padding); the long-content fixture wraps across many
    // lines, so a tall box proves the container grew instead of clipping.
    expect(box?.height).toBeGreaterThan(100)

    const overflow = await row.evaluate((el) => getComputedStyle(el).overflow)
    expect(overflow).not.toBe("hidden")
  })
})
