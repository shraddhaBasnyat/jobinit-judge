import { expect, test } from "@playwright/test"

test.describe("InputWithButton", () => {
  test("renders title as its own text directly above the field row", async ({ page }) => {
    await page.goto("/judge")
    const root = page.getByTestId("input-with-button")
    const title = root.locator("p").first()

    await expect(title).toHaveText(
      "Underneath the requirements list, what's the real problem this role exists to solve?"
    )

    const titleBox = await title.boundingBox()
    const fieldBox = await page.getByTestId("input-with-button-field").boundingBox()
    expect(titleBox?.y).toBeLessThan(fieldBox?.y ?? 0)
  })

  test("TextField and the Add button render as row-level siblings, not nested", async ({
    page,
  }) => {
    await page.goto("/judge")

    const shareParent = await page.evaluate(
      ({ fieldTestId, addTestId }) => {
        const fieldEl = document.querySelector(`[data-testid="${fieldTestId}"]`)
        const addEl = document.querySelector(`[data-testid="${addTestId}"]`)
        if (!fieldEl || !addEl) return false
        const fieldWrapper = fieldEl.parentElement
        return (
          fieldWrapper?.parentElement === addEl.parentElement &&
          !fieldWrapper?.contains(addEl) &&
          !addEl.contains(fieldWrapper)
        )
      },
      { fieldTestId: "input-with-button-field", addTestId: "input-with-button-add" }
    )
    expect(shareParent).toBe(true)
  })

  test("Add is disabled while empty and enables once text is typed", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const addButton = page.getByTestId("input-with-button-add")

    await expect(addButton).toBeDisabled()
    await expect(addButton).toHaveAttribute("aria-disabled", "true")

    await field.fill("A real answer")
    await expect(addButton).toBeEnabled()

    await field.fill("")
    await expect(addButton).toBeDisabled()
  })

  test("tapping Add commits the value without clearing the field", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const addButton = page.getByTestId("input-with-button-add")
    const next = page.getByRole("button", { name: "Next stage" })

    // Scoped to the jd panel — resume also renders a MultiSelectWithNote
    // instance now, so an unscoped pill testid is ambiguous.
    await page
      .locator('[data-blind-call-stage="jd"]')
      .getByTestId("multi-select-with-note-pill-Specialist Depth")
      .click()
    await expect(next).toBeDisabled()

    await field.fill("The real ask")
    await expect(next).toBeDisabled()
    await addButton.click()

    await expect(next).toBeEnabled()
    await expect(field).toHaveValue("The real ask")
  })

  test("typing without tapping Add does not flip stage completion", async ({ page }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const next = page.getByRole("button", { name: "Next stage" })

    // Scoped to the jd panel — resume also renders a MultiSelectWithNote
    // instance now, so an unscoped pill testid is ambiguous.
    await page
      .locator('[data-blind-call-stage="jd"]')
      .getByTestId("multi-select-with-note-pill-Specialist Depth")
      .click()
    await field.fill("Draft text sitting in the field")
    await expect(next).toBeDisabled()
  })

  test("Add re-disables immediately after a successful commit, since the draft still matches", async ({
    page,
  }) => {
    await page.goto("/judge")
    const field = page.getByTestId("input-with-button-field")
    const addButton = page.getByTestId("input-with-button-add")

    await field.fill("The real ask")
    await expect(addButton).toBeEnabled()
    await addButton.click()

    // Add means "there's something new to add" — right after a commit the
    // draft still equals what was just added, so the button must go back to
    // disabled rather than staying enabled just because there's text.
    await expect(addButton).toBeDisabled()
    await expect(addButton).toHaveAttribute("aria-disabled", "true")

    await field.fill("The real ask")
    await expect(addButton).toBeDisabled()

    await field.fill("A different answer")
    await expect(addButton).toBeEnabled()
  })
})
