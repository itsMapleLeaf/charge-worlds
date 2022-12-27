import { createContext, useContext } from "react"
import { db } from "./db.server"
import { raise } from "./helpers/errors"
import { notFound } from "./helpers/responses"

export type WorldState = Awaited<ReturnType<typeof loadWorldState>>

export async function loadWorldState(
  worldId: string,
  user: { discordId: string } | undefined,
) {
  let membership
  if (user) {
    membership = await db.membership.findUnique({
      where: {
        worldId_userDiscordId: { worldId, userDiscordId: user.discordId },
      },
    })
  }

  const isAdmin = membership?.role === "OWNER"

  const world = await db.world.findUnique({
    where: { id: worldId },
    select: {
      name: true,
      characters: {
        where: isAdmin ? {} : { hidden: true },
        select: { id: true, name: true },
      },
    },
  })

  if (!world) {
    throw notFound()
  }

  return world
}

const Context = createContext<WorldState | undefined>(undefined)

export const WorldStateProvider = Context.Provider

export function useWorldState() {
  return useContext(Context) ?? raise("WorldStateProvider not found")
}
