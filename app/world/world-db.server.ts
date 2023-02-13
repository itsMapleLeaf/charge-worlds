import { randomUUID } from "node:crypto"
import type { CharacterFieldInput } from "~/characters/collections"
import { liveblocksPost } from "~/liveblocks/liveblocks-api.server"
import { db } from "../core/db.server"
import { raise } from "../helpers/errors"
import { defaultCharacterFields } from "./default-character-fields.mjs"

export async function createWorld() {
  const id = randomUUID()
  const roomId = `world:${id}`

  await liveblocksPost("rooms", {
    id: roomId,
    defaultAccesses: ["room:read", "room:presence:write"],
    groupsAccesses: {
      player: ["room:write"],
    },
  })

  await liveblocksPost(`rooms/${roomId}/storage`, {
    liveblocksType: "LiveObject",
    data: {
      characterFields: {
        liveblocksType: "LiveList",
        data: defaultCharacterFields.map((field) => {
          const data: CharacterFieldInput = {
            id: randomUUID(),
            name: field.name,
            isLong: field.isLong,
          }
          return { liveblocksType: "LiveObject", data }
        }),
      },
    },
  })

  return db.world.create({
    data: { id, name: "New World" },
  })
}

export async function getWorld(worldId: string) {
  return (
    (await db.world.findUnique({ where: { id: worldId } })) ??
    raise(new Response(undefined, { status: 404 }))
  )
}
