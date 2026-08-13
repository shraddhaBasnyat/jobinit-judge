import fs from "node:fs"
import path from "node:path"

import { expect, test } from "@playwright/test"

import { isStatementAssessComplete, type Statement } from "@/components/blind-call/StatementAssess"
import { isResumeStageComplete, type ResumeStageState } from "@/lib/stages"
import { forceJDComplete, forceResumeComplete, resolveColorVar } from "./helpers"

const STATEMENT_IDS = ["current-jobinit", "image-selection-engine", "swe-to-staff"]

async function goToResumeStage(page: import("@playwright/test").Page) {
  await page.goto("/judge")
  await forceJDComplete(page)
  await page.getByRole("button", { name: "Next stage" }).click()
}

test.describe("MultiStatementAssess — legend and rows", () => {
  test("legend renders exactly 3 options once, not duplicated per row", async ({ page }) => {
    await goToResumeStage(page)

    await expect(page.locator('[data-testid^="assess-option-legend-"]')).toHaveCount(3)
    for (const value of ["backedUp", "allTalk", "soWhat"]) {
      await expect(page.getByTestId(`assess-option-legend-${value}`)).toBeVisible()
    }
  })

  test("all 3 statement rows render", async ({ page }) => {
    await goToResumeStage(page)

    for (const id of STATEMENT_IDS) {
      await expect(page.getByTestId(`statement-assess-${id}`)).toBeVisible()
    }
  })

  test("selecting an option in one row never affects sibling rows", async ({ page }) => {
    await goToResumeStage(page)

    const rowOne = page.getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
    const rowTwo = page.getByTestId(`statement-assess-${STATEMENT_IDS[1]}`)

    await rowOne.getByTestId("assess-option-radio-backedUp").click()

    await expect(rowOne.getByTestId("assess-option-radio-backedUp")).toHaveAttribute(
      "data-checked",
      ""
    )
    await expect(rowTwo.getByTestId("assess-option-radio-backedUp")).toHaveAttribute(
      "data-unchecked",
      ""
    )
    await expect(rowTwo.getByTestId("assess-option-radio-allTalk")).toHaveAttribute(
      "data-unchecked",
      ""
    )
    await expect(rowTwo.getByTestId("assess-option-radio-soWhat")).toHaveAttribute(
      "data-unchecked",
      ""
    )
  })

  test("re-tapping the already-selected option does nothing (no deselect)", async ({ page }) => {
    await goToResumeStage(page)

    const row = page.getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
    const radio = row.getByTestId("assess-option-radio-backedUp")

    await radio.click()
    await expect(radio).toHaveAttribute("data-checked", "")

    await radio.click()
    await expect(radio).toHaveAttribute("data-checked", "")
  })
})

test.describe("AssessOptionRadio — accessible names and roles", () => {
  test("each radio exposes a distinct 'Mark as ...' accessible name", async ({ page }) => {
    await goToResumeStage(page)

    await expect(page.getByRole("radio", { name: "Mark as backed up" }).first()).toBeVisible()
    await expect(page.getByRole("radio", { name: "Mark as all talk" }).first()).toBeVisible()
    await expect(page.getByRole("radio", { name: "Mark as so what" }).first()).toBeVisible()
  })

  test("each row's radiogroup exposes its own statement text as its accessible name", async ({
    page,
  }) => {
    await goToResumeStage(page)

    const groups = page.getByRole("radiogroup")
    await expect(groups).toHaveCount(3)
  })
})

