import { db } from "../core/db.server"
import { raise } from "../helpers/errors"
import { defaultCharacterFields } from "./default-character-fields.mjs"

export function createWorld() {
  return db.world.create({
    data: {
      name: "New World",
      characterFields: {
        create: defaultCharacterFields.map(({ legacyField, ...rest }) => rest),
      },
    },
  })
}

export async function getWorld(worldId: string) {
  return (
    (await db.world.findUnique({ where: { id: worldId } })) ??
    raise(new Response(undefined, { status: 404 }))
  )
}
