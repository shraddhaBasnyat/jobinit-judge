import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type TextFieldProps = React.ComponentProps<typeof Input> & {
  // Passive "you have unsaved input here" signal — a border/background
  // shift, not a checkmark-absence: a positive, appearing cue rather than
  // one that requires the reviewer to notice something's missing. Reuses
  // --warning/--warning-bg (already carrying this "pending, not error"
  // semantic elsewhere in this codebase), deliberately not --destructive —
  // an unsaved draft isn't an error state.
  dirty?: boolean
}

function TextField({ dirty, ...props }: TextFieldProps) {
  return (
    <div
      className={cn(
        "flex h-9 min-w-0 flex-1 items-center rounded-[6px] border px-3 py-2",
        dirty ? "border-warning bg-warning-bg" : "border-input bg-background"
      )}
    >
      <Input
        {...props}
        className="h-auto truncate border-0 p-0 text-[11px] text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
      />
    </div>
  )
}

export { TextField }
