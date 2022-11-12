import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { route } from "routes-gen"
import { z } from "zod"
import { requireSessionUser } from "../../auth/session.server"
import { db } from "../../core/db.server"
import type { Character } from "../../generated/prisma"
import { FormAction, FormActionGroup } from "../../helpers/form"
import { parseKeys } from "../../helpers/parse-keys"
import { parseUnsignedInteger } from "../../helpers/parse-unsigned-integer"
import { emitWorldUpdate } from "../worlds.$worldId.events/emitter"
import { CharacterManager } from "./character-manager"

const addCharacterAction = new FormAction({
  fields: {},
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    await db.character.create({
      data: { worldId: params.worldId!, ownerId: user.id },
    })
    emitWorldUpdate(params.worldId!, user.id)
  },
})

const removeCharacterAction = new FormAction({
  fields: {
    id: z.string(),
  },
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    await db.character.delete({
      where: { id: values.id },
    })
    emitWorldUpdate(params.worldId!, user.id)
  },
})

const updateCharacterAction = new FormAction({
  fields: {
    id: z.string(),
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
      .transform((json) => JSON.parse(json))
      .optional(),
    talents: z.string().optional(),
    hidden: z
      .string()
      .optional()
      .transform((value) => {
        return value === "true" ? true : value === "false" ? false : undefined
      }),
    color: z.string().optional(),
    imageUrl: z.string().optional(),
  },
  async action({ id, ...data }, { request, params }) {
    const user = await requireSessionUser(request)
    await db.character.update({
      where: { id },
      data,
    })
    emitWorldUpdate(params.worldId!, user.id)
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

export function CharactersModule(props: { characters: Character[] }) {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const fetcher = useFetcher<typeof action>()
  const actionRoute = route("/worlds/:worldId/characters", { worldId })

  let characters = props.characters

  const updateSubmission = updateCharacterAction.parseSubmission(
    fetcher.submission?.formData,
  )
  if (updateSubmission) {
    characters = characters.map((c) =>
      c.id === updateSubmission.id ? { ...c, ...updateSubmission } : c,
    )
  }

  return (
    <CharacterManager
      characters={characters}
      onAdd={() => {
        fetcher.submit(characterActions.formData("addCharacterAction", {}), {
          action: actionRoute,
          method: "post",
        })
      }}
      onRemove={(id) => {
        fetcher.submit(
          characterActions.formData("removeCharacterAction", { id }),
          {
            action: actionRoute,
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
            hidden: data.hidden !== undefined ? String(data.hidden) : undefined,
            color: data.color ?? undefined,
            imageUrl: data.imageUrl ?? undefined,
          }),
          {
            action: actionRoute,
            method: "post",
          },
        )
      }}
    />
  )
}
