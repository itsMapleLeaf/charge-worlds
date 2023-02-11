import { authorize } from "@liveblocks/node"
import type { ActionArgs } from "@remix-run/node"
import { z } from "zod"
import { getSessionUser } from "~/auth/session.server"
import { db } from "~/core/db.server"
import { env } from "~/core/env.server"

const schema = z.object({
  room: z.string(),
})

export async function action({ request }: ActionArgs) {
  const body = schema.parse(await request.json())
  const user = await getSessionUser(request)

  // room id format is `world:<worldId>`
  const worldId = body.room.split(":")[1]

  const membership =
    user &&
    (await db.membership.findFirst({
      where: {
        worldId,
        user: { id: user.id },
      },
    }))

  const result = await authorize({
    room: body.room,
    secret: env.LIVEBLOCKS_SECRET_KEY,
    userId: user?.id ?? "anonymous",
    groupIds: membership ? ["player"] : [],
  })

  if (result.error) {
    console.error("Liveblocks authentication failed:", result.error)
    return new Response(undefined, { status: 403 })
  }

  return new Response(result.body, {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
