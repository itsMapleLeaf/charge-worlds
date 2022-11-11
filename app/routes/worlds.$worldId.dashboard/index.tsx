import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { ShouldReloadFunction } from "@remix-run/react"
import { useLoaderData, useParams } from "@remix-run/react"
import { getSessionUser } from "../../auth/session.server"
import { db } from "../../core/db.server"
import { parseKeys } from "../../helpers/parse-keys"
import { pick } from "../../helpers/pick"
import { useInvalidate } from "../invalidate"
import { CharactersModule } from "../worlds.$worldId.characters"
import { ClocksManager } from "../worlds.$worldId.clocks"
import { DiceRollForm } from "../worlds.$worldId.dice"
import type { DiceRoll } from "../worlds.$worldId.dice/dice-roll-list"
import { DiceRollList } from "../worlds.$worldId.dice/dice-roll-list"
import { useWorldEvents } from "../worlds.$worldId.events"
import { DashboardMosaic } from "./dashboard"

export async function loader({ request, params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])

  const user = await getSessionUser(request)

  const membership =
    user &&
    (await db.membership.findUnique({
      where: {
        worldId_userDiscordId: { worldId, userDiscordId: user.discordId },
      },
    }))

  const clocks = await db.clock.findMany({
    where: { worldId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      progress: true,
      maxProgress: true,
    },
  })

  const diceLogs = await db.diceLog.findMany({
    where: { worldId },
    orderBy: { id: "desc" },
    take: 20,
    select: {
      id: true,
      intent: true,
      dice: true,
      resultType: true,
      rolledBy: { select: { name: true } },
    },
  })

  const charactersFilter =
    membership?.role === "OWNER"
      ? { worldId }
      : { AND: [{ worldId }, { hidden: false }] }

  const characters = await db.character.findMany({
    where: charactersFilter,
    orderBy: { id: "asc" },
  })

  return json({
    user: user && pick(user, ["name", "id"]),
    membership: membership && pick(membership, ["role"]),
    characters,
    clocks,
    diceLogs: diceLogs.reverse(),
  })
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
  if (!submission) return false
  const url = new URL(submission.action, window.location.origin)
  return !url.searchParams.has("noreload")
}

export default function DashboardPage() {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const data = useLoaderData<typeof loader>()
  const invalidate = useInvalidate()

  useWorldEvents(worldId, (event) => {
    if (event.sourceUserId !== data.user?.id) {
      invalidate()
    }
  })

  return (
    <DashboardMosaic
      modules={dashboardModules}
      moduleData={{
        characters: { characters: data.characters },
        clocks: { clocks: data.clocks },
        dice: {
          rolls: data.diceLogs,
          rollFormVisible: !!data.membership,
        },
      }}
    />
  )
}

const dashboardModules = {
  characters: {
    name: "Characters",
    description: "Manage your characters",
    component: CharactersModule,
  },
  clocks: {
    name: "Clocks",
    description:
      "Track the progress of world forces, and other progressful things",
    component: ClocksManager,
  },
  dice: {
    name: "Dice",
    description: "Roll some dice!",
    component: function DiceModule(props: {
      rolls: DiceRoll[]
      rollFormVisible: boolean
    }) {
      return (
        <div className="flex flex-col h-full">
          <section className="flex-1 min-h-0">
            <DiceRollList rolls={props.rolls} />
          </section>
          {props.rollFormVisible && (
            <div className="p-4">
              <DiceRollForm />
            </div>
          )}
        </div>
      )
    },
  },
}
