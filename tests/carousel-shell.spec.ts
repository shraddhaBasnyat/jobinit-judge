import { expect, test } from "@playwright/test"

import { computeMountedPrefixLength, type MountableStage } from "@/lib/carousel-shell"

function stage(isComplete: boolean): MountableStage {
  return { isComplete: () => isComplete }
}

test.describe("computeMountedPrefixLength", () => {
  test("empty array mounts nothing", () => {
    expect(computeMountedPrefixLength([])).toBe(0)
  })

  test("single stage always mounts, regardless of its own completion", () => {
    expect(computeMountedPrefixLength([stage(false)])).toBe(1)
    expect(computeMountedPrefixLength([stage(true)])).toBe(1)
  })

  test("mounts the whole array when every stage but the last is complete", () => {
    expect(computeMountedPrefixLength([stage(true), stage(true), stage(false)])).toBe(3)
  })

  test("stops at the first incomplete stage — a later stage's own completion never extends the mounted set", () => {
    expect(computeMountedPrefixLength([stage(true), stage(false), stage(true)])).toBe(2)
  })

  test("first stage incomplete mounts only stage 0", () => {
    expect(computeMountedPrefixLength([stage(false), stage(true), stage(true)])).toBe(1)
  })

  // The specific semantic this function exists to guarantee: an
  // out-of-order true (a later stage reporting complete while an earlier
  // one doesn't) must not produce a non-contiguous mounted set the way
  // stages.filter(s => s.isComplete()) would. This directly distinguishes
  // the prefix-scan walk from a filter.
  test("an out-of-order later true does not get included ahead of an earlier false", () => {
    const stages = [stage(true), stage(false), stage(true), stage(true)]
    const naiveFilterCount = stages.filter((s) => s.isComplete()).length
    expect(naiveFilterCount).toBe(3) // what a (wrong) .filter() would produce
    expect(computeMountedPrefixLength(stages)).toBe(2) // the correct prefix
  })
})
