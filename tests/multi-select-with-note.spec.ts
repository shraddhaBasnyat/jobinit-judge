import fs from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { isMultiSelectWithNoteComplete } from "@/components/blind-call/MultiSelectWithNote"
import { resolveColorVar } from "./helpers"

const ARCHETYPE_LABELS = [
  "Specialist Depth",
  "Scale Operator",
  "Modernization",
  "Growth Hire",
  "Greenfield Builder",
  "Founding Engineer",
]

test.describe("MultiSelectWithNote — pills", () => {
  test("all 6 archetype pills render and support independent multi-select", async ({ page }) => {
    await page.goto("/judge")

    for (const label of ARCHETYPE_LABELS) {
      await expect(page.getByTestId(`multi-select-with-note-pill-${label}`)).toBeVisible()
    }

    const first = page.getByTestId("multi-select-with-note-pill-Specialist Depth")
    const second = page.getByTestId("multi-select-with-note-pill-Scale Operator")

    await expect(first).toHaveAttribute("aria-pressed", "false")
    await first.click()
    await expect(first).toHaveAttribute("aria-pressed", "true")

    await second.click()
    await expect(first).toHaveAttribute("aria-pressed", "true")
    await expect(second).toHaveAttribute("aria-pressed", "true")

    await first.click()
    await expect(first).toHaveAttribute("aria-pressed", "false")
    await expect(second).toHaveAttribute("aria-pressed", "true")
  })
})

test.describe("InputWithInlineSave — commit and checkmark behavior", () => {
  test("checkmark flips on blur, not per keystroke, and un-checks live when re-editing a committed note", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")
    const checkmark = page.getByTestId("multi-select-with-note-note-checkmark")

    await expect(checkmark).toHaveCSS("opacity", "0")

    await field.fill("Somewhere between scale operator and founding engineer")
    await expect(checkmark).toHaveCSS("opacity", "0")

    await field.blur()
    await expect(checkmark).toHaveCSS("opacity", "1")

    // Re-editing an already-committed note must un-check immediately, live —
    // not stay stale-checked until the next blur.
    await field.fill("Somewhere between scale operator and founding engineer, more")
    await expect(checkmark).toHaveCSS("opacity", "0")

    await field.blur()
    await expect(checkmark).toHaveCSS("opacity", "1")
  })

  test("checkmark background resolves to the reviewed token", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")
    const checkmark = page.getByTestId("multi-select-with-note-note-checkmark")

    await field.fill("Somewhere between scale operator and founding engineer")
    await field.blur()

    const reviewed = await resolveColorVar(page, "--reviewed")
    await expect(checkmark).toHaveCSS("background-color", reviewed)
  })

  test("field row stays a constant 36px tall and constant width regardless of filled state", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")
    const wrapper = field.locator("xpath=..")
    const row = page.getByTestId("multi-select-with-note-note-row")

    const emptyWrapperBox = await wrapper.boundingBox()
    const emptyRowBox = await row.boundingBox()
    expect(emptyWrapperBox?.height).toBeCloseTo(36, 0)

    await field.fill("Somewhere between scale operator and founding engineer")
    await field.blur()

    const filledWrapperBox = await wrapper.boundingBox()
    const filledRowBox = await row.boundingBox()
    expect(filledWrapperBox?.height).toBeCloseTo(36, 0)
    expect(filledRowBox?.width).toBeCloseTo(emptyRowBox!.width, 0)
  })

  test("long note text truncates with ellipsis instead of clipping silently", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")

    const longValue =
      "This is a deliberately long custom archetype note meant to overflow the field's visible width so the ellipsis truncation behavior actually gets exercised instead of just asserted in theory."
    await field.fill(longValue)
    await field.blur()

    await expect(field).toHaveCSS("text-overflow", "ellipsis")
    await expect(field).toHaveCSS("white-space", "nowrap")

    const isOverflowing = await field.evaluate((el) => {
      const input = el as HTMLInputElement
      return input.scrollWidth > input.clientWidth
    })
    expect(isOverflowing).toBe(true)
  })
})

