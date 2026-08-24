export type MountableStage = { isComplete: () => boolean }

// CarouselShell's own algorithm for deciding how much of `stages` is
// currently mounted into Embla's real DOM track — a strict, monotonic
// prefix scan, not a filter. stage[0] is always mounted; stage[i] (i>0) is
// mounted iff stage[i-1] is mounted AND stage[i-1].isComplete() is true,
// walked left-to-right, stopping at the first false.
//
// This must NOT be written as stages.filter(s => s.isComplete()) (or
// equivalent): a filter would keep any stage whose isComplete() happens to
// return true, wherever it sits, and could produce a non-contiguous mounted
// set if some later stage's isComplete() returned true while an earlier one
// was still false — shouldn't be possible given each stage's completion is
// self-contained, but isComplete() now feeds a sequential scan that decides
// what's mounted, not just an isolated per-transition gate like before this
// redesign, so the walk's exact semantics are load-bearing and stated here
// explicitly rather than left implicit.
export function computeMountedPrefixLength(stages: readonly MountableStage[]): number {
  if (stages.length === 0) return 0
  let mountedCount = 1
  for (let i = 0; i < stages.length - 1; i++) {
    if (!stages[i].isComplete()) break
    mountedCount++
  }
  return mountedCount
}
