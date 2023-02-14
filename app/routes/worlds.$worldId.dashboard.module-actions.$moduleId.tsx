import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { parseKeys } from "../helpers/parse-keys"
import type { DashboardModule } from "../modules/dashboard/dashboard-module"
import { dashboardModules } from "../modules/dashboard/dashboard-modules"

export async function loader() {
  return redirect("../..")
}

export async function action(args: ActionArgs) {
  const { moduleId } = parseKeys(args.params, ["moduleId"])
  const modules = dashboardModules as Record<string, DashboardModule>
  return await modules[moduleId]?.config.action?.(args)
}
