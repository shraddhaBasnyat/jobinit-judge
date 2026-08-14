import type { Page } from "@playwright/test"

export async function dragCarousel(page: Page, deltaX: number) {
  const track = page.getByTestId("carousel-track")
  const box = await track.boundingBox()
  if (!box) throw new Error("carousel track not found")

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
