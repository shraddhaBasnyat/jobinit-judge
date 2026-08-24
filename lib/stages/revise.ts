import type { ReactNode } from "react"

export type ReviseField = {
  label: string
  ReadRows: () => ReactNode
  EditField: () => ReactNode
}
