import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
const ToastPortal = ToastPrimitive.Portal

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4",
        className
      )}
      {...props}
    />
  )
}

function ToastRoot({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast-root"
      swipeDirection={["up"]}
      className={cn(
        "pointer-events-auto flex w-[356px] max-w-full items-start justify-between gap-3 rounded-lg border border-border bg-background p-4 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm leading-4 font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn(
        "shrink-0 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      {...props}
    >
      <X className="size-4" />
    </ToastPrimitive.Close>
  )
}

export { ToastProvider, ToastPortal, ToastViewport, ToastRoot, ToastTitle, ToastClose }