test.describe("InputWithInlineSave — 140-char soft limit counter", () => {
  test("counter stays hidden below 100 chars", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")

    await field.fill("a".repeat(99))
    await expect(page.getByText("99/140")).toHaveCount(0)
  })

  test("counter appears muted-foreground from 100 chars, shifts to warning from 130 chars", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")

    const mutedForeground = await resolveColorVar(page, "--muted-foreground")
    const warning = await resolveColorVar(page, "--warning")

    await field.fill("a".repeat(100))
    const counterAt100 = page.getByText("100/140")
    await expect(counterAt100).toBeVisible()
    await expect(counterAt100).toHaveCSS("color", mutedForeground)

    await field.fill("a".repeat(129))
    await expect(page.getByText("129/140")).toHaveCSS("color", mutedForeground)

    await field.fill("a".repeat(130))
    const counterAt130 = page.getByText("130/140")
    await expect(counterAt130).toBeVisible()
    await expect(counterAt130).toHaveCSS("color", warning)
  })

  test("typing past 140 characters is not hard-blocked and stays warning-colored", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("multi-select-with-note-note-field")

    const over140 = "a".repeat(150)
    await field.fill(over140)
    await expect(field).toHaveValue(over140)

    const counter = page.getByText("150/140")
    await expect(counter).toBeVisible()

    const warning = await resolveColorVar(page, "--warning")
    await expect(counter).toHaveCSS("color", warning)
  })
})

test.describe("isMultiSelectWithNoteComplete", () => {
  test("false when both selected and note are empty", () => {
    expect(isMultiSelectWithNoteComplete({ selected: [], note: "" })).toBe(false)
  })

  test("true when only pills are selected", () => {
    expect(isMultiSelectWithNoteComplete({ selected: ["Scale Operator"], note: "" })).toBe(true)
  })

  test("true when only the note is filled", () => {
    expect(isMultiSelectWithNoteComplete({ selected: [], note: "Something unique" })).toBe(true)
  })

  test("true when both pills and note are filled", () => {
    expect(
      isMultiSelectWithNoteComplete({ selected: ["Scale Operator"], note: "Something unique" })
    ).toBe(true)
  })

  test("whitespace-only note counts as empty", () => {
    expect(isMultiSelectWithNoteComplete({ selected: [], note: "   " })).toBe(false)
  })
})

test.describe("Source-level guardrails", () => {
  test("required MVP-scope comment is present at the local commit call site", () => {
    const contents = fs.readFileSync(
      path.join(process.cwd(), "components/blind-call/InputWithInlineSave.tsx"),
      "utf-8"
    )
    expect(contents).toContain("MVP scope: this only commits to local component state")
  })

  test("no hardcoded hex colors in the new/refactored components", () => {
    const files = [
      "components/blind-call/Pill.tsx",
      "components/blind-call/InputWithInlineSave.tsx",
      "components/blind-call/MultiSelectWithNote.tsx",
    ]
    for (const file of files) {
      const contents = fs.readFileSync(path.join(process.cwd(), file), "utf-8")
      expect(contents).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })
})

test.describe("Visual states (manual comparison against Figma reference screenshots)", () => {
  test("captures empty, pills-only, note-only, and fully-filled screenshots", async ({ page }) => {
    await page.goto("/judge")
    const card = page.getByTestId("multi-select-with-note")
    const scaleOperator = page.getByTestId("multi-select-with-note-pill-Scale Operator")
    const noteField = page.getByTestId("multi-select-with-note-note-field")

    await card.screenshot({ path: "test-results/multi-select-with-note-empty.png" })

    await scaleOperator.click()
    await card.screenshot({ path: "test-results/multi-select-with-note-pills-only.png" })

    await scaleOperator.click()
    await noteField.fill("Somewhere between scale operator and founding engineer")
    await noteField.blur()
    await card.screenshot({ path: "test-results/multi-select-with-note-note-only.png" })

    await scaleOperator.click()
    await card.screenshot({ path: "test-results/multi-select-with-note-fully-filled.png" })
  })
})
