import { Input } from "@/components/ui/input"

function TextField(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="flex h-9 min-w-0 flex-1 items-center rounded-[6px] border border-input bg-background px-3 py-2">
      <Input
        {...props}
        className="h-auto truncate border-0 p-0 text-[11px] text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
      />
    </div>
  )
}

export { TextField }
