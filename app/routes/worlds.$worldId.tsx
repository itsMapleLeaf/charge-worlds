import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react"
import { LayoutDashboard, Wrench } from "lucide-react"
import { useId } from "react"
import { route } from "routes-gen"
import { AuthProvider } from "../auth/auth-context"
import { getMembership } from "../auth/membership.server"
import { getSessionUser } from "../auth/session.server"
import { getAppMeta } from "../core/meta"
import {
  DashboardProvider,
  DashboardWindowButtons,
} from "../dashboard/dashboard-ui"
import { assert } from "../helpers/assert"
import { pick } from "../helpers/pick"
import { clearButtonClass } from "../ui/styles"
import { getWorld } from "../world/world-db.server"

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
    <AuthProvider value={data}>
      <DashboardProvider>
        <section
          className="grid h-full grid-cols-[auto,1fr]"
          aria-labelledby={worldHeadingId}
        >
          <nav className="thin-scrollbar flex w-12 flex-col items-center gap-4 bg-black/25 py-4 xl:w-64 xl:items-start xl:px-4">
            <h2
              className="sr-only text-3xl font-light xl:not-sr-only"
              id={worldHeadingId}
            >
              {data.world.name}
            </h2>

            <DashboardWindowButtons
              renderLabel={(label) => (
                <span className="sr-only xl:not-sr-only">{label}</span>
              )}
            />

            <div className="flex-1" />

            {data.membership?.role === "OWNER" && (
              <>
                <Link
                  to={route("/worlds/:worldId/dashboard", { worldId })}
                  className={clearButtonClass}
                  title="Dashboard"
                >
                  <LayoutDashboard className="pointer-events-none" />
                  <span className="sr-only xl:not-sr-only">Dashboard</span>
                </Link>
                <Link
                  to={route("/worlds/:worldId/settings", { worldId })}
                  className={clearButtonClass}
                  title="Settings"
                >
                  <Wrench className="pointer-events-none" />
                  <span className="sr-only xl:not-sr-only">Settings</span>
                </Link>
              </>
            )}
          </nav>
          <div>
            <Outlet />
          </div>
        </section>
      </DashboardProvider>
    </AuthProvider>
  )
}
