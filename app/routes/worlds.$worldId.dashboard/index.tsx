import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData, useParams } from "@remix-run/react"
import { getSessionUser } from "../../auth/session.server"
import { db } from "../../core/db.server"
import { parseKeys } from "../../helpers/parse-keys"
import { pick } from "../../helpers/pick"
import { useInvalidate } from "../invalidate"
import { useWorldEvents } from "../worlds.$worldId.events"
import { DashboardMosaic } from "./dashboard"
import { dashboardModules } from "./dashboard-modules"

export async function loader({ request, params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])

  const [user, characterFields] = await Promise.all([
    getSessionUser(request),
    db.characterField.findMany({
      where: { worldId },
      select: { id: true, name: true, isLong: true },
    }),
  ])

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

  const characters = await db.character
    .findMany({
      where: charactersFilter,
      orderBy: { id: "asc" },
      include: {
        fieldValues: { select: { fieldId: true, value: true } },
      },
    })
    .then((result) =>
      result.map((character) => ({
        ...character,
        fieldValues: Object.fromEntries(
          character.fieldValues.map(({ fieldId, value }) => [fieldId, value]),
        ),
      })),
    )

  return json({
    user: user && pick(user, ["name", "id"]),
    membership: membership && pick(membership, ["role"]),
    characters,
    characterFields,
    clocks,
    diceLogs: diceLogs.reverse(),
  })
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
        characters: {
          characters: data.characters,
          characterFields: data.characterFields,
        },
        clocks: { clocks: data.clocks },
        dice: {
          rolls: data.diceLogs,
          rollFormVisible: !!data.membership,
        },
      }}
    />
  )
}
