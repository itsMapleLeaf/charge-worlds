import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import {
  Dialog,
  DialogDisclosure,
  DialogDismiss,
  useDialogState,
} from "ariakit"
import { cx } from "class-variance-authority"
import { SidebarClose, SidebarOpen } from "lucide-react"
import { route } from "routes-gen"
import { AppHeader } from "~/modules/app/app-header"
import { db } from "~/modules/app/db.server"
import { RoomContext } from "~/modules/liveblocks/liveblocks-client"
import { circleButton } from "~/modules/ui/button"
import { panel } from "~/modules/ui/panel"
import { WorldContext } from "~/modules/world/world-context"
import { pick } from "../helpers/pick"
import { getAppMeta } from "../modules/app/meta"
import { getMembership } from "../modules/auth/membership.server"
import { getSessionUser } from "../modules/auth/session.server"
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
        role: true,
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
      id: world.id,
      name: world.name,
      memberships,
    },
  })
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <WorldContext.Provider {...data}>
      <RoomContext.RoomProvider
        id={`world:${data.world.id}`}
        initialPresence={{}}
      >
        <div className="flex flex-1 flex-col gap-4">
          <AppHeader
            title={data.world.name}
            breadcrumbs={[{ label: "Your Worlds", to: route("/") }]}
          />
          <div className="flex flex-1 gap-4">
            <aside className={cx(panel(), "w-48 hidden md:block lg:w-64")}>
              <WorldNav />
            </aside>
            <main>main content</main>
          </div>
          <div className="sticky bottom-4 md:hidden">
            <DrawerButton />
          </div>
        </div>
      </RoomContext.RoomProvider>
    </WorldContext.Provider>
  )
}

function DrawerButton() {
  const dialog = useDialogState({
    animated: true,
  })
  return (
    <>
      <DialogDisclosure
        state={dialog}
        className={circleButton}
        title="Open drawer"
      >
        <SidebarOpen />
      </DialogDisclosure>
      <Dialog
        state={dialog}
        className={cx(
          panel({ border: "right" }),
          "fixed inset-y-0 left-0 flex min-h-0 w-64 -translate-x-full flex-col overflow-y-auto opacity-0 transition duration-300 data-[enter]:translate-x-0 data-[enter]:opacity-100",
        )}
      >
        <div className="flex-1">
          <WorldNav />
        </div>
        <div className="sticky bottom-0 p-4">
          <DialogDismiss className={circleButton} title="Dismiss">
            <SidebarClose />
          </DialogDismiss>
        </div>
      </Dialog>
    </>
  )
}

function WorldNav() {
  return <nav className="p-4">world nav</nav>
}
