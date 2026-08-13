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

export async function forceJDComplete(page: Page) {
  await page.getByTestId("multi-select-with-note-pill-Specialist Depth").click()
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
}