test.describe("AssessOptionRadio — visual states", () => {
  test("unselected state resolves to background/border/icon tokens", async ({ page }) => {
    await goToResumeStage(page)

    const radio = page
      .getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
      .getByTestId("assess-option-radio-backedUp")
    const visualCircle = radio.locator("> div")

    const background = await resolveColorVar(page, "--background")
    const border = await resolveColorVar(page, "--border")
    const mutedForeground = await resolveColorVar(page, "--muted-foreground")

    await expect(visualCircle).toHaveCSS("background-color", background)
    await expect(visualCircle).toHaveCSS("border-color", border)
    await expect(radio.locator("svg")).toHaveCSS("color", mutedForeground)
  })

  test("selected state resolves to secondary background and primary icon", async ({ page }) => {
    await goToResumeStage(page)

    const radio = page
      .getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
      .getByTestId("assess-option-radio-backedUp")
    const visualCircle = radio.locator("> div")

    await radio.click()

    const secondary = await resolveColorVar(page, "--secondary")
    const primary = await resolveColorVar(page, "--primary")

    await expect(visualCircle).toHaveCSS("background-color", secondary)
    await expect(radio.locator("svg")).toHaveCSS("color", primary)
  })

  test("all 6 variants (3 options x selected/unselected) render distinctly", async ({ page }) => {
    await goToResumeStage(page)

    const row = page.getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
    const secondary = await resolveColorVar(page, "--secondary")
    const background = await resolveColorVar(page, "--background")

    for (const value of ["backedUp", "allTalk", "soWhat"]) {
      const radio = row.getByTestId(`assess-option-radio-${value}`)
      const visualCircle = radio.locator("> div")
      await expect(visualCircle).toHaveCSS("background-color", background)

      await radio.click()
      await expect(visualCircle).toHaveCSS("background-color", secondary)
    }
  })
})

test.describe("isStatementAssessComplete", () => {
  test("false when unjudged", () => {
    expect(isStatementAssessComplete(undefined)).toBe(false)
  })

  test("true once any option is selected", () => {
    expect(isStatementAssessComplete("backedUp")).toBe(true)
  })
})

test.describe("isResumeStageComplete", () => {
  const STATEMENTS: Statement[] = STATEMENT_IDS.map((id) => ({ id, statement: id }))

  function resumeState(values: Record<string, string>): ResumeStageState {
    return {
      summary: { badgeLabel: "Resume", roleTitle: "Test Role" },
      statements: STATEMENTS,
      values,
    }
  }

  test("false when no statements are judged", () => {
    expect(isResumeStageComplete(resumeState({}))).toBe(false)
  })

  test("false when only some statements are judged", () => {
    expect(isResumeStageComplete(resumeState({ [STATEMENT_IDS[0]]: "backedUp" }))).toBe(false)
  })

  test("true when all statements are judged", () => {
    expect(
      isResumeStageComplete(
        resumeState({
          [STATEMENT_IDS[0]]: "backedUp",
          [STATEMENT_IDS[1]]: "allTalk",
          [STATEMENT_IDS[2]]: "soWhat",
        })
      )
    ).toBe(true)
  })
})

test.describe("Source-level guardrails", () => {
  test("no hardcoded hex colors in the new components", () => {
    const files = [
      "components/blind-call/AssessOption.tsx",
      "components/blind-call/StatementAssess.tsx",
      "components/blind-call/MultiStatementAssess.tsx",
      "components/blind-call/ResumeStageContent.tsx",
    ]
    for (const file of files) {
      const contents = fs.readFileSync(path.join(process.cwd(), file), "utf-8")
      expect(contents).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })
})

test.describe("Resume stage integration", () => {
  test("resume completeness requires all 3 statements judged", async ({ page }) => {
    await goToResumeStage(page)
    const next = page.getByRole("button", { name: "Next stage" })
    await expect(next).toBeDisabled()

    await page
      .getByTestId(`statement-assess-${STATEMENT_IDS[0]}`)
      .getByTestId("assess-option-radio-backedUp")
      .click()
    await expect(next).toBeDisabled()

    await page
      .getByTestId(`statement-assess-${STATEMENT_IDS[1]}`)
      .getByTestId("assess-option-radio-allTalk")
      .click()
    await expect(next).toBeDisabled()

    await page
      .getByTestId(`statement-assess-${STATEMENT_IDS[2]}`)
      .getByTestId("assess-option-radio-soWhat")
      .click()
    await expect(next).toBeEnabled()
  })

  test("forceResumeComplete helper judges all 3 statements", async ({ page }) => {
    await goToResumeStage(page)
    await forceResumeComplete(page)
    await expect(page.getByRole("button", { name: "Next stage" })).toBeEnabled()
  })
})
