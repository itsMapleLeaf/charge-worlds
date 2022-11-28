import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { ReactElement, ReactNode } from "react"

export class DashboardModule<LoaderData = unknown, ActionData = unknown> {
  constructor(
    readonly config: {
      name: string
      description: string
      icon: ReactNode
      loader?: (args: LoaderArgs) => Promise<LoaderData>
      action?: (args: ActionArgs) => Promise<ActionData>
      component: (props: {
        loaderData: LoaderData
        actionData: ActionData
        formAction: string
      }) => ReactElement
    },
  ) {}
}
