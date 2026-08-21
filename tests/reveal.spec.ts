import { expect, test } from "@playwright/test"

import {
  isRevealStageComplete,
  describeJdArchetype,
  describeCandidateArchetype,
  candidateArchetypePillLabel,
} from "@/lib/stages"
import type { RevealCaseData } from "@/lib/mock-data/case"
import { MOCK_CASE } from "@/lib/mock-data/case"
import { reachLockInterstitial } from "./helpers"

// No arguments — Reveal has no reviewer-editable state to compose, unlike
// isJDStageComplete/isFitStageComplete which take a state object.
test.describe("isRevealStageComplete", () => {
  test("always true", () => {
    expect(isRevealStageComplete()).toBe(true)
  })
})

test.describe("describeJdArchetype", () => {
  test("names ideal and couldWork archetypes", () => {
    const text = describeJdArchetype({
      ideal: "greenfield_builder",
      couldWork: ["founding_engineer", "growth_hire"],
    })
    expect(text).toContain("Greenfield Builder")
    expect(text).toContain("Founding Engineer")
    expect(text).toContain("Growth Hire")
  })

  test("handles an empty couldWork list", () => {
    const text = describeJdArchetype({ ideal: "specialist_depth", couldWork: [] })
    expect(text).toContain("Specialist Depth")
  })
})

const NO_TRANSITIONS: RevealCaseData["careerArcNote"] = { transitions: [] }
const ONE_TRANSITION: RevealCaseData["careerArcNote"] = {
  transitions: [{ from: "growth_hire", to: "founding_engineer" }],
}

test.describe("candidateArchetypePillLabel", () => {
  test("single archetype label when there are no transitions", () => {
    expect(candidateArchetypePillLabel("specialist_depth", NO_TRANSITIONS)).toBe("Specialist Depth")
  })

  test("'X → Y' label when a transition is present", () => {
    expect(candidateArchetypePillLabel("founding_engineer", ONE_TRANSITION)).toBe(
      "Growth Hire → Founding Engineer"
    )
  })

  test("uses the latest (last) transition when more than one is present", () => {
    const transitions: RevealCaseData["careerArcNote"] = {
      transitions: [
        { from: "specialist_depth", to: "growth_hire" },
        { from: "growth_hire", to: "founding_engineer" },
      ],
    }
    expect(candidateArchetypePillLabel("founding_engineer", transitions)).toBe(
      "Growth Hire → Founding Engineer"
    )
  })
})

test.describe("describeCandidateArchetype", () => {
  test("describes a current archetype when there are no transitions", () => {
    const text = describeCandidateArchetype("specialist_depth", NO_TRANSITIONS)
    expect(text).toContain("Specialist Depth")
  })

  test("describes a transition when one is present", () => {
    const text = describeCandidateArchetype("founding_engineer", ONE_TRANSITION)
    expect(text).toContain("Growth Hire")
    expect(text).toContain("Founding Engineer")
  })
})

// Forward from fit now lands on the lock interstitial (Ticket 21), not
// reveal directly — the forward tap there both locks and advances in one
// action, so reaching reveal takes one more "Next stage" click than before.
async function goToReveal(page: import("@playwright/test").Page) {
  await page.goto("/judge")
  await reachLockInterstitial(page)
  await page.getByRole("button", { name: "Next stage" }).click()
  await expect(page.locator('[data-blind-call-stage="reveal"]')).toHaveAttribute(
    "data-active",
    "true"
  )
}

test.describe("RevealStageContent", () => {
  test("renders all 5 Card-Content-Row instances in order with correct variant, pill, and content", async ({
    page,
  }) => {
    await goToReveal(page)

    const reveal = page.locator('[data-blind-call-stage="reveal"]')
    const rows = reveal.getByTestId("card-content-row")
    await expect(rows).toHaveCount(5)

    // Row 1: JD Archetype — pill
    const jdArchetypeRow = rows.nth(0)
    await expect(jdArchetypeRow.locator("p").first()).toHaveText("JD Archetype")
    await expect(jdArchetypeRow.getByTestId("pill")).toHaveText("Greenfield Builder")
    await expect(jdArchetypeRow.locator("p").last()).toContainText("Greenfield Builder")

    // Row 2: JD Real Ask — text
    const realAskRow = rows.nth(1)
    await expect(realAskRow.locator("p").first()).toHaveText("JD Real Ask")
    await expect(realAskRow.getByTestId("pill")).toHaveCount(0)
    await expect(realAskRow.locator("p").last()).toHaveText(MOCK_CASE.reveal.realAsk)

    // Row 3: Resume Archetype — pill, "X → Y" transition copy shape
    const resumeArchetypeRow = rows.nth(2)
    await expect(resumeArchetypeRow.locator("p").first()).toHaveText("Resume Archetype")
    await expect(resumeArchetypeRow.getByTestId("pill")).toHaveText("Growth Hire → Founding Engineer")

    // Row 4: Fit — pill, scenarioId label + hook
    const fitRow = rows.nth(3)
    await expect(fitRow.locator("p").first()).toHaveText("Fit")
    await expect(fitRow.getByTestId("pill")).toHaveText("Invisible fit")

    // Row 5: Fit Summary — text
    const fitSummaryRow = rows.nth(4)
    await expect(fitSummaryRow.locator("p").first()).toHaveText("Fit Summary")
    await expect(fitSummaryRow.getByTestId("pill")).toHaveCount(0)
    await expect(fitSummaryRow.locator("p").last()).toHaveText(MOCK_CASE.reveal.fitSummary)
  })

  test("NavDotStrip shows Reveal active, 4th of 6 dots", async ({ page }) => {
    await goToReveal(page)
    const dots = page.getByTestId("nav-dot-strip").locator(":scope > span")
    await expect(dots.nth(3)).toHaveAttribute("data-nav-dot-state", "current")
  })

  test("next button is enabled immediately on Reveal, no forward gate", async ({ page }) => {
    await goToReveal(page)
    await expect(page.getByRole("button", { name: "Next stage" })).toBeEnabled()
  })

  test("back button works unconditionally from Reveal", async ({ page }) => {
    await goToReveal(page)
    // One step back from reveal now lands on the lock interstitial (Ticket
    // 21), not fit directly — the interstitial occupies its own track
    // position between them. A second step reaches fit.
    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="lock"]')).toHaveAttribute(
      "data-active",
      "true"
    )
    await page.getByRole("button", { name: "Previous stage" }).click()
    await expect(page.locator('[data-blind-call-stage="fit"]')).toHaveAttribute("data-active", "true")
  })
})
