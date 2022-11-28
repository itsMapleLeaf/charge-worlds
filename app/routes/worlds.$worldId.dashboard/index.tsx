import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { dashboardModules } from "../../dashboard/dashboard-modules"
import { DashboardMosaic } from "../../dashboard/dashboard-ui"
import { parseKeys } from "../../helpers/parse-keys"

export async function loader({ request, params, context }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])

  const moduleData: Record<string, any> = {}
  await Promise.all(
    Object.entries(dashboardModules).map(async ([moduleName, module]) => {
      moduleData[moduleName] = await module.config.loader({
        request,
        params,
        context,
      })
    }),
  )

  return json({ moduleData })
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>()
  return <DashboardMosaic moduleData={data.moduleData} />
}
