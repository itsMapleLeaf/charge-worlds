import { ClientSideSuspense } from "@liveblocks/react"
import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useParams } from "@remix-run/react"
import { LayoutDashboard, Wrench } from "lucide-react"
import { useId } from "react"
import { route } from "routes-gen"
import { db } from "~/modules/app/db.server"
import { RoomContext } from "~/modules/liveblocks/liveblocks-client"
import { LoadingPlaceholder } from "~/modules/ui/loading"
import { WorldContext } from "~/modules/world/world-context"
import { assert } from "../helpers/assert"
import { pick } from "../helpers/pick"
import { getAppMeta } from "../modules/app/meta"
import { AuthProvider } from "../modules/auth/auth-context"
import { getMembership } from "../modules/auth/membership.server"
import { getSessionUser } from "../modules/auth/session.server"
import {
  DashboardProvider,
  DashboardWindowButtons,
} from "../modules/dashboard/dashboard-ui"
import { clearButtonClass } from "../modules/ui/styles"
import { getWorld } from "../modules/world/world-db.server"

export const meta: MetaFunction<typeof loader> = ({ data }) =>
  getAppMeta({ title: data.world.name })

export async function loader({ request, params }: LoaderArgs) {
  const [world, user, memberships] = await Promise.all([
    getWorld(params.worldId!),
    getSessionUser(request),
    db.membership.findMany({
      where: { worldId: params.worldId },
      select: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    }),
  ])

  const membership = user && (await getMembership(user, world))

  return json({
    user: user && pick(user, ["id", "name", "avatarUrl"]),
    membership: membership && pick(membership, ["role"]),
    world: {
      name: world.name,
      memberships,
    },
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
        <RoomContext.RoomProvider id={`world:${worldId}`} initialPresence={{}}>
          <WorldContext.Provider world={data.world}>
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
                <ClientSideSuspense fallback={<LoadingPlaceholder />}>
                  {() => <Outlet />}
                </ClientSideSuspense>
              </div>
            </section>
          </WorldContext.Provider>
        </RoomContext.RoomProvider>
      </DashboardProvider>
    </AuthProvider>
  )
}
