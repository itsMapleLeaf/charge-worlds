import { ClientSideSuspense } from "@liveblocks/react"
import { NavLink, Outlet, useLoaderData, useNavigate } from "@remix-run/react"
import type { LoaderArgs, MetaFunction } from "@vercel/remix"
import { json } from "@vercel/remix"

import { cx } from "class-variance-authority"
import {
  ChevronUp,
  Dices,
  EyeOff,
  Gamepad2,
  Globe,
  Library,
  List,
  Mountain,
  SidebarOpen,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"
import { useRef } from "react"
import { route } from "routes-gen"
import { AppHeader } from "~/modules/app/app-header"
import { db } from "~/modules/app/db.server"
import {
  characterColors,
  defaultCharacterColor,
} from "~/modules/characters/character-colors"
import type { Character } from "~/modules/characters/collections"
import { CharacterCollection } from "~/modules/characters/collections"
import { DicePanel } from "~/modules/dice/dice-panel"
import { RoomContext } from "~/modules/liveblocks/liveblocks-client"
import { extractRef, type MaybeRef } from "~/modules/react/maybe-ref"
import { useIsomorphicLayoutEffect } from "~/modules/react/use-isomorphic-layout-effect"
import { button, circleButton } from "~/modules/ui/button"
import {
  Dialog,
  DialogButton,
  DialogDrawerPanel,
  DialogOverlay,
} from "~/modules/ui/dialog"
import { LoadingPlaceholder } from "~/modules/ui/loading"
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
            <aside className="panel sticky top-8 hidden w-56 overflow-y-auto lg:block xl:w-64">
              <WorldNav />
            </aside>

            <div className="flex-1">
              <ClientSideLoadingSuspense>
                <Outlet />
              </ClientSideLoadingSuspense>
            </div>

            <aside className="panel sticky top-8 hidden h-[calc(100vh-12rem)] w-56 overflow-y-auto md:block xl:w-64">
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
      prefetch="intent"
    >
      <props.icon aria-hidden /> {props.label}
    </NavLink>
  )
}

function CharacterListDetails(props: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useDetailsPersistence(ref, "world-nav-characters")
  return (
    <details className="group" ref={ref}>
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
          "relative -top-px rounded-full border brightness-150 s-5",
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

function useDetailsPersistence(ref: MaybeRef<HTMLDetailsElement>, key: string) {
  useIsomorphicLayoutEffect(() => {
    const element = extractRef(ref)
    if (!element) return

    element.open = localStorage.getItem(key) === "true"

    const handleToggle = () => {
      localStorage.setItem(key, String(element.open))
    }
    element.addEventListener("toggle", handleToggle)
    return () => {
      element.removeEventListener("toggle", handleToggle)
    }
  }, [ref, key])
}

function DiceDrawerButton() {
  return (
    <Dialog>
      <DialogButton className={circleButton} title="Show dice rolls">
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
