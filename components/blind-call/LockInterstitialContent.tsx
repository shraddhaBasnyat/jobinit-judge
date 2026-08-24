import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"
import { Button } from "@/components/ui/button"

export type LockInterstitialContentProps = {
  locked: boolean
  // Data side effect only (setLocked(true), snapshot revised) — the
  // append+advance to "reveal" is automatic once CarouselShell's own
  // prefix-scan walk sees isComplete() flip via `locked`, driven by
  // autoAdvanceOnReveal. This callback never touches navigation itself.
  onReadyToLock: () => void
}

export function LockInterstitialContent({ locked, onReadyToLock }: LockInterstitialContentProps) {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel="Lock" label="Lock your answers" />
      <p className="text-sm text-muted-foreground">
        {locked
          ? "Your JD, resume, and fit answers are locked. You can still revise them later, but they're recorded as-is for comparison against the reveal."
          : "Your JD, resume, and fit answers will be locked once you continue. You can still revise them later, but they'll be recorded as-is for comparison against the reveal."}
      </p>
      {locked ? (
        <p className="text-xs text-muted-foreground" data-testid="lock-interstitial-content-post-lock-note">
          Answers are already locked
        </p>
      ) : (
        <Button
          type="button"
          onClick={onReadyToLock}
          data-testid="lock-interstitial-content-commit"
        >
          I&apos;m ready to lock
        </Button>
      )}
    </div>
  )
}
