"use client"

import type { ReactNode } from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import {
  ToastClose,
  ToastPortal,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export const BLOCKED_STAGE_TOAST_ID = "blind-call-blocked-stage"
export const TOAST_TIMEOUT_MS = 2500

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <ToastPortal>
      <ToastViewport>
        {toasts.map((toast) => (
          <ToastRoot key={toast.id} toast={toast}>
            <ToastTitle />
            <ToastClose />
          </ToastRoot>
        ))}
      </ToastViewport>
    </ToastPortal>
  )
}

export function BlindCallToaster({ children }: { children: ReactNode }) {
  return (
    <ToastProvider timeout={TOAST_TIMEOUT_MS}>
      {children}
      <ToastList />
    </ToastProvider>
  )
}
