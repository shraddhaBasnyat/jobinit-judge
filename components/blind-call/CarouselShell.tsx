"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import useEmblaCarousel from "embla-carousel-react"

import { NavDotStrip } from "@/components/blind-call/NavDotStrip"
import { CardPrevNext } from "@/components/blind-call/CardPrevNext"
import { computeMountedPrefixLength } from "@/lib/carousel-shell"

export type Stage = {
  id: string
  label: string
  isComplete: () => boolean
  content: ReactNode
  // false excludes this stage from NavDotStrip's dots — used for the lock
  // interstitial, which is a real, reachable track position (mounted into
  // Embla's DOM like any other stage) but not part of the reviewer-facing
  // six-stage journey display. Defaults to true.
  navDot?: boolean
  // true means: the moment this stage transitions from not-mounted to
  // mounted, CarouselShell automatically scrolls to it (the lock
  // interstitial's "I'm ready to lock" and Revise's "I commit to this, I'm
  // done" buttons rely on this — see the auto-advance section below).
  // Absent/false means becoming mounted only unlocks forward nav to it,
  // same as jd/resume/fit/reveal today — the reviewer still swipes/taps
  // there themselves.
  autoAdvanceOnReveal?: boolean
}

export type CarouselShellProps = {
  stages: Stage[]
  // Pure observer — CarouselShell owns position internally via Embla, this
  // never feeds a position back in. page.tsx uses it only to know which
  // stage is active (e.g. ReviseStageContent's remount-on-leave key).
  onStageChange?: (id: string) => void
}

const INTERACTIVE_SELECTOR = 'button, [role="radio"], [role="checkbox"], a[href], input, textarea, select'

