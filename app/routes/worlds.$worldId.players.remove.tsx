import { useFetcher } from "@remix-run/react"
import { json, type ActionArgs } from "@vercel/remix"
import { Minus } from "lucide-react"
import { route } from "routes-gen"
import { z } from "zod"
import { assert } from "~/helpers/assert"
import { discordIdSchema } from "~/helpers/discord-id"
import { db } from "~/modules/app/db.server"
import { requireWorldOwner } from "~/modules/auth/membership.server"
import { requireSessionUser } from "~/modules/auth/session.server"
import { WorldContext } from "~/modules/world/world-context"
import { getWorld } from "~/modules/world/world-db.server"

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
      <p className="min-h-[theme(height.12)] flex-1 p-3 leading-[22px] shadow-none panel">
        <span>{player.user.name}</span>{" "}
        <span className="opacity-75">({player.userDiscordId})</span>
      </p>
      <button
        type="button"
        title="Remove player"
        className="justify-center s-12 button"
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
