import { expect, test, type Locator } from "@playwright/test"

import { forceJDComplete, resolveClassBackground, resolveColorVar } from "./helpers"

// Resolves the wrapper div's actual computed border-color/background-color
// (not a className assertion) — comparing computed style to computed style,
// consistent with this suite's existing convention (see
// resolveColorVar/resolveClassBackground's own comments in helpers.ts).
async function fieldWrapperStyle(fieldLocator: Locator) {
  return fieldLocator.evaluate((el) => {
    const wrapper = el.parentElement!
    const cs = getComputedStyle(wrapper)
    return { borderColor: cs.borderColor, backgroundColor: cs.backgroundColor }
  })
}

test.describe("Dirty-draft visual treatment — fully decoupled from navigation", () => {
  test("Real Ask field: clean by default, shows the warning treatment while dirty, clears once Added", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const warningBorder = await resolveColorVar(page, "--warning")
    const warningBg = await resolveClassBackground(page, "bg-warning-bg")
    const defaultBorder = await resolveColorVar(page, "--input")
    const defaultBg = await resolveColorVar(page, "--background")

    let style = await fieldWrapperStyle(field)
    expect(style.borderColor).toBe(defaultBorder)
    expect(style.backgroundColor).toBe(defaultBg)

    await field.fill("A brand new unsaved edit")
    style = await fieldWrapperStyle(field)
    expect(style.borderColor).toBe(warningBorder)
    expect(style.backgroundColor).toBe(warningBg)

    await page.getByTestId("input-with-button-add").click()
    style = await fieldWrapperStyle(field)
    expect(style.borderColor).toBe(defaultBorder)
    expect(style.backgroundColor).toBe(defaultBg)
  })

  test("JD Archetype note field: warning treatment while dirty, checkmark and warning treatment are mutually exclusive", async ({
    page,
  }) => {
    await page.goto("/judge")
    const jdPanel = page.locator('[data-blind-call-stage="jd"]')
    const noteField = jdPanel.getByTestId("multi-select-with-note-note-field")
    const checkmark = jdPanel.getByTestId("multi-select-with-note-note-checkmark")
    const warningBorder = await resolveColorVar(page, "--warning")

    await expect(checkmark).toHaveCSS("opacity", "0")

    await noteField.fill("An unsaved note edit")
    let style = await fieldWrapperStyle(noteField)
    expect(style.borderColor).toBe(warningBorder)
    await expect(checkmark).toHaveCSS("opacity", "0") // still not committed

    await noteField.blur()
    style = await fieldWrapperStyle(noteField)
    const defaultBorder = await resolveColorVar(page, "--input")
    expect(style.borderColor).toBe(defaultBorder)
    await expect(checkmark).toHaveCSS("opacity", "1") // committed now, checkmark takes over
  })

  test("a reviewer can knowingly navigate forward with a dirty draft — the warning is visual only, never a navigation gate", async ({
    page,
  }) => {
    await page.goto("/judge")
    await forceJDComplete(page)

    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeEnabled()

    await page.getByTestId("input-with-button-field").fill("A brand new unsaved edit")
    // Dirty now (visually), but Next was never wired to this at all — no
    // isComplete/blockedMessage dependency remains on draft state.
    await expect(next).toBeEnabled()

    await next.click()
    await expect(page.locator('[data-blind-call-stage="resume"]')).toHaveAttribute(
      "data-active",
      "true"
    )
  })
})
