import { ClientSideSuspense } from "@liveblocks/react"
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react"
import type { LoaderArgs, V2_MetaFunction } from "@vercel/remix"
import { json } from "@vercel/remix"
import {
  Dices,
  EyeOff,
  Gamepad2,
  Library,
  List,
  Mountain,
  SidebarOpen,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { route } from "routes-gen"
import { AppHeader } from "~/components/app-header"
import {
  Dialog,
  DialogButton,
  DialogDrawerPanel,
  DialogOverlay,
} from "~/components/dialog"
import { DicePanel } from "~/components/dice-panel"
import { LoadingPlaceholder } from "~/components/loading"
import { WorldContext } from "~/components/world-context"
import type { Character } from "~/data/character-collections"
import { CharacterCollection } from "~/data/character-collections"
import { characterColors, defaultCharacterColor } from "~/data/character-colors"
import { db } from "~/data/db.server"
import { RoomContext } from "~/data/liveblocks-client"
import { getMembership } from "../data/membership.server"
import { getAppMeta } from "../data/meta"
import { getSessionUser } from "../data/session.server"
import { getWorld } from "../data/world-db.server"
import { pick } from "../helpers/pick"

export const meta: V2_MetaFunction<typeof loader> = ({ data }) =>
  getAppMeta({ title: data.world.name })

export async function loader({ request, params }: LoaderArgs) {
  const [world, user, memberships] = await Promise.all([
    getWorld(params.worldId as string),
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

          <div className="flex flex-1 items-start gap-2">
            <aside className="panel glass sticky top-8 hidden w-56 overflow-y-auto lg:block xl:w-64">
              <WorldNav />
            </aside>

            <div className="flex-1">
              <ClientSideLoadingSuspense>
                <Outlet />
              </ClientSideLoadingSuspense>
            </div>

            <aside className="panel glass sticky top-8 hidden h-[calc(100vh-12rem)] w-56 overflow-y-auto md:block xl:w-64">
              <ClientSideLoadingSuspense>
                <DicePanel />
              </ClientSideLoadingSuspense>
            </aside>
          </div>

          <div className="sticky bottom-4 flex justify-between">
            <div className="lg:hidden">
              <MenuDrawerButton />
            </div>
            <div className="flex-1" />
            <div className="md:hidden">
              <DiceDrawerButton />
            </div>
          </div>
        </div>
      </RoomContext.RoomProvider>
    </WorldContext.Provider>
  )
}

function MenuDrawerButton() {
  return (
    <Dialog>
      <DialogButton
        className="button glass panel rounded-full"
        title="Open drawer"
      >
        <SidebarOpen />
      </DialogButton>
      <DialogOverlay>
        <DialogDrawerPanel side="left">
          <WorldNav />
        </DialogDrawerPanel>
      </DialogOverlay>
    </Dialog>
  )
}

function WorldNav() {
  const { world, membership } = WorldContext.useValue()

  return (
    <nav className="flex flex-col">
      <WorldNavLink
        to={route("/worlds/:worldId", { worldId: world.id })}
        icon={Mountain}
        label="Scene"
      />

      <WorldNavLink
        to={route("/worlds/:worldId/library", { worldId: world.id })}
        icon={Library}
        label="Library"
      />

      {membership?.role === "OWNER" && (
        <>
          <WorldNavLink
            to={route("/worlds/:worldId/manage", { worldId: world.id })}
            icon={Wrench}
            label="Manage World"
          />
          <WorldNavLink
            to={route("/worlds/:worldId/players", { worldId: world.id })}
            icon={Gamepad2}
            label="Players"
          />
          <WorldNavLink
            to={route("/worlds/:worldId/character-fields", {
              worldId: world.id,
            })}
            icon={List}
            label="Character Fields"
          />
        </>
      )}

      <div className="border-t border-white/10">
        <ClientSideLoadingSuspense>
          <CharacterList />
        </ClientSideLoadingSuspense>
      </div>
    </nav>
  )
}

function WorldNavLink(props: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={props.to}
      end
      className="rounded-0 button origin-left border-none bg-transparent"
      prefetch="intent"
    >
      <props.icon aria-hidden /> {props.label}
    </NavLink>
  )
}

function CharacterList() {
  const { world, membership } = WorldContext.useValue()
  const mutations = CharacterCollection.useMutations()
  const navigate = useNavigate()

  let characters = CharacterCollection.useItems()
  if (membership?.role !== "OWNER") {
    characters = characters.filter((character) => !character.hidden)
  }

  return (
    <div className="flex flex-col">
      {characters.map((character) => (
        <CharacterLink character={character} key={character._id} />
      ))}
      {membership?.role === "OWNER" && (
        <button
          className="rounded-0 button h-10 origin-left border-0 bg-transparent"
          onClick={() => {
            const result = mutations.create({ name: "New Character" })
            if (!result) return

            navigate(
              route("/worlds/:worldId/characters/:characterId", {
                worldId: world.id,
                characterId: result._id,
              }),
            )
          }}
        >
          <UserPlus aria-hidden /> Create Character
        </button>
      )}
    </div>
  )
}

function CharacterLink({
  character,
}: {
  character: Character & { _id: string }
}) {
  const { world } = WorldContext.useValue()

  const colors =
    (character.color && characterColors[character.color]) ||
    defaultCharacterColor

  return (
    <NavLink
      to={route("/worlds/:worldId/characters/:characterId", {
        worldId: world.id,
        characterId: character._id,
      })}
      className="rounded-0 button h-10 origin-left border-none bg-transparent"
      key={character._id}
    >
      <div
        className="relative -top-px rounded-full border brightness-150 s-5"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      />
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {character.name}
      </span>
      {character.hidden && (
        <EyeOff className="opacity-75" aria-label="Hidden" />
      )}
    </NavLink>
  )
}

function DiceDrawerButton() {
  return (
    <Dialog>
      <DialogButton
        className="button glass panel rounded-full"
        title="Show dice rolls"
      >
        <Dices />
      </DialogButton>
      <DialogOverlay>
        <DialogDrawerPanel side="right">
          <ClientSideLoadingSuspense>
            <DicePanel />
          </ClientSideLoadingSuspense>
        </DialogDrawerPanel>
      </DialogOverlay>
    </Dialog>
  )
}

function ClientSideLoadingSuspense({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientSideSuspense fallback={<LoadingPlaceholder />}>
      {() => children}
    </ClientSideSuspense>
  )
}
