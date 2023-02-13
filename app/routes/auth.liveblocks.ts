import { authorize } from "@liveblocks/node"
import type { ActionArgs } from "@remix-run/node"
import { z } from "zod"
import { getSessionUser } from "~/auth/session.server"
import type {
  CharacterFieldInput,
  CharacterInput,
} from "~/characters/collections"
import { db } from "~/core/db.server"
import { env } from "~/core/env.server"
import type { DiceRollInput } from "~/dice/collections"
import { diceSchema } from "~/dice/collections"
import type { GalleryItemInput } from "~/gallery/gallery-module"
import { raise } from "~/helpers/errors"
import { notFound } from "~/helpers/responses"
import {
  liveblocksFetch,
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

  const world =
    (await db.world.findUnique({
      where: {
        // room id format is `world:<worldId>`
        id: body.room.split(":")[1],
      },
      select: {
        id: true,
        liveblocksRoomVersion: true,
        migratedToLiveblocks: true,
      },
    })) ?? raise(notFound("World not found"))

  if (world.liveblocksRoomVersion < currentRoomVersion) {
    await syncLiveblocksRoom(world.id, body.room)
  }

  if (!world.migratedToLiveblocks) {
    await migrateWorldToLiveblocks(world.id, body.room)
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

async function migrateWorldToLiveblocks(worldId: string, room: string) {
  console.info(`Migrating world ${worldId} to Liveblocks`)

  const world = await db.world.findUniqueOrThrow({
    where: { id: worldId },
    include: {
      characters: {
        include: {
          fieldValues: true,
        },
      },
      characterFields: true,
      clocks: true,
      diceLogs: true,
      galleryItems: true,
    },
  })

  const liveObjectJson = <T>(data: T) => ({
    liveblocksType: "LiveObject",
    data,
  })

  const liveListJson = (data: unknown[]) => ({
    liveblocksType: "LiveList",
    data,
  })

  const liveMapJson = (data: Array<[string, unknown]>) => ({
    liveblocksType: "LiveMap",
    data: Object.fromEntries(data),
  })

  const storage = liveObjectJson({
    characters: liveMapJson(
      world.characters.map((character) => [
        character.id,
        liveObjectJson<CharacterInput>({
          name: character.name,
          momentum: character.momentum,
          stress: character.stress,
          condition: character.condition,
          fieldValues: Object.fromEntries(
            character.fieldValues.map((fieldValue) => [
              fieldValue.fieldId,
              fieldValue.value,
            ]),
          ),
          actionLevels: z.record(z.number()).parse(character.actionLevels),
          hidden: character.hidden,
          color: character.color ?? undefined,
          imageUrl: character.imageUrl ?? undefined,
        }),
      ]),
    ),
    characterFields: liveListJson(
      world.characterFields.map((characterField) =>
        liveObjectJson<CharacterFieldInput>({
          id: characterField.id,
          name: characterField.name,
          description: characterField.description,
          isLong: characterField.isLong,
        }),
      ),
    ),
    clocks: liveMapJson(
      world.clocks.map((clock) => [
        clock.id,
        liveObjectJson({
          name: clock.name,
          progress: clock.progress,
          maxProgress: clock.maxProgress,
        }),
      ]),
    ),
    diceRolls: liveListJson(
      world.diceLogs.slice(-100).map((diceLog) =>
        liveObjectJson<DiceRollInput>({
          intent: diceLog.intent,
          dice: diceSchema.parse(diceLog.dice),
          resultType: diceLog.resultType === "HIGHEST" ? "highest" : "lowest",
          rolledBy: diceLog.rolledById ?? "",
          rolledAt: new Date().toISOString(),
        }),
      ),
    ),
    gallery: liveListJson(
      world.galleryItems.map((galleryItem) =>
        liveObjectJson<GalleryItemInput>({
          id: galleryItem.id,
          caption: galleryItem.caption,
          imageUrl: galleryItem.imageUrl,
          hidden: galleryItem.hidden,
        }),
      ),
    ),
  })

  let response

  response = await liveblocksFetch("DELETE", `/rooms/${room}/storage`)
  if (!response.ok) {
    await throwResponseError(response)
  }

  response = await liveblocksFetch("POST", `/rooms/${room}/storage`, storage)
  if (!response.ok) {
    await throwResponseError(response)
  }

  await db.world.update({
    where: { id: worldId },
    data: {
      migratedToLiveblocks: true,
    },
  })
}
