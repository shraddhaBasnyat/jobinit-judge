import { expect, test } from "@playwright/test"

import { reachLockInterstitial, reachRevisedState } from "./helpers"

// Proves the auto-advance arming mechanism doesn't double-fire under React
// 18 Strict Mode's dev-mode double-render (confirmed active in this app —
// no reactStrictMode override, App Router defaults to true since Next.js
// 13.5.1 — and playwright.config.ts's webServer runs `npm run dev` for the
// whole suite, so Strict Mode is genuinely exercised here, not bypassed).
//
// A generic "click the button, assert we landed on the right stage" test
// would pass even with a broken (double-arming) guard: a harmless double-arm
// targets the exact same index both times (nothing else changes between a
// Strict Mode component invocation and its throwaway duplicate), so the
// second scrollTo call would just be a no-op to where the track is already
// heading — no visible symptom. This test instead counts the actual
// carousel-shell:auto-advance console.debug calls (see CarouselShell.tsx)
// emitted for one genuine transition, which a double-arm WOULD duplicate
// even when it's otherwise invisible.
test.describe("CarouselShell auto-advance arming — no double-fire under Strict Mode", () => {
  test("lock interstitial's commit button fires exactly one auto-advance", async ({ page }) => {
    const advanceLogs: string[] = []
    page.on("console", (msg) => {
      if (msg.text().startsWith("carousel-shell:auto-advance")) advanceLogs.push(msg.text())
    })

    await page.goto("/judge")
    await reachLockInterstitial(page)

    await page.getByTestId("lock-interstitial-content-commit").click()
    await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    expect(advanceLogs).toHaveLength(1)
  })

  test("Revise's commit-done button fires exactly one auto-advance", async ({ page }) => {
    const advanceLogs: string[] = []
    page.on("console", (msg) => {
      if (msg.text().startsWith("carousel-shell:auto-advance")) advanceLogs.push(msg.text())
    })

    await page.goto("/judge")
    await reachRevisedState(page)

    // reachRevisedState already triggers one auto-advance (the lock
    // button) before this point — only count what the commit-done button
    // itself fires, from here forward.
    advanceLogs.length = 0

    await page.getByTestId("revise-stage-content-commit-done").click()
    await expect(page.locator('[data-blind-call-stage="done"]')).toHaveAttribute(
      "data-active",
      "true"
    )

    expect(advanceLogs).toHaveLength(1)
  })
})
