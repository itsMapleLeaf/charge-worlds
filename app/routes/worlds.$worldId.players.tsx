import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { db } from "~/data/db.server"
import { requireWorldOwner } from "~/data/membership.server"
import { requireSessionUser } from "~/data/session.server"
import { getWorld } from "~/data/world-db.server"
import { assert } from "~/helpers/assert"
import { AddPlayerForm } from "./worlds.$worldId.players.add"
import { RemovePlayerForm } from "./worlds.$worldId.players.remove"

export async function loader({ request, params }: LoaderArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  const players = await db.membership.findMany({
    where: {
      AND: {
        worldId: world.id,
        role: "PLAYER",
      },
    },
    select: {
      user: {
        select: { name: true },
      },
      userDiscordId: true,
    },
  })

  return json({
    players,
  })
}

export default function PlayersPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <section className="grid gap-4 p-4 panel">
      <h2 className="text-3xl font-light">Players</h2>
      <div className="grid gap-2">
        <AddPlayerForm />
        {data.players.map((player) => (
          <RemovePlayerForm key={player.userDiscordId} player={player} />
        ))}
      </div>
    </section>
  )
}
