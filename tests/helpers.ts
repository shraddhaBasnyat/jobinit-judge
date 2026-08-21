import { expect, type Page } from "@playwright/test"

// Coordinates come from the clipped viewport wrapper (carousel-viewport),
// not the track itself and not the active panel. Two things were tried and
// rejected, both verified directly against the running app:
//   - track.boundingBox(): only reflects the track's first (one-card-wide)
//     flex slot — every child is independently full-track-width with
//     shrink-0, so the track's own box never grows to embrace the
//     overflowing siblings — and that first-slot box drifts off-screen as
//     `x`'s translateX grows more negative with each stage advanced. Only
//     ever landed on-screen for index 0/1 by coincidence; from index 2
//     onward it silently computed off-viewport coordinates, producing a
//     pointer sequence that hit nothing and looked identical to "drag is
//     blocked" even when nothing was actually gated.
//   - the active panel's own boundingBox(): races the stage-change spring
//     animation — reading it immediately after a stage-advancing click
//     (before the transform settles) returns the panel's still-sliding-in
//     position, which can land outside the clipped viewport's visible
//     bounds even though the panel element itself reports that geometry.
// carousel-viewport is the ancestor `overflow-hidden` wrapper: its own box
// is stable and always exactly the visible clipped area, independent of
// `currentIndex` or any in-flight animation.
// Polls the track's own computed transform until two consecutive reads
// (50ms apart) come back identical — i.e. CarouselShell's REST_SPRING
// animate() call has actually finished moving `x` to its rest position,
// rather than assuming any fixed duration. Doesn't need to know the
// expected transform value (that's an implementation detail — cardWidth *
// currentIndex math this helper has no business duplicating), just that it
// has stopped changing.
export async function waitForTrackSettled(page: Page) {
  const track = page.getByTestId("carousel-track")
  let previous: string | null = null
  await expect(async () => {
    const current = await track.evaluate((el) => getComputedStyle(el).transform)
    const settled = current === previous
    previous = current
    expect(settled).toBe(true)
  }).toPass({ timeout: 2000, intervals: [50] })
}

export async function dragCarousel(page: Page, deltaX: number) {
  const viewport = page.getByTestId("carousel-viewport")
  const box = await viewport.boundingBox()
  if (!box) throw new Error("carousel viewport not found")

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX / 3, startY, { steps: 5 })
  await page.mouse.move(startX + (deltaX * 2) / 3, startY, { steps: 5 })
  await page.mouse.move(startX + deltaX, startY, { steps: 5 })
  await page.mouse.up()
}

// Resolves a CSS custom property (e.g. "--primary") to the browser's own
// computed color value, so tests compare against the token's real resolved
// value rather than a hardcoded hex string that could drift from globals.css.
export async function resolveColorVar(page: Page, cssVar: string) {
  return page.evaluate((v) => {
    const el = document.createElement("div")
    el.style.color = `var(${v})`
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).color
    document.body.removeChild(el)
    return resolved
  }, cssVar)
}

// Resolves an arbitrary Tailwind class's computed background-color by
// applying it to a scratch element on the live page — used for
// opacity-modified utilities like "bg-muted/30" where resolveColorVar's
// plain CSS-var approach can't reproduce Tailwind's exact compiled
// color-mix()/rgba output. Comparing computed style to computed style (both
// resolved by the same browser) sidesteps needing to know that output format.
export async function resolveClassBackground(page: Page, className: string) {
  return page.evaluate((cls) => {
    const el = document.createElement("div")
    el.className = cls
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).backgroundColor
    document.body.removeChild(el)
    return resolved
  }, className)
}

export async function forceJDComplete(page: Page) {
  // Scoped to the jd panel — CarouselShell mounts all stage panels in the
  // DOM at once, and resume also renders a MultiSelectWithNote instance, so
  // an unscoped pill testid is ambiguous.
  await page
    .locator('[data-blind-call-stage="jd"]')
    .getByTestId("multi-select-with-note-pill-Specialist Depth")
    .click()
  await page.getByTestId("input-with-button-field").fill("Placeholder real ask")
  await page.getByTestId("input-with-button-add").click()
}

const MOCK_RESUME_STATEMENT_IDS = ["current-jobinit", "image-selection-engine", "swe-to-staff"]

export async function forceResumeComplete(page: Page) {
  for (const id of MOCK_RESUME_STATEMENT_IDS) {
    await page
      .getByTestId(`statement-assess-${id}`)
      .getByTestId("assess-option-radio-backedUp")
      .click()
  }
  // Scoped to the resume panel — see forceJDComplete's comment above for why
  // an unscoped pill testid is ambiguous once both stages render one.
  await page
    .locator('[data-blind-call-stage="resume"]')
    .getByTestId("multi-select-with-note-pill-Specialist Depth")
    .click()
}

export async function forceFitComplete(page: Page) {
  // confirmed_fit has no subOptions, so this alone reaches completeness —
  // narrative_gap's extra sub-selection requirement is exercised by its own
  // dedicated tests, not by this "make it complete" helper.
  await page
    .locator('[data-blind-call-stage="fit"]')
    .getByTestId("radio-card-confirmed_fit")
    .click()
}

// Completes jd/resume/fit and advances to the lock interstitial, leaving it
// pre-lock (forward tap not yet taken). Does not lock — tests that need the
// post-lock state call the "Next stage" button themselves afterward, since
// locking is the one action under test in several of them.
//
// Ends with an explicit assertion that the interstitial is actually active,
// then waits for the track's own settle animation to finish, before
// returning. Three stage-advancing clicks fire back to back here with no
// pause between them; a caller that immediately starts a synthetic drag
// right after (e.g. dragCarousel) can still hit a real gesture-recognition
// race even once the assertion above has confirmed data-active — Framer
// Motion's drag gesture setup for the newly-active track position isn't
// fully wired within the same React commit the DOM attribute lands in.
// Verified directly: without waiting for the settle animation to complete, a
// blocked-forward drag at the interstitial intermittently resolved as a
// same-position no-op — no toast, no advance, no error — instead of
// registering against the new position at all.
export async function reachLockInterstitial(page: Page) {
  await forceJDComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
  await forceResumeComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
  await forceFitComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
  await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
    "data-active",
    "true"
  )
  await waitForTrackSettled(page)
}
