import fs from "node:fs"
import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

import { isBranchingSingleSelectComplete } from "@/components/blind-call/BranchingSingleSelect"
import { FIT_VERDICT_OPTIONS } from "@/lib/stages"
import {
  forceJDComplete,
  forceResumeComplete,
  forceFitComplete,
  resolveColorVar,
  resolveClassBackground,
} from "./helpers"

async function goToFitStage(page: Page) {
  await page.goto("/judge")
  await forceJDComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
  await forceResumeComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
}

test.describe("BranchingSingleSelect — rendering", () => {
  test("renders the title copy exactly", async ({ page }) => {
    await goToFitStage(page)
    await expect(
      page.getByText("Based on everything you've seen, what's the read here?")
    ).toBeVisible()
  })

  test("renders exactly 4 top-level radios", async ({ page }) => {
    await goToFitStage(page)
    const fitPanel = page.locator('[data-blind-call-stage="fit"]')
    await expect(fitPanel.getByRole("radio")).toHaveCount(4)
  })

  test("all 4 verdict options render with correct label/hook copy", async ({ page }) => {
    await goToFitStage(page)
    for (const option of FIT_VERDICT_OPTIONS) {
      const card = page.getByTestId(`radio-card-${option.id}`)
      await expect(card).toContainText(option.label)
      await expect(card).toContainText(option.hook)
    }
  })
})

test.describe("RadioCard — visual states", () => {
  test("unselected card resolves to muted/30 background and border token", async ({ page }) => {
    await goToFitStage(page)
    const card = page.getByTestId("radio-card-confirmed_fit")

    const mutedThirty = await resolveClassBackground(page, "bg-muted/30")
    const border = await resolveColorVar(page, "--border")

    await expect(card).toHaveCSS("background-color", mutedThirty)
    await expect(card).toHaveCSS("border-color", border)
  })

  test("selected card resolves to secondary background and primary border", async ({ page }) => {
    await goToFitStage(page)
    const card = page.getByTestId("radio-card-confirmed_fit")
    await card.click()

    const secondary = await resolveColorVar(page, "--secondary")
    const primary = await resolveColorVar(page, "--primary")

    await expect(card).toHaveCSS("background-color", secondary)
    await expect(card).toHaveCSS("border-color", primary)
  })

  test("selecting narrative_gap reveals the sub-option prompt and radiogroup", async ({ page }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-narrative_gap").click()

    await expect(page.getByText("What's missing?")).toBeVisible()
    await expect(page.getByTestId("radio-card-sub-needs_reframing")).toBeVisible()
    await expect(page.getByTestId("radio-card-sub-needs_depth")).toBeVisible()
  })

  test("selecting an option without subOptions renders no sub-option block", async ({ page }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-confirmed_fit").click()

    await expect(page.getByText("What's missing?")).toHaveCount(0)
  })

  test("sub-option label+hook render as one concatenated sentence", async ({ page }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-narrative_gap").click()

    await expect(page.getByTestId("radio-card-sub-needs_reframing")).toHaveText(
      "Needs reframing. What's there is told wrong"
    )
  })
})

test.describe("BranchingSingleSelect — selection/clearing behavior", () => {
  test("selecting a different top-level option always clears sub-selection", async ({ page }) => {
    await goToFitStage(page)

    await page.getByTestId("radio-card-narrative_gap").click()
    await page.getByTestId("radio-card-sub-needs_reframing").click()
    await expect(page.getByTestId("radio-card-sub-needs_reframing")).toHaveAttribute(
      "data-checked",
      ""
    )

    await page.getByTestId("radio-card-honest_verdict").click()

    // Conditionally MOUNTED, not just visually hidden — assert absence from
    // the DOM entirely, not just not-visible.
    await expect(page.getByTestId("radio-card-sub-needs_reframing")).toHaveCount(0)
  })

  test("re-tapping an already-selected top-level option is a no-op", async ({ page }) => {
    await goToFitStage(page)
    const card = page.getByTestId("radio-card-confirmed_fit")

    await card.click()
    await expect(card).toHaveAttribute("data-checked", "")

    await card.click()
    await expect(card).toHaveAttribute("data-checked", "")
  })

  test("re-tapping an already-selected sub-option is a no-op", async ({ page }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-narrative_gap").click()
    const sub = page.getByTestId("radio-card-sub-needs_reframing")

    await sub.click()
    await expect(sub).toHaveAttribute("data-checked", "")

    await sub.click()
    await expect(sub).toHaveAttribute("data-checked", "")
  })
})

