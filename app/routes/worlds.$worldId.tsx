import { ClientSideSuspense } from "@liveblocks/react"
import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react"

import { cx } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"
import {
  ChevronUp,
  EyeOff,
  Gamepad2,
  Globe,
  Library,
  List,
  Mountain,
  SidebarOpen,
  UserPlus,
  Users,
} from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { route } from "routes-gen"
import { AppHeader } from "~/modules/app/app-header"
import { db } from "~/modules/app/db.server"
import {
  characterColors,
  defaultCharacterColor,
} from "~/modules/characters/character-colors"
import type { Character } from "~/modules/characters/collections"
import { CharacterCollection } from "~/modules/characters/collections"
import { RoomContext } from "~/modules/liveblocks/liveblocks-client"
import { button, circleButton } from "~/modules/ui/button"
import {
  Dialog,
  DialogButton,
  DialogDrawerPanel,
  DialogOverlay,
} from "~/modules/ui/dialog"
import { LoadingPlaceholder } from "~/modules/ui/loading"
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
          <div className="flex flex-1 items-start gap-4">
            <aside
              className={cx(
                "w-48 hidden md:block lg:w-64 overflow-y-auto sticky top-8",
                panel(),
              )}
            >
              <WorldNav />
            </aside>
            <div className="flex-1">
              <ClientSideSuspense fallback={<LoadingPlaceholder />}>
                {() => <Outlet />}
              </ClientSideSuspense>
            </div>
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
  return (
    <Dialog>
      <DialogButton className={circleButton} title="Open drawer">
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

      <CharacterListDetails>
        <CharacterListSummary />
        <div className="border-y border-white/10">
          <ClientSideSuspense fallback={<LoadingPlaceholder />}>
            {() => <CharacterList />}
          </ClientSideSuspense>
        </div>
      </CharacterListDetails>

      <WorldNavLink
        to={route("/worlds/:worldId/library", { worldId: world.id })}
        icon={Library}
        label="Library"
      />

      {membership?.role === "OWNER" && (
        <>
          <WorldNavLink
            to={route("/worlds/:worldId/details", { worldId: world.id })}
            icon={Globe}
            label="World Details"
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
    </nav>
  )
}

function WorldNavLink(props: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={props.to}
      end
      className={({ isActive }) =>
        button({
          border: "none",
          shadow: "none",
          background: "none",
          active: isActive,
        })
      }
    >
      <props.icon aria-hidden /> {props.label}
    </NavLink>
  )
}

function CharacterListDetails(props: { children: React.ReactNode }) {
  const persistenceRef = useDetailsPersistence("world-nav-characters")
  return (
    <details className="group" ref={persistenceRef}>
      {props.children}
    </details>
  )
}

function CharacterListSummary() {
  return (
    <summary
      className={cx(
        button({ border: "none", shadow: "none", background: "none" }),
        "w-full",
      )}
    >
      <Users aria-hidden />
      <span className="flex-1">Characters</span>
      <ChevronUp aria-hidden className="transition group-open:rotate-180" />
    </summary>
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
          className={button({
            border: "none",
            shadow: "none",
            background: "none",
            size: 10,
          })}
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
      className={({ isActive }) =>
        button({
          border: "none",
          shadow: "none",
          background: "none",
          size: 10,
          active: isActive,
        })
      }
      key={character._id}
    >
      <div
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        className={cx(
          "relative -top-px rounded-full border s-5 brightness-150",
          colors.background,
          colors.border,
        )}
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

function useDetailsPersistence(key: string) {
  const [element, ref] = useState<HTMLDetailsElement | null>()

  useLayoutEffect(() => {
    if (!element) return

    element.open = localStorage.getItem(key) === "true"

    const handleToggle = () => {
      localStorage.setItem(key, String(element.open))
    }
    element.addEventListener("toggle", handleToggle)
    return () => {
      element.removeEventListener("toggle", handleToggle)
    }
  }, [element, key])

  return ref
}
