import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"
import { requireSessionUser } from "../../auth/session.server"
import { db } from "../../core/db.server"
import type { Character, Prisma } from "../../generated/prisma"
import { FormAction, FormActionGroup } from "../../helpers/form"
import { parseKeys } from "../../helpers/parse-keys"
import { parseUnsignedInteger } from "../../helpers/parse-unsigned-integer"
import { getWorldEmitter } from "../worlds.$worldId.events/emitter"
import { CharacterManager } from "./character-manager"

const addCharacterAction = new FormAction({
  fields: {},
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    await db.character.create({
      data: { worldId: params.worldId!, ownerId: user.id },
    })
    getWorldEmitter(params.worldId!).emit("update")
  },
})

const removeCharacterAction = new FormAction({
  fields: {
    id: z.string(),
  },
  async action(values, { request, params }) {
    await requireSessionUser(request)
    await db.character.delete({
      where: { id: values.id },
    })
    getWorldEmitter(params.worldId!).emit("update")
  },
})

const updateCharacterAction = new FormAction({
  fields: {
    id: z.string().optional(),
    name: z.string().optional(),
    group: z.string().optional(),
    concept: z.string().optional(),
    appearance: z.string().optional(),
    ties: z.string().optional(),
    momentum: z.string().transform(parseUnsignedInteger).optional(),
    stress: z.string().transform(parseUnsignedInteger).optional(),
    condition: z.string().optional(),
    actionLevels: z
      .string()
      .transform((json): Prisma.InputJsonValue => JSON.parse(json))
      .optional(),
    talents: z.string().optional(),
    hidden: z
      .string()
      .transform((value) => value === "true")
      .optional(),
    color: z.string().optional(),
    imageUrl: z.string().optional(),
  },
  async action({ id, ...data }, { params }) {
    await db.character.update({
      where: { id },
      data,
    })
    getWorldEmitter(params.worldId!).emit("update")
  },
})

const characterActions = new FormActionGroup({
  addCharacterAction,
  removeCharacterAction,
  updateCharacterAction,
})

export async function action({ request, params, ...args }: ActionArgs) {
  return characterActions.handleSubmit({ request, params, ...args })
}

export function CharactersModule({ characters }: { characters: Character[] }) {
  const fetcher = useFetcher<typeof action>()
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const thisRoute = route("/worlds/:worldId/characters", { worldId })
  return (
    <CharacterManager
      characters={characters}
      onAdd={() => {
        fetcher.submit(characterActions.formData("addCharacterAction", {}), {
          action: thisRoute,
          method: "post",
        })
      }}
      onRemove={(id) => {
        fetcher.submit(
          characterActions.formData("removeCharacterAction", { id }),
          {
            action: thisRoute,
            method: "post",
          },
        )
      }}
      onUpdate={(id, data) => {
        fetcher.submit(
          characterActions.formData("updateCharacterAction", {
            id,
            ...data,
            momentum: data.momentum ? String(data.momentum) : undefined,
            stress: data.stress ? String(data.stress) : undefined,
            actionLevels: data.actionLevels
              ? JSON.stringify(data.actionLevels)
              : undefined,
            hidden: data.hidden ? "true" : "false",
            color: data.color ?? undefined,
            imageUrl: data.imageUrl ?? undefined,
          }),
          {
            action: thisRoute,
            method: "post",
          },
        )
      }}
    />
  )
}
