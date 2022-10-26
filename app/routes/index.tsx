import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { LogIn, Zap } from "lucide-react"
import { route } from "routes-gen"
import { getSessionUser } from "../auth/session"
import { UserContext } from "../auth/user-context"
import { UserMenuButton } from "../auth/user-menu-button"
import {
  DashboardMosaic,
  DashboardNewWindowButton,
  DashboardProvider,
} from "../dashboard/dashboard"
import { clearButtonClass } from "../ui/styles"

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  return json({
    user: user ? { name: user.name, avatarUrl: user.avatarUrl } : undefined,
  })
}

export default function IndexPage() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
      <DashboardProvider>
        <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap />
            <h1 className="text-3xl font-light">Charge Worlds</h1>
          </div>
          <nav className="flex items-center gap-4">
            <DashboardNewWindowButton />
            {user ? (
              <UserMenuButton user={user} />
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
          <UserContext.Provider value={user}>
            <DashboardMosaic />
          </UserContext.Provider>
        </main>
      </DashboardProvider>
    </div>
  )
}
