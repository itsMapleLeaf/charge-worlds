import { db } from "../core/db.server"
import type { User, World } from "../generated/prisma"
import { raise } from "../helpers/errors"

export async function getMembership(user: User, world: World) {
  const membership = await db.membership.findUnique({
    where: {
      worldId_userDiscordId: {
        worldId: world.id,
        userDiscordId: user.discordId,
      },
    },
  })
  if (membership) {
    return membership
  }

  const worldOwner = await db.membership.findFirst({
    where: { worldId: world.id, role: "OWNER" },
  })
  if (!worldOwner) {
    return db.membership.create({
      data: {
        worldId: world.id,
        userDiscordId: user.discordId,
        role: "OWNER",
      },
    })
  }
}

export async function requireMembership(user: User, world: World) {
  return (
    (await getMembership(user, world)) ??
    raise(new Response(undefined, { status: 403 }))
  )
}
