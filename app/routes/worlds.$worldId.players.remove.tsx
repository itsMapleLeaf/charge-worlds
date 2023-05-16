import { useFetcher } from "@remix-run/react"
import { json, type ActionArgs } from "@vercel/remix"
import { Minus } from "lucide-react"
import { route } from "routes-gen"
import { z } from "zod"
import { WorldContext } from "~/components/world-context"
import { db } from "~/data/db.server"
import { requireWorldOwner } from "~/data/membership.server"
import { requireSessionUser } from "~/data/session.server"
import { getWorld } from "~/data/world-db.server"
import { assert } from "~/helpers/assert"
import { discordIdSchema } from "~/helpers/discord-id"

const schema = z.object({
  discordId: discordIdSchema,
})

export async function action({ request, params }: ActionArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  const { discordId } = schema.parse(
    Object.fromEntries(await request.formData()),
  )

  await db.membership.delete({
    where: {
      worldId_userDiscordId: {
        worldId: params.worldId,
        userDiscordId: discordId,
      },
    },
  })

  return json({})
}

export function RemovePlayerForm({
  player,
}: {
  player: { userDiscordId: string; user: { name: string } }
}) {
  const fetcher = useFetcher()
  const { world } = WorldContext.useValue()
  return (
    <div className="flex items-start gap-2">
      <p className="panel min-h-[theme(height.12)] flex-1 p-3 leading-[22px] shadow-none">
        <span>{player.user.name}</span>{" "}
        <span className="opacity-75">({player.userDiscordId})</span>
      </p>
      <button
        type="button"
        title="Remove player"
        className="button panel justify-center s-12"
        onClick={() => {
          const body: z.input<typeof schema> = {
            discordId: player.userDiscordId,
          }
          fetcher.submit(body, {
            method: "POST",
            action: route("/worlds/:worldId/players/remove", {
              worldId: world.id,
            }),
          })
        }}
      >
        <Minus />
      </button>
    </div>
  )
}
