import { expect, test } from "@playwright/test"

import { resolveColorVar } from "./helpers"

test.describe("TextField", () => {
  test("renders with correct box model per spec", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const wrapper = field.locator("xpath=..")

    const box = await wrapper.boundingBox()
    expect(box?.height).toBeCloseTo(36, 0)

    await expect(wrapper).toHaveCSS("padding-top", "8px")
    await expect(wrapper).toHaveCSS("padding-bottom", "8px")
    await expect(wrapper).toHaveCSS("padding-left", "12px")
    await expect(wrapper).toHaveCSS("padding-right", "12px")
    await expect(wrapper).toHaveCSS("border-width", "1px")
    await expect(wrapper).toHaveCSS("border-style", "solid")
    await expect(wrapper).toHaveCSS("border-radius", "6px")

    const border = await resolveColorVar(page, "--border")
    const background = await resolveColorVar(page, "--background")
    await expect(wrapper).toHaveCSS("border-color", border)
    await expect(wrapper).toHaveCSS("background-color", background)
  })

  test("placeholder is muted-foreground; typed text swaps to foreground", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")

    const mutedForeground = await resolveColorVar(page, "--muted-foreground")
    const foreground = await resolveColorVar(page, "--foreground")

    const placeholderColor = await field.evaluate(
      (el) => getComputedStyle(el, "::placeholder").color
    )
    expect(placeholderColor).toBe(mutedForeground)

    await field.fill("The team is understaffed")
    await expect(field).toHaveCSS("color", foreground)
  })

  test("long text truncates with ellipsis instead of silently clipping", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")

    const longValue =
      "This is a deliberately long real-ask answer meant to overflow the field's visible width so the ellipsis truncation behavior actually gets exercised instead of just asserted in theory."
    await field.fill(longValue)
    await field.blur()

    await expect(field).toHaveCSS("text-overflow", "ellipsis")
    // Chromium reports form controls' computed overflow as "clip", not
    // "hidden", regardless of authored CSS (their internal text-scrolling
    // isn't governed by the normal overflow box model) — this is the correct
    // resolved value for an <input>, not a bug in the component.
    await expect(field).toHaveCSS("overflow-x", "clip")
    await expect(field).toHaveCSS("white-space", "nowrap")

    const isOverflowing = await field.evaluate((el) => {
      const input = el as HTMLInputElement
      return input.scrollWidth > input.clientWidth
    })
    expect(isOverflowing).toBe(true)
  })
})
