import { createContext, useContext } from "react"
import { db } from "./db.server"
import { raise } from "./helpers/errors"
import { notFound } from "./helpers/responses"

export type WorldState = {
  name: string
  characters: Array<{
    id: string
    name: string
  }>
}

export async function loadWorldState(
  worldId: string,
  user: { discordId: string } | undefined,
): Promise<WorldState> {
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
