/* eslint-disable unicorn/no-process-exit */
import "dotenv/config"

import { PrismaClient } from "@prisma/client"
import { defaultCharacterFields } from "../../app/world/default-character-fields.mjs"

const db = new PrismaClient()

for (const world of await db.world.findMany()) {
  const worldFields = defaultCharacterFields.map((field) => ({
    ...field,
    id: `migrated-world:${world.id}-field:${field.legacyField}`,
  }))

  const characters = await db.character.findMany({
    where: { worldId: world.id },
  })

  await db.$transaction([
    db.world.update({
      where: { id: world.id },
      data: {
        characterFields: {
          connectOrCreate: worldFields.map((field) => ({
            where: { id: field.id },
            create: { id: field.id, name: field.name, isLong: field.isLong },
          })),
        },
      },
    }),
    ...characters.map((character) => {
      return db.character.update({
        where: { id: character.id },
        data: {
          fieldValues: {
            connectOrCreate: worldFields.map((field) => ({
              where: {
                characterId_fieldId: {
                  characterId: character.id,
                  fieldId: field.id,
                },
              },
              create: {
                fieldId: field.id,
                value: character[field.legacyField],
              },
            })),
          },
        },
      })
    }),
  ])
}
