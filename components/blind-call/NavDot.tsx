import { cn } from "@/lib/utils"

export type NavDotState = "completed" | "current" | "incomplete"

export type NavDotProps = {
  label: string
  state: NavDotState
}

export function NavDot({ label, state }: NavDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5" data-nav-dot-state={state}>
      <span
        aria-hidden="true"
        className={cn(
          "block size-1.5 shrink-0 rounded-full",
          state === "current" && "bg-primary",
          state === "completed" && "bg-muted-gray",
          state === "incomplete" && "border border-muted-gray-border bg-transparent"
        )}
      />
      <span
        className={cn(
          "text-[11px] leading-5 font-semibold text-primary",
          state !== "current" && "sr-only"
        )}
      >
        {label}
      </span>
    </span>
  )
}
