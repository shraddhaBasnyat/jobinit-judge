import { expect, test } from "@playwright/test"

import { resolveColorVar } from "./helpers"

test.describe("HeaderNodeInfo", () => {
  test("renders a real default-tone Pill badge plus the role title", async ({ page }) => {
    await page.goto("/judge")
    // Scoped to the jd panel — CarouselShell mounts all stage panels in the
    // DOM at once (resume also renders a real HeaderNodeInfo as of #10), so
    // an unscoped page.getByTestId("header-node-info") is now ambiguous.
    const header = page.locator('[data-blind-call-stage="jd"]').getByTestId("header-node-info")

    const badge = header.getByTestId("pill")
    await expect(badge).toHaveAttribute("data-pill-tone", "default")
    await expect(badge).toHaveText("JD")
    // Guards against the old broken badge styling (10px / weight 700) —
    // the badge must be a real Pill default-tone instance, not a bespoke one.
    await expect(badge).toHaveCSS("font-size", "11px")
    await expect(badge).toHaveCSS("font-weight", "400")

    const label = header.locator("span").nth(1)
    await expect(label).toHaveText("Senior Product Engineer, Cresta Labs")
    await expect(label).toHaveCSS("font-size", "14px")
    await expect(label).toHaveCSS("font-weight", "600")
    await expect(label).toHaveCSS("line-height", "20px")

    const foreground = await resolveColorVar(page, "--foreground")
    await expect(label).toHaveCSS("color", foreground)
  })
})
