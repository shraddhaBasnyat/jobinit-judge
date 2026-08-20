"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { animate, motion, useMotionValue, type PanInfo } from "motion/react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { NavDotStrip } from "@/components/blind-call/NavDotStrip"
import { CardPrevNext } from "@/components/blind-call/CardPrevNext"
import { BLOCKED_STAGE_TOAST_ID, TOAST_TIMEOUT_MS } from "@/components/blind-call/Toast"

export type Stage = {
  id: string
  label: string
  isComplete: () => boolean
  // Optional stage-specific copy for the blocked-forward-nav toast; falls
  // back to the generic default below when omitted or returning undefined.
  // Keeps CarouselShell opaque to *why* a stage is blocked — it only ever
  // asks for a string, same as it only ever asks isComplete() for a bool.
  blockedMessage?: () => string | undefined
  content: ReactNode
}

export type CarouselShellProps = {
  stages: Stage[]
  currentStageId: string
  onStageChange?: (id: string) => void
}

const PEEK_THRESHOLD_PX = 56
const COMMIT_VELOCITY = 500
const REST_SPRING = { type: "spring", stiffness: 300, damping: 32 } as const
const REJECT_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const

export function CarouselShell({ stages, currentStageId, onStageChange }: CarouselShellProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const x = useMotionValue(0)
  const toastManager = ToastPrimitive.useToastManager()

  const currentIndex = stages.findIndex((s) => s.id === currentStageId)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setCardWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Workaround, not a root-cause fix, for a mobile-viewport-Chromium-only
  // bug (Chrome DevTools device toolbar / Playwright isMobile+hasTouch;
  // never reproduces on desktop Chromium): tapping a plain <button> pill or
  // a Base UI Radio inside this track snaps window.scrollY to 0 whenever
  // the track carries an active CSS `transform` (any stage past index 0 —
  // "jd" at index 0 is never affected, since `x` only renders as
  // `translateX(0)`/"none" there). Guards by tracking a "stable" scrollY,
  // updated only when a `scroll` event was just preceded by a genuine
  // touchmove/wheel; any other scroll while focus sits inside this track is
  // reverted, regardless of which browser-internal mechanism caused it.
  // Only attached while `currentIndex > 0`, so "jd" never pays for this.
  //
  // Covers buttons and radios (verified via mobile-emulation reproduction:
  // archetype pills, both StatementAssess radio rows, plus the drag/
  // rubber-band reject-spring gesture from Ticket #1, confirmed unaffected
  // since it's a transform animation that never touches window.scrollY).
  // Does NOT cover the archetype note field (InputWithInlineSave) — that
  // field's jump needed a separate, narrower fix local to the component
  // itself; see its own comment for why this general approach didn't
  // extend to it.
  //
  // Caveat that matters going forward: this guard is the only thing in the
  // codebase that calls scrollTo/scrollBy/scrollIntoView today (confirmed
  // via grep), so there's nothing legitimate to fight — but a future
  // feature that intentionally scrolls while focus is inside this track
  // (e.g. scrolling a validation error into view) would get reverted by
  // this too.
  useEffect(() => {
    const el = containerRef.current
    if (!el || currentIndex === 0) return

    let stableScrollY = window.scrollY
    let gestureActiveUntil = 0
    const GESTURE_WINDOW_MS = 150

    function markGestureActive() {
      gestureActiveUntil = Date.now() + GESTURE_WINDOW_MS
    }

    function handleScroll() {
      const focusInsideTrack = Boolean(
        document.activeElement && containerRef.current?.contains(document.activeElement)
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
  }, [currentIndex])

  useEffect(() => {
    if (!cardWidth) return
    animate(x, -currentIndex * cardWidth, REST_SPRING)
  }, [currentIndex, cardWidth, x])

  const settle = useCallback(() => {
    animate(x, -currentIndex * cardWidth, REJECT_SPRING)
  }, [x, currentIndex, cardWidth])

  // Only one blocked-stage toast may be visible at a time: an existing id
  // would have its dismiss timer refreshed by toastManager.add(), so a
  // repeat attempt while one is already showing is skipped entirely.
  const fireBlockedToast = useCallback(() => {
    const alreadyShowing = toastManager.toasts.some((t) => t.id === BLOCKED_STAGE_TOAST_ID)
    if (alreadyShowing) return
    const title = stages[currentIndex]?.blockedMessage?.() ?? "A few more answers to go"
    toastManager.add({
      id: BLOCKED_STAGE_TOAST_ID,
      title,
      timeout: TOAST_TIMEOUT_MS,
    })
  }, [toastManager, stages, currentIndex])

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const offset = info.offset.x
      const velocity = info.velocity.x
      const pastThreshold =
        Math.abs(offset) > PEEK_THRESHOLD_PX || Math.abs(velocity) > COMMIT_VELOCITY

      if (!pastThreshold) {
        settle()
        return
      }

      if (offset < 0) {
        // Dragged left = forward, gated by the current stage's isComplete().
        const next = stages[currentIndex + 1]
        if (!next) {
          settle()
          return
        }
        if (stages[currentIndex].isComplete()) {
          onStageChange?.(next.id)
        } else {
          settle()
          fireBlockedToast()
        }
      } else {
        // Dragged right = backward, always unconditional — never gated.
        const prev = stages[currentIndex - 1]
        if (!prev) {
          settle()
          return
        }
        onStageChange?.(prev.id)
      }
    },
    [stages, currentIndex, onStageChange, settle, fireBlockedToast]
  )

  const commitForward = useCallback(() => {
    const next = stages[currentIndex + 1]
    if (next) onStageChange?.(next.id)
  }, [stages, currentIndex, onStageChange])

  const commitBackward = useCallback(() => {
    const prev = stages[currentIndex - 1]
    if (prev) onStageChange?.(prev.id)
  }, [stages, currentIndex, onStageChange])

  const current = stages[currentIndex]
  const nextDisabled = !current?.isComplete()
  const prevDisabled = currentIndex === 0

  // Framer Motion's drag="x" listens for pointerdown on this track's own DOM
  // node — it doesn't distinguish "the user meant to swipe" from "the user
  // clicked a button/radio inside stage content and their mouse drifted a
  // few pixels mid-click." Any interactive descendant can accidentally
  // trigger a full stage-navigation swipe this way. This capture-phase
  // handler sits on each stage's wrapper div (a descendant of the track,
  // ancestor of stage content) and stops propagation before the event ever
  // reaches the track, so Framer Motion's own (bubble-phase) pointerdown
  // listener never fires — without disabling genuine swipes, which always
  // start on non-interactive panel content and never hit this branch.
  // Verified directly: reproduced the false-navigation with real pointer
  // sequences (mousedown + a few px of horizontal drift + mouseup) on both
  // StatementAssess's existing radio and RadioCard, then confirmed this
  // guard eliminates it while leaving normal clicks and genuine
  // swipe-to-navigate unaffected.
  //
  // Caveat that matters going forward: the selector below is a fixed,
  // closed list. A future interactive control built without a matching
  // tag/role — e.g. a custom <div>-based toggle with just an onClick, no
  // role="button" — falls outside it silently, and this exact bug
  // resurfaces for that control with no error to signal it. Either extend
  // this selector when adding such a control, or give it its own
  // onPointerDown={(e) => e.stopPropagation()}.
  const stopDragOnInteractive = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, [role="radio"], [role="checkbox"], a[href], input, textarea, select')) {
      e.stopPropagation()
    }
  }, [])

  return (
    <div className="flex w-full flex-col gap-4">
      <NavDotStrip stages={stages} currentStageId={currentStageId} />
      <div ref={containerRef} className="w-full overflow-hidden">
        <motion.div
          data-testid="carousel-track"
          className="flex flex-row"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -cardWidth * 1.2, right: cardWidth * 1.2 }}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {stages.map((stage) => {
            const isActive = stage.id === currentStageId
            return (
              <div
                key={stage.id}
                data-blind-call-stage={stage.id}
                // Marker attribute only — nothing reads data-active as a CSS selector.
                data-active={isActive || undefined}
                aria-hidden={!isActive}
                inert={!isActive}
                onPointerDownCapture={stopDragOnInteractive}
                className="w-full shrink-0"
              >
                {stage.content}
              </div>
            )
          })}
        </motion.div>
      </div>
      <CardPrevNext
        onPrev={commitBackward}
        onNext={commitForward}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
      />
    </div>
  )
}
