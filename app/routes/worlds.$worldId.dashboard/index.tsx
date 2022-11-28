import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useParams } from "@remix-run/react"
import { getSessionUser } from "../../auth/session.server"
import { dashboardModules } from "../../dashboard/dashboard-modules"
import { DashboardMosaic } from "../../dashboard/dashboard-ui"
import { parseKeys } from "../../helpers/parse-keys"
import { pick } from "../../helpers/pick"
import { useInvalidate } from "../invalidate"
import { useWorldEvents } from "../worlds.$worldId.events"

export async function loader({ request, params, context }: LoaderArgs) {
  const user = await getSessionUser(request)

  const moduleData: Record<string, any> = {}
  await Promise.all(
    Object.entries(dashboardModules).map(async ([moduleName, module]) => {
      moduleData[moduleName] = await module.config.loader?.({
        request,
        params,
        context,
      })
    }),
  )

  return json({
    user: user && pick(user, ["id"]),
    moduleData,
  })
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>()
  const { worldId } = parseKeys(useParams(), ["worldId"])

  const invalidate = useInvalidate()
  useWorldEvents(worldId, (event) => {
    if (event.sourceUserId !== data.user?.id) {
      invalidate()
    }
  })

  return <DashboardMosaic moduleData={data.moduleData} />
}
