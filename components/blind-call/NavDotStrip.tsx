import { NavDot } from "@/components/blind-call/NavDot"

export type NavDotStripProps = {
  stages: { id: string; label: string }[]
  currentStageId: string
}

export function NavDotStrip({ stages, currentStageId }: NavDotStripProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStageId)

  return (
    <div
      role="list"
      data-testid="nav-dot-strip"
      className="flex w-full flex-row justify-center gap-2.5 px-2"
    >
      {stages.map((stage, i) => (
        <NavDot
          key={stage.id}
          label={stage.label}
          state={i < currentIndex ? "completed" : i === currentIndex ? "current" : "incomplete"}
        />
      ))}
    </div>
  )
}
