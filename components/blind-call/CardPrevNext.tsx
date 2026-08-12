import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export type CardPrevNextProps = {
  onPrev: () => void
  onNext: () => void
  prevDisabled: boolean
  nextDisabled: boolean
}

export function CardPrevNext({ onPrev, onNext, prevDisabled, nextDisabled }: CardPrevNextProps) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
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
  )
}
