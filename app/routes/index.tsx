import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import cuid from "cuid"
import { LogIn, PlusSquare, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import type { MosaicNode } from "react-mosaic-component"
import { Mosaic } from "react-mosaic-component"
import { route } from "routes-gen"
import { getSessionUser } from "../auth/session"
import { UserMenuButton } from "../auth/user-menu-button"
import { ModuleWindow } from "../modules/module-window"
import { clearButtonClass } from "../ui/styles"

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  return json({
    user: user ? { name: user.name, avatarUrl: user.avatarUrl } : undefined,
  })
}

export default function IndexPage() {
  const { user } = useLoaderData<typeof loader>()
  const [mosaic, setMosaic] = useState<MosaicNode<string> | null>(null)

  useEffect(() => {
    setMosaic(cuid())
  }, [])

  const addWindow = () => {
    setMosaic((prev) => {
      if (!prev) return cuid()
      return {
        direction: "row",
        first: cuid(),
        second: prev,
        splitPercentage: 50,
      }
    })
  }

  return (
    <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
      <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap />
          <h1 className="text-3xl font-light">Charge Worlds</h1>
        </div>
        <nav className="flex items-center gap-4">
          <button className={clearButtonClass} onClick={addWindow}>
            <PlusSquare /> New window
          </button>
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
        <Mosaic<string>
          value={mosaic}
          onChange={setMosaic}
          className=""
          renderTile={(id, path) => (
            <ModuleWindow windowId={id} windowPath={path} />
          )}
          zeroStateView={
            <p className="absolute right-0 bottom-0 p-8 text-4xl opacity-25 select-none">
              <a
                href="https://soundcloud.com/dylantallchief/san-holo-plant"
                target="_blank"
                rel="noopener noreferrer"
              >
                🪴
              </a>
            </p>
          }
        />
      </main>
    </div>
  )
}
