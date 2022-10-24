import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import {
  Menu,
  MenuButton,
  MenuItem,
  Select,
  SelectItem,
  SelectPopover,
  useMenuState,
  useSelectState,
} from "ariakit"
import cuid from "cuid"
import {
  LogIn,
  LogOut,
  Maximize2,
  PlusSquare,
  SeparatorVertical,
  User,
  X,
  Zap,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import type { MosaicBranch, MosaicNode } from "react-mosaic-component"
import {
  Mosaic,
  MosaicContext,
  MosaicWindow,
  MosaicWindowContext,
} from "react-mosaic-component"
import { route } from "routes-gen"
import { getSessionUser } from "../auth/session"
import { clearButtonClass, menuItemClass, menuPanelClass } from "../ui/styles"

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
        <div className="flex items-center gap-2 -ml-2">
          <Zap />
          <h1 className="text-3xl font-light">Charge Worlds</h1>
        </div>
        <nav className="flex items-center gap-4">
          <button className={clearButtonClass} onClick={addWindow}>
            <PlusSquare /> New window
          </button>
          {user ? (
            <UserButton user={user} />
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

function UserButton({
  user,
}: {
  user: { name: string; avatarUrl: string | null }
}) {
  const menu = useMenuState({
    gutter: 4,
    placement: "bottom-end",
    animated: true,
  })
  return (
    <>
      <MenuButton className={clearButtonClass} state={menu}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <User />
        )}{" "}
        {user.name}
      </MenuButton>
      <Menu state={menu} className={menuPanelClass} portal>
        <MenuItem
          as={Link}
          to={route("/auth/logout")}
          className={menuItemClass}
        >
          <LogOut /> Sign out
        </MenuItem>
      </Menu>
    </>
  )
}

function ModuleWindow({
  windowId: id,
  windowPath: path,
}: {
  windowId: string
  windowPath: MosaicBranch[]
}) {
  return (
    <MosaicWindow
      title={id}
      path={path}
      createNode={() => cuid()}
      renderToolbar={() => (
        <div className="flex items-center justify-between w-full px-3">
          <ModuleViewSelect />
          <ModuleWindowControls windowPath={path} />
        </div>
      )}
    >
      <section className="w-full h-full bg-slate-800">
        <p>test</p>
      </section>
    </MosaicWindow>
  )
}

function ModuleViewSelect() {
  const options = ["Characters", "Clocks", "Dice", "Whiteboard"] as const

  const select = useSelectState({
    defaultValue: options[0],
    gutter: 12,
    animated: true,
  })

  return (
    <div className="relative flex">
      <Select
        state={select}
        className="flex items-center gap-1 flex-row-reverse text-lg font-medium hover:text-blue-300 p-2 -m-2 leading-none"
      />
      <SelectPopover state={select} className={menuPanelClass}>
        {options.map((option) => (
          <SelectItem key={option} value={option} className={menuItemClass}>
            {option}
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
  )
}

function ModuleWindowControls({ windowPath }: { windowPath: MosaicBranch[] }) {
  const { mosaicActions } = useContext(MosaicContext)
  const { mosaicWindowActions } = useContext(MosaicWindowContext)
  return (
    <nav className="flex items-center gap-3">
      <button
        title="Split"
        className={clearButtonClass}
        onClick={() => mosaicWindowActions.split(windowPath)}
      >
        <SeparatorVertical size={20} />
      </button>
      <button
        title="Expand"
        className={clearButtonClass}
        onClick={() => mosaicActions.expand(windowPath, 75)}
      >
        <Maximize2 size={20} />
      </button>
      <button
        title="Close"
        className={clearButtonClass}
        onClick={() => mosaicActions.remove(windowPath)}
      >
        <X size={20} />
      </button>
    </nav>
  )
}
