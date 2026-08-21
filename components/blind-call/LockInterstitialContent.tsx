import { HeaderNodeInfo } from "@/components/blind-call/HeaderNodeInfo"

export type LockInterstitialContentProps = {
  locked: boolean
}

export function LockInterstitialContent({ locked }: LockInterstitialContentProps) {
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <HeaderNodeInfo badgeLabel="Lock" label="Lock your answers" />
      <p className="text-sm text-muted-foreground">
        {locked
          ? "Your JD, resume, and fit answers are locked. You can still revise them later, but they're recorded as-is for comparison against the reveal."
          : "Your JD, resume, and fit answers will be locked once you continue. You can still revise them later, but they'll be recorded as-is for comparison against the reveal."}
      </p>
    </div>
  )
}
