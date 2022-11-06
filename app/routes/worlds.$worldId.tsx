import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useParams,
} from "@remix-run/react"
import { Dices, LayoutDashboard, LogIn, Wrench } from "lucide-react"
import { route } from "routes-gen"
import { AuthContext } from "../auth/auth-context"
import { getMembership } from "../auth/membership"
import { getSessionUser } from "../auth/session"
import { UserMenuButton } from "../auth/user-menu-button"
import { getAppMeta } from "../core/meta"
import {
  DashboardNewWindowButton,
  DashboardProvider,
} from "../dashboard/dashboard"
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
  const matches = useMatches()
  const params = useParams()

  assert(params.worldId, "worldId is required")
  const worldId = params.worldId

  return (
    <AuthContext.Provider value={data}>
      <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
        <DashboardProvider>
          <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center">
            <div className="flex items-center gap-2 mr-2">
              <Dices />
              <h1 className="text-3xl font-light">{data.world.name}</h1>
            </div>

            {data.membership?.role === "OWNER" && (
              <nav className="flex items-center gap-4">
                <Link
                  to={route("/worlds/:worldId/dashboard", { worldId })}
                  className={clearButtonClass}
                >
                  <LayoutDashboard /> Dashboard
                </Link>
                <Link
                  to={route("/worlds/:worldId/settings", { worldId })}
                  className={clearButtonClass}
                >
                  <Wrench /> Settings
                </Link>
              </nav>
            )}

            <div className="flex-1" />

            <nav className="flex items-center gap-4">
              {matches.some(
                (m) =>
                  m.pathname.replace(/\/$/, "") ===
                  route("/worlds/:worldId/dashboard", { worldId }),
              ) && <DashboardNewWindowButton />}

              {data.user ? (
                <UserMenuButton user={data.user} />
              ) : (
                <Link
                  to={route("/auth/discord/login")}
                  className={clearButtonClass}
                >
                  <LogIn /> Discord sign in
                </Link>
              )}
            </nav>
          </header>
          <main className="bg-slate-900 relative">
            <Outlet />
          </main>
        </DashboardProvider>
      </div>
    </AuthContext.Provider>
  )
}
