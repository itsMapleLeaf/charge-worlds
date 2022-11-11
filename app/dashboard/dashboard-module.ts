import type { ReactNode } from "react"

export type DashboardModule = {
  name: string
  description: string
  component: (props: any) => ReactNode
}
