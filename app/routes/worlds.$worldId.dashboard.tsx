import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useParams } from "@remix-run/react"
import { useEffect } from "react"
import { route } from "routes-gen"
import { getSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { DashboardMosaic } from "../dashboard/dashboard"
import { parseKeys } from "../helpers/parse-keys"
import { pick } from "../helpers/pick"
import { useInvalidate } from "./invalidate"

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
    user: user && pick(user, ["name"]),
    membership: membership && pick(membership, ["role"]),
    characters,
    clocks,
    diceLogs: diceLogs.reverse(),
  })
}

export default function DashboardPage() {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const data = useLoaderData<typeof loader>()
  const invalidate = useInvalidate()

  useEffect(() => {
    const source = new EventSource(
      route("/worlds/:worldId/events", { worldId }),
    )
    source.addEventListener("message", invalidate)
    return () => source.close()
  }, [invalidate, worldId])

  return (
    <DashboardMosaic
      moduleData={{
        characters: { characters: data.characters },
        clocks: { clocks: data.clocks },
        dice: {
          rolls: data.diceLogs,
          rollFormVisible: data.membership?.role === "OWNER",
        },
      }}
    />
  )
}
