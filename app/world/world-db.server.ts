import { db } from "../core/db.server"
import { raise } from "../helpers/errors"

export const defaultWorldId = "default"

export function getDefaultWorld() {
  return db.world.upsert({
    where: { id: defaultWorldId },
    update: {},
    create: { id: defaultWorldId, name: "New world" },
  })
}

export async function getWorld(worldId: string) {
  return (
    (await db.world.findUnique({ where: { id: worldId } })) ??
    raise(new Response(undefined, { status: 404 }))
  )
}
