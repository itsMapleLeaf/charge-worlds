import { authorize } from "@liveblocks/node"
import type { ActionArgs } from "@vercel/remix"
import { z } from "zod"
import { db } from "~/data/db.server"
import { env } from "~/data/env.server"
import {
  liveblocksFetch,
  RoomAccesses,
  throwResponseError,
} from "~/data/liveblocks-api.server"
import { getSessionUser } from "~/data/session.server"
import { raise } from "~/helpers/errors"
import { notFound } from "~/helpers/responses"

const currentRoomVersion = 1

const Groups = {
  player: "player",
} as const

const roomConfig = {
  defaultAccesses: RoomAccesses.read,
  groupsAccesses: {
    [Groups.player]: RoomAccesses.write,
  },
}

const schema = z.object({
  room: z.string(),
})

export async function action({ request }: ActionArgs) {
  const body = schema.parse(await request.json())
  const user = await getSessionUser(request)

  const world =
    (await db.world.findUnique({
      where: {
        // room id format is `world:<worldId>`
        id: body.room.split(":")[1],
      },
      select: {
        id: true,
        liveblocksRoomVersion: true,
      },
    })) ?? raise(notFound("World not found"))

  if (world.liveblocksRoomVersion < currentRoomVersion) {
    await syncLiveblocksRoom(world.id, body.room)
  }

  const membership =
    user &&
    (await db.membership.findFirst({
      where: {
        worldId: world.id,
        user: { id: user.id },
      },
      select: { id: true },
    }))

  const result = await authorize({
    room: body.room,
    secret: env.LIVEBLOCKS_SECRET_KEY,
    userId: user?.id ?? "anonymous",
    groupIds: membership ? [Groups.player] : [],
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

async function syncLiveblocksRoom(worldId: string, roomId: string) {
  console.info(`Updating liveblocks room ${roomId} for world ${worldId}`)

  let response = await liveblocksFetch("GET", `/rooms/${roomId}`)

  if (response.ok) {
    response = await liveblocksFetch("POST", `/rooms/${roomId}`, roomConfig)
  } else if (response.status === 404) {
    response = await liveblocksFetch("POST", `/rooms/`, {
      ...roomConfig,
      id: roomId,
    })
  }

  if (!response.ok) {
    await throwResponseError(response)
  }

  await db.world.update({
    where: { id: worldId },
    data: { liveblocksRoomVersion: currentRoomVersion },
  })
}
