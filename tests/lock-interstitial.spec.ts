import { expect, test } from "@playwright/test"

import { dragCarousel, reachLockInterstitial } from "./helpers"

test.describe("Lock interstitial", () => {
  test("renders between fit and reveal with no nav dot, Fit dot stays current", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)

    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    const labels = page.getByTestId("nav-dot-strip").locator(":scope > span > span:nth-child(2)")
    await expect(labels).toHaveText(["JD", "Resume", "Fit", "Reveal", "Revise", "Done"])

    const fitDot = page.getByTestId("nav-dot-strip").locator(":scope > span").nth(2)
    await expect(fitDot).toHaveAttribute("data-nav-dot-state", "current")

    await expect(
      page.getByText("Your JD, resume, and fit answers will be locked once you continue.")
    ).toHaveCount(1)
  })

  test("forward tap locks, snapshots, and advances to reveal in one action", async ({ page }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)

    await page.getByRole("button", { name: "Next stage" }).click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("forward drag pre-lock is blocked with a toast, never commits the lock", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)

    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByText("Tap the arrow to lock and continue")).toHaveCount(1)
  })

  test("back-nav to interstitial after locking shows backLabel, no forward warning, drag resumes", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)
    await page.getByRole("button", { name: "Next stage" }).click() // locks, arrives at reveal

    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByText("Answers are already locked")).toHaveCount(1)
    await expect(
      page.getByText("This will lock your answers — you can still revise them later.")
    ).toHaveCount(0)

    // Body copy switches to past tense post-lock too, not just the arrow label.
    await expect(page.getByText("Your JD, resume, and fit answers are locked.")).toHaveCount(1)
    await expect(
      page.getByText("Your JD, resume, and fit answers will be locked once you continue.")
    ).toHaveCount(0)

    // Drag-gating is lifted post-lock — nothing left to accidentally trigger.
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByText("Tap the arrow to lock and continue")).toHaveCount(0)
  })

  test("jd/resume/fit remain reachable via back-nav after locking", async ({ page }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)
    await page.getByRole("button", { name: "Next stage" }).click() // locks, arrives at reveal

    const prev = page.getByRole("button", { name: "Previous stage" })
    for (const id of ["lock", "fit", "resume", "jd"]) {
      await prev.click()
      await expect(page.locator(`[data-blind-call-stage="${id}"]`)).toHaveAttribute(
        "data-active",
        "true"
      )
    }
  })

  test("locked jd/resume/fit stages render inert: dimmed, non-interactive, unfocusable", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)
    await page.getByRole("button", { name: "Next stage" }).click() // locks

    const prev = page.getByRole("button", { name: "Previous stage" })
    await prev.click() // back to lock
    await prev.click() // back to fit

    const fitPanel = page.locator('[data-blind-call-stage="fit"]')
    const fitWrapper = fitPanel.locator("> div")
    await expect(fitWrapper).toHaveCSS("opacity", "0.4")
    await expect(fitWrapper).toHaveCSS("pointer-events", "none")

    // A click can't reach the frozen radio card underneath pointer-events:none.
    const radioCard = fitPanel.getByTestId("radio-card-confirmed_fit")
    await radioCard.click({ force: true, trial: true }).catch(() => {})
    const stillNotChecked = await radioCard.getAttribute("data-checked")
    expect(stillNotChecked).not.toBe("true")

    // inert removes the subtree from tab order entirely.
    const focusedInsideFrozenPanel = await page.evaluate(() => {
      const panel = document.querySelector('[data-blind-call-stage="fit"]')
      return Boolean(panel && panel.contains(document.activeElement) && document.activeElement !== panel)
    })
    expect(focusedInsideFrozenPanel).toBe(false)
  })
})
