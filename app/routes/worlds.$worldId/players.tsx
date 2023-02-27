import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { cx } from "class-variance-authority"
import { assert } from "~/helpers/assert"
import { db } from "~/modules/app/db.server"
import { requireWorldOwner } from "~/modules/auth/membership.server"
import { requireSessionUser } from "~/modules/auth/session.server"
import { panel } from "~/modules/ui/panel"
import { getWorld } from "~/modules/world/world-db.server"
import { AddPlayerForm } from "./players.add"
import { RemovePlayerForm } from "./players.remove"

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
    <section className={cx(panel(), "p-4 grid gap-4")}>
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