test.describe("Keyboard arrow-nav", () => {
  test("ArrowDown moves focus and commits selection within the top-level radiogroup", async ({
    page,
  }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-confirmed_fit").focus()
    await page.keyboard.press("ArrowDown")

    const second = page.getByTestId("radio-card-invisible_expert")
    await expect(second).toBeFocused()
    await expect(second).toHaveAttribute("data-checked", "")
  })

  test("ArrowDown within the sub-option radiogroup does not affect the top-level group", async ({
    page,
  }) => {
    await goToFitStage(page)
    await page.getByTestId("radio-card-narrative_gap").click()
    await page.getByTestId("radio-card-sub-needs_reframing").focus()
    await page.keyboard.press("ArrowDown")

    const secondSub = page.getByTestId("radio-card-sub-needs_depth")
    await expect(secondSub).toBeFocused()
    await expect(secondSub).toHaveAttribute("data-checked", "")
    await expect(page.getByTestId("radio-card-narrative_gap")).toHaveAttribute(
      "data-checked",
      ""
    )
  })
})

test.describe("isBranchingSingleSelectComplete", () => {
  test("false when nothing selected", () => {
    expect(isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, {})).toBe(false)
  })

  test("true for a no-subOptions pick", () => {
    expect(
      isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, { selectedId: "confirmed_fit" })
    ).toBe(true)
  })

  test("false for a subOptions-bearing pick with no sub chosen", () => {
    expect(
      isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, { selectedId: "narrative_gap" })
    ).toBe(false)
  })

  test("true once a sub is chosen", () => {
    expect(
      isBranchingSingleSelectComplete(FIT_VERDICT_OPTIONS, {
        selectedId: "narrative_gap",
        selectedSubId: "needs_reframing",
      })
    ).toBe(true)
  })
})

test.describe("Source-level guardrails", () => {
  test("no hardcoded hex colors in the new Fit files", () => {
    const files = [
      "components/blind-call/RadioCard.tsx",
      "components/blind-call/BranchingSingleSelect.tsx",
      "components/blind-call/FitStageContent.tsx",
      "lib/stages/fit.ts",
    ]
    for (const file of files) {
      const contents = fs.readFileSync(path.join(process.cwd(), file), "utf-8")
      expect(contents).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })
})

test.describe("Fit stage integration", () => {
  test("fit completeness requires a top-level selection", async ({ page }) => {
    await goToFitStage(page)
    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeDisabled()

    await page.getByTestId("radio-card-confirmed_fit").click()
    await expect(next).toBeEnabled()
  })

  test("fit completeness with narrative_gap requires a sub-selection too", async ({ page }) => {
    await goToFitStage(page)
    const next = page.getByRole("button", { name: "Next stage" })

    await page.getByTestId("radio-card-narrative_gap").click()
    await expect(next).toBeDisabled()

    await page.getByTestId("radio-card-sub-needs_reframing").click()
    await expect(next).toBeEnabled()
  })

  test("forceFitComplete helper reaches a complete state", async ({ page }) => {
    await goToFitStage(page)
    await forceFitComplete(page)
    await expect(page.getByRole("button", { name: "Next stage" })).toBeEnabled()
  })

  test("HeaderNodeInfo renders hardcoded Fit badge/label", async ({ page }) => {
    await goToFitStage(page)
    const header = page.locator('[data-blind-call-stage="fit"]').getByTestId("header-node-info")
    await expect(header).toContainText("Fit")
    await expect(header).toContainText("Match the Fit")
  })
})
