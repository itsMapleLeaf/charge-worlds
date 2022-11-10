import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { DiceRollList } from "../dice/dice-roll-list"
import { parseKeys } from "../helpers/parse-keys"
import { pick } from "../helpers/pick"
import { ClocksManager } from "./worlds.$worldId.clocks"
import { DiceRollForm } from "./worlds.$worldId.dice"

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

  return json({
    user: user && pick(user, ["name"]),
    membership: membership && pick(membership, ["role"]),
    clocks,
    diceLogs: diceLogs.reverse(),
  })
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-flow-col auto-cols-fr h-full">
      <section>
        <ClocksManager clocks={data.clocks} />
      </section>
      <div className="flex flex-col">
        <section className="flex-1 min-h-0">
          <DiceRollList rolls={data.diceLogs} />
        </section>
        {data.membership && (
          <div className="p-4">
            <DiceRollForm />
          </div>
        )}
      </div>
    </div>
  )
}
