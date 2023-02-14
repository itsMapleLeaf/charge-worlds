import type { ReactElement, ReactNode } from "react"

export class DashboardModule {
  constructor(
    readonly config: {
      name: string
      description: string
      icon: ReactNode
      component: () => ReactElement
    },
  ) {}
}
