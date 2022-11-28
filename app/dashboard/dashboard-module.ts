import type { LoaderArgs } from "@remix-run/node"
import type { ReactElement, ReactNode } from "react"

export class DashboardModule<T = unknown> {
  constructor(
    readonly config: {
      name: string
      description: string
      icon: ReactNode
      loader: (args: LoaderArgs) => Promise<T>
      component: (data: T) => ReactElement
    },
  ) {}
}
