import { authorize } from "@liveblocks/node"
import type { ActionArgs } from "@remix-run/node"
import { z } from "zod"
import { getSessionUser } from "~/auth/session.server"
import { db } from "~/core/db.server"
import { env } from "~/core/env.server"
import { raise } from "~/helpers/errors"
import { notFound } from "~/helpers/responses"
import {
  liveblocksGet,
  liveblocksPost,
  RoomAccesses,
  throwResponseError,
} from "~/liveblocks/liveblocks-api.server"

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

  // room id format is `world:<worldId>`
  const worldId = body.room.split(":")[1]

  const world =
    (await db.world.findUnique({
      where: { id: worldId },
      select: {
        liveblocksRoomVersion: true,
      },
    })) ?? raise(notFound("World not found"))

  await syncLiveblocksRoom(world.liveblocksRoomVersion, body.room)

  const membership =
    user &&
    (await db.membership.findFirst({
      where: {
        worldId,
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

async function syncLiveblocksRoom(roomVersion: number, roomId: string) {
  if (roomVersion >= currentRoomVersion) {
    return
  }

  let response = await liveblocksGet(`/rooms/${roomId}`)

  if (response.ok) {
    response = await liveblocksPost(`/rooms/${roomId}`, roomConfig)
  } else if (response.status === 404) {
    response = await liveblocksPost(`/rooms/`, { ...roomConfig, id: roomId })
  }

  if (!response.ok) {
    await throwResponseError(response)
  }
}
