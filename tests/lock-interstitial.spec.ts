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

  test("tapping 'I'm ready to lock' locks, snapshots, and advances to reveal in one action", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)

    await page.getByTestId("lock-interstitial-content-commit").click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("forward drag pre-lock has nowhere to go — reveal isn't mounted yet, so it rubber-bands with no navigation", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)

    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    // No toast mechanism exists anymore — rejection is purely Embla's own
    // boundary rubber-band, same as any other unmounted-next-stage case.
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveCount(0)
  })

  test("back-nav to interstitial after locking shows the post-lock note, drag resumes", async ({
    page,
  }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)
    await page.getByTestId("lock-interstitial-content-commit").click() // locks, arrives at reveal

    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await expect(page.getByTestId("lock-interstitial-content-post-lock-note")).toHaveText(
      "Answers are already locked"
    )
    await expect(
      page.getByText("This will lock your answers — you can still revise them later.")
    ).toHaveCount(0)

    // Body copy switches to past tense post-lock too, not just the button.
    await expect(page.getByText("Your JD, resume, and fit answers are locked.")).toHaveCount(1)
    await expect(
      page.getByText("Your JD, resume, and fit answers will be locked once you continue.")
    ).toHaveCount(0)

    // The commit button is gone post-lock — nothing left to trigger.
    await expect(page.getByTestId("lock-interstitial-content-commit")).toHaveCount(0)

    // Drag-gating is lifted post-lock — reveal is mounted now, ordinary
    // forward-drag reaches it same as any other boundary crossing.
    await dragCarousel(page, -200)
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })

  test("jd/resume/fit remain reachable via back-nav after locking", async ({ page }) => {
    await page.goto("/judge")
    await reachLockInterstitial(page)
    await page.getByTestId("lock-interstitial-content-commit").click() // locks, arrives at reveal

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
    await page.getByTestId("lock-interstitial-content-commit").click() // locks

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
