import { db } from "../core/db.server"
import { raise } from "../helpers/errors"

export async function getWorld(worldId: string) {
  return (
    (await db.world.findUnique({ where: { id: worldId } })) ??
    raise(new Response(undefined, { status: 404 }))
  )
}
