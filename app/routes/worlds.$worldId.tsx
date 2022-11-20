import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react"
import { LayoutDashboard, Wrench } from "lucide-react"
import { useId } from "react"
import { route } from "routes-gen"
import { AuthContext } from "../auth/auth-context"
import { getMembership } from "../auth/membership"
import { getSessionUser } from "../auth/session.server"
import { getAppMeta } from "../core/meta"
import { assert } from "../helpers/assert"
import { pick } from "../helpers/pick"
import { clearButtonClass } from "../ui/styles"
import { getWorld } from "../world/world-db.server"
import {
  DashboardProvider,
  DashboardWindowButtons,
} from "./worlds.$worldId.dashboard/dashboard"
import { dashboardModules } from "./worlds.$worldId.dashboard/dashboard-modules"

export const meta: MetaFunction<typeof loader> = ({ data }) =>
  getAppMeta({ title: data.world.name })

export async function loader({ request, params }: LoaderArgs) {
  const [world, user] = await Promise.all([
    getWorld(params.worldId!),
    getSessionUser(request),
  ])

  const membership = user && (await getMembership(user, world))

  return json({
    user: user && pick(user, ["name", "avatarUrl"]),
    membership: membership && pick(membership, ["role"]),
    world: pick(world, ["name"]),
  })
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  assert(params.worldId, "worldId is required")
  const worldId = params.worldId

  const worldHeadingId = useId()

  return (
    <AuthContext.Provider value={data}>
      <DashboardProvider>
        <section
          className="h-full grid grid-cols-[auto,1fr]"
          aria-labelledby={worldHeadingId}
        >
          <nav className="thin-scrollbar flex flex-col py-4 gap-4 w-12 items-center md:w-64 md:px-4 md:items-start bg-black/25">
            <h2
              className="text-3xl font-light sr-only md:not-sr-only"
              id={worldHeadingId}
            >
              {data.world.name}
            </h2>

            <DashboardWindowButtons modules={dashboardModules} />

            <div className="flex-1" />

            {data.membership?.role === "OWNER" && (
              <>
                <Link
                  to={route("/worlds/:worldId/dashboard", { worldId })}
                  className={clearButtonClass}
                >
                  <LayoutDashboard />
                  <span className="sr-only md:not-sr-only">Dashboard</span>
                </Link>
                <Link
                  to={route("/worlds/:worldId/settings", { worldId })}
                  className={clearButtonClass}
                >
                  <Wrench />
                  <span className="sr-only md:not-sr-only">Settings</span>
                </Link>
              </>
            )}
          </nav>
          <div>
            <Outlet />
          </div>
        </section>
      </DashboardProvider>
    </AuthContext.Provider>
  )
}