export function CarouselShell({ stages, onStageChange }: CarouselShellProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    // Migrated from the old capture-phase stopDragOnInteractive listener —
    // same selector list, same reasoning (a click on interactive stage
    // content whose pointer drifts a few px mid-click must never engage a
    // swipe). Returning false here skips drag-handler engagement for the
    // whole gesture before any movement is tracked, at pointerdown time —
    // functionally identical to the old guard, just centralized into one
    // predicate instead of a per-stage-wrapper listener.
    watchDrag: (_emblaApi, evt) => {
      const target = evt.target as HTMLElement
      return !target.closest(INTERACTIVE_SELECTOR)
    },
  })

  // Embla's selectedScrollSnap()/canScrollPrev()/canScrollNext() are an
  // external mutable store, not React state — useSyncExternalStore is the
  // idiomatic way to read+subscribe to that without ever calling setState
  // synchronously inside an effect just to seed an initial value (this
  // repo's lint config enforces react-hooks/set-state-in-effect as an
  // error, not a style preference).
  const subscribeToEmbla = useCallback(
    (onStoreChange: () => void) => {
      if (!emblaApi) return () => {}
      emblaApi.on("select", onStoreChange)
      emblaApi.on("reInit", onStoreChange)
      return () => {
        emblaApi.off("select", onStoreChange)
        emblaApi.off("reInit", onStoreChange)
      }
    },
    [emblaApi]
  )
  const selectedIndex = useSyncExternalStore(
    subscribeToEmbla,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0
  )
  const canScrollPrev = useSyncExternalStore(
    subscribeToEmbla,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false
  )
  const canScrollNext = useSyncExternalStore(
    subscribeToEmbla,
    () => emblaApi?.canScrollNext() ?? false,
    () => false
  )

  const mountedCount = computeMountedPrefixLength(stages)
  const mountedStages = stages.slice(0, mountedCount)
  const activeStage = mountedStages[selectedIndex]

  // NavDotStrip's own subset — a pure structural filter, unconditioned by
  // ANY runtime state, not even completion. Always the same entries from
  // the very first render, independent of how much is currently mounted
  // into Embla's track below. This is a DIFFERENT question than "what's
  // mounted" (mountedCount/mountedStages above) — don't collapse the two
  // into one filter. A stage can be mounted-but-dotless (the lock
  // interstitial) or dotted-but-not-yet-mounted (resume, before jd
  // completes) at the same time.
  const navDotStages = stages.filter((s) => s.navDot !== false)

  // The stage NavDotStrip should highlight as current. Usually just
  // activeStage.id — but if the reviewer is currently parked on a
  // navDot:false stage (the lock interstitial), NavDotStrip's own findIndex
  // would return -1 for that id (it's excluded from navDotStages), so walk
  // backward to the nearest preceding navDot-eligible stage instead. This
  // generalizes the old afterStageId substitution to any navDot:false
  // stage, not just the lock interstitial specifically.
  let navDotCurrentId = activeStage?.id
  if (activeStage && activeStage.navDot === false) {
    for (let i = selectedIndex; i >= 0; i--) {
      if (stages[i].navDot !== false) {
        navDotCurrentId = stages[i].id
        break
      }
    }
  }

  // Auto-advance, fully internal to CarouselShell, mechanism unchanged from
  // what was verified empirically — a ref armed synchronously, consumed
  // only inside Embla's own 'reInit' listener — only relocated from an
  // external click handler to here.
  //
  // Arming happens in a layout effect (not read/written during render,
  // which React documents as an anti-pattern for refs) comparing this
  // render's mountedCount against a ref holding the previous render's
  // value. Because that guard ref is updated inside the same effect
  // invocation that reads it, this is self-correcting under React 18
  // Strict Mode's dev-only double-invoke: a second invocation of this
  // exact effect body sees "no change" (the guard ref was already advanced
  // by the first invocation) and skips re-arming — verified directly with
  // a dedicated test tracing the real event log, not assumed safe from this
  // reasoning alone (see tests/carousel-shell-arming.spec.ts).
  const pendingAdvanceRef = useRef<number | null>(null)
  const prevMountedCountRef = useRef(mountedCount)
  // Real DOM handle for the mobile-scroll-fix effect below — emblaRef
  // itself is a callback ref, not a RefObject, so this is merged with it
  // on the viewport div rather than trying to read emblaRef.current.
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const prev = prevMountedCountRef.current
    if (mountedCount > prev) {
      for (let i = prev; i < mountedCount; i++) {
        if (stages[i].autoAdvanceOnReveal) {
          pendingAdvanceRef.current = i
          break
        }
      }
    }
    prevMountedCountRef.current = mountedCount
  })

  // Pure observer callback — reports the active stage id upward whenever it
  // changes. Calling a plain external callback (not React setState) from an
  // effect is the sanctioned use case the lint rule is built for, unlike
  // the seeding problem useSyncExternalStore solved above.
  const activeStageId = activeStage?.id
  useEffect(() => {
    if (activeStageId) onStageChange?.(activeStageId)
  }, [activeStageId, onStageChange])

  // Consumes the auto-advance ref armed by the layout effect below — the
  // one piece of real imperative work (telling Embla to scroll) that
  // belongs in an effect, only ever triggered by Embla's own 'reInit'.
  useEffect(() => {
    if (!emblaApi) return
    function onReInit() {
      if (pendingAdvanceRef.current !== null) {
        const target = pendingAdvanceRef.current
        pendingAdvanceRef.current = null
        // console.debug, not a UI-visible effect — exists so
        // tests/carousel-shell-arming.spec.ts can assert this fires exactly
        // once per genuine transition (a double-arm to the same target
        // produces no visible symptom otherwise, since scrollTo to where
        // you're already heading is a no-op).
        console.debug("carousel-shell:auto-advance", target)
        emblaApi!.scrollTo(target)
      }
    }
    emblaApi.on("reInit", onReInit)
    return () => {
      emblaApi.off("reInit", onReInit)
    }
  }, [emblaApi])

  // Workaround, not a root-cause fix, for a mobile-viewport-Chromium-only
  // bug (Chrome DevTools device toolbar / Playwright isMobile+hasTouch;
  // never reproduces on desktop Chromium) — re-verified directly against
  // this rebuilt CarouselShell (Pixel 7 emulation via Playwright, see
  // tests/mobile-scroll-fix.spec.ts), not assumed resolved or assumed
  // still-needed as-is:
  // - The bug reproduces identically under Embla's translate3d-based
  //   positioning, the same class of precondition as the original
  //   spring-animated transform (a transform on the track's ancestor while
  //   focus lands inside it) — still needed, kept.
  // - Ported forward essentially unchanged, EXCEPT it needed a real fix
  //   during this migration: emblaRef is a callback ref, not a RefObject,
  //   so the original cast-based port never actually acquired a DOM node
  //   and silently never attached at all. Now merged with its own
  //   viewportRef below instead.
  // - New finding, outside the bug's original documented scope: for a pure
  //   touch tap (Playwright .tap(), not .click()), the browser's scroll
  //   reset can fire before document.activeElement reflects the new focus,
  //   which this guard's focusInsideTrack check misses — the correction
  //   only reliably fires for .click()-style interaction (matching both
  //   this suite's own convention and the original bug's most plausible
  //   repro shape). Documented, not fixed here — no baseline exists to
  //   confirm whether the old Framer Motion implementation handled true
  //   touch-tap event ordering any better, so this isn't a regression to
  //   this migration specifically, just a gap this pass surfaced.
  // Only attached while selectedIndex > 0, so "jd" never pays for this.
  useEffect(() => {
    if (!viewportRef.current || selectedIndex === 0) return
    const containerEl = viewportRef.current

    let stableScrollY = window.scrollY
    let gestureActiveUntil = 0
    const GESTURE_WINDOW_MS = 150

    function markGestureActive() {
      gestureActiveUntil = Date.now() + GESTURE_WINDOW_MS
    }

    function handleScroll() {
      const focusInsideTrack = Boolean(
        document.activeElement && containerEl.contains(document.activeElement)
      )
      const scrolledByGesture = Date.now() <= gestureActiveUntil

      if (scrolledByGesture || !focusInsideTrack) {
        stableScrollY = window.scrollY
        return
      }
      window.scrollTo(0, stableScrollY)
    }

    window.addEventListener("touchmove", markGestureActive, { passive: true })
    window.addEventListener("wheel", markGestureActive, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("touchmove", markGestureActive)
      window.removeEventListener("wheel", markGestureActive)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [selectedIndex])

  return (
    <div className="flex w-full flex-col gap-4">
      <NavDotStrip stages={navDotStages} currentStageId={navDotCurrentId ?? ""} />
      <div
        ref={(node) => {
          emblaRef(node)
          viewportRef.current = node
        }}
        data-testid="carousel-viewport"
        className="w-full overflow-hidden"
      >
        <div data-testid="carousel-track" className="flex flex-row">
          {mountedStages.map((stage, i) => {
            const isActive = i === selectedIndex
            return (
              <div
                key={stage.id}
                data-blind-call-stage={stage.id}
                data-active={isActive || undefined}
                aria-hidden={!isActive}
                inert={!isActive}
                className="w-full shrink-0"
              >
                {stage.content}
              </div>
            )
          })}
        </div>
      </div>
      <CardPrevNext
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
        prevDisabled={!canScrollPrev}
        nextDisabled={!canScrollNext}
      />
    </div>
  )
}
