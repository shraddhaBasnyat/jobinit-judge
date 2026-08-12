import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn("w-full bg-transparent outline-none", className)}
      {...props}
    />
  )
}

export { Input }
