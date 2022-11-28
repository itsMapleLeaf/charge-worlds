import type { ActionArgs } from "@remix-run/node"
import type { DashboardModule } from "../dashboard/dashboard-module"
import { dashboardModules } from "../dashboard/dashboard-modules"
import { parseKeys } from "../helpers/parse-keys"

export async function action(args: ActionArgs) {
  const { moduleId } = parseKeys(args.params, ["moduleId"])
  const modules = dashboardModules as Record<string, DashboardModule>
  return await modules[moduleId]?.config.action?.(args)
}
