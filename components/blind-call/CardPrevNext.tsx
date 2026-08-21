import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export type CardPrevNextProps = {
  onPrev: () => void
  onNext: () => void
  prevDisabled: boolean
  nextDisabled: boolean
  forwardLabel?: string
  backLabel?: string
}

export function CardPrevNext({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  forwardLabel,
  backLabel,
}: CardPrevNextProps) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          disabled={prevDisabled}
          aria-disabled={prevDisabled}
          onClick={onPrev}
          aria-label="Previous stage"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
        </Button>
        {backLabel && <span className="text-xs text-muted-foreground">{backLabel}</span>}
      </div>
      <div className="flex flex-row items-center gap-2">
        {forwardLabel && <span className="text-xs text-muted-foreground">{forwardLabel}</span>}
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          disabled={nextDisabled}
          aria-disabled={nextDisabled}
          onClick={onNext}
          aria-label="Next stage"
        >
          <ArrowRight className="size-4" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}
