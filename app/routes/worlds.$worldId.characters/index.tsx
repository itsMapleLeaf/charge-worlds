import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import clsx from "clsx"
import produce from "immer"
import { EyeOff, Plus } from "lucide-react"
import { useContext, useState } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import type { Character } from "../../../generated/prisma"
import { AuthContext } from "../../auth/auth-context"
import { requireSessionUser } from "../../auth/session.server"
import { db } from "../../core/db.server"
import { FormAction, FormActionGroup } from "../../helpers/form"
import { parseKeys } from "../../helpers/parse-keys"
import { parseUnsignedInteger } from "../../helpers/parse-unsigned-integer"
import {
  clearButtonClass,
  dividerClass,
  labelTextClass,
  maxWidthContainerClass,
  navLinkClass,
} from "../../ui/styles"
import { emitWorldUpdate } from "../worlds.$worldId.events/emitter"
import { CharacterActionLevelsEditor } from "./character-action-levels-editor"
import { CharacterColorButton } from "./character-color-button"
import { characterColors, defaultCharacterColor } from "./character-colors"
import { CharacterDeleteButton } from "./character-delete-button"
import type { CharacterFieldsEditorProps } from "./character-fields-editor"
import { CharacterFieldsEditor } from "./character-fields-editor"
import { CharacterHideButton } from "./character-hide-button"
import { CharacterPrimaryInfoEditor } from "./character-primary-info-editor"

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
    name: z.string().max(128).optional(),
    group: z.string().max(128).optional(),
    concept: z.string().max(50_000).optional(),
    appearance: z.string().max(50_000).optional(),
    ties: z.string().max(50_000).optional(),
    condition: z.string().max(50_000).optional(),
    talents: z.string().max(50_000).optional(),
    momentum: z.string().transform(parseUnsignedInteger).optional(),
    stress: z.string().transform(parseUnsignedInteger).optional(),
    actionLevels: z
      .string()
      .transform((json) => JSON.parse(json))
      .optional(),
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

const updateCharacterFieldValueAction = new FormAction({
  fields: {
    characterId: z.string(),
    fieldId: z.string(),
    value: z.string().max(50_000),
  },
  async action({ characterId, fieldId, value }, { request, params }) {
    const user = await requireSessionUser(request)
    await db.characterFieldValue.upsert({
      where: { characterId_fieldId: { characterId, fieldId } },
      create: { characterId, fieldId, value },
      update: { value },
    })
    emitWorldUpdate(params.worldId!, user.id)
  },
})

const characterActions = new FormActionGroup({
  addCharacterAction,
  removeCharacterAction,
  updateCharacterAction,
  updateCharacterFieldValueAction,
})

export async function action({ request, params, ...args }: ActionArgs) {
  return characterActions.handleSubmit({ request, params, ...args })
}

export function CharactersModule(props: {
  characterFields: CharacterFieldsEditorProps["fields"]
  characters: Array<
    Character & { fieldValues: CharacterFieldsEditorProps["fieldValues"] }
  >
}) {
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

  const updateFieldValueSubmission =
    updateCharacterFieldValueAction.parseSubmission(
      fetcher.submission?.formData,
    )
  if (updateFieldValueSubmission) {
    characters = produce(characters, (draft) => {
      const character = draft.find(
        (c) => c.id === updateFieldValueSubmission.characterId,
      )
      if (!character) return

      character.fieldValues[updateFieldValueSubmission.fieldId] =
        updateFieldValueSubmission.value
    })
  }

  const auth = useContext(AuthContext)
  const isPlayer = auth.membership?.role === "PLAYER"
  const isGameMaster = auth.membership?.role === "OWNER"
  const isSpectator = !auth.membership

  const [currentCharacterId, setCurrentCharacterId] = useState(
    characters[0]?.id,
  )
  const currentCharacter =
    characters.find((character) => character.id === currentCharacterId) ??
    characters[0]

  const addCharacter = () => {
    fetcher.submit(characterActions.formData("addCharacterAction", {}), {
      action: actionRoute,
      method: "post",
    })
  }

  const updateCharacter = (data: Partial<Character>): void => {
    if (!currentCharacter) return
    fetcher.submit(
      characterActions.formData("updateCharacterAction", {
        id: currentCharacter.id,
        ...data,
        momentum:
          data.momentum !== undefined ? String(data.momentum) : undefined,
        stress: data.stress !== undefined ? String(data.stress) : undefined,
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
  }

  const removeCharacter = (): void => {
    if (!currentCharacter) return
    fetcher.submit(
      characterActions.formData("removeCharacterAction", {
        id: currentCharacter.id,
      }),
      {
        action: actionRoute,
        method: "post",
      },
    )
  }

  const colorClasses =
    characterColors[currentCharacter?.color ?? "gray"] ?? defaultCharacterColor

  return (
    <div
      className={clsx("min-h-full transition-colors", colorClasses.background)}
    >
      <div className={maxWidthContainerClass}>
        <div className="flex flex-col gap-4 p-4">
          <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
            {characters.map((character) => (
              <button
                key={character.id}
                className={navLinkClass({
                  isActive: character === currentCharacter,
                })}
                onClick={() => setCurrentCharacterId(character.id)}
              >
                {character.name || "Unnamed"}
                {character.hidden && <EyeOff size={16} />}
              </button>
            ))}

            {auth.membership?.role === "OWNER" && (
              <button className={clearButtonClass} onClick={addCharacter}>
                <Plus />
                Add new
              </button>
            )}
          </nav>

          {currentCharacter == null ? (
            <p>No characters found</p>
          ) : (
            <>
              <hr className={dividerClass} />

              <div className="flex flex-col gap-4">
                <CharacterPrimaryInfoEditor
                  character={currentCharacter}
                  onCharacterChange={updateCharacter}
                  isGameMaster={isGameMaster}
                  isSpectator={isSpectator}
                />

                <hr className={dividerClass} />

                <section className="grid gap-2">
                  <h3 className={labelTextClass}>Actions</h3>
                  <CharacterActionLevelsEditor
                    character={currentCharacter}
                    onCharacterChange={updateCharacter}
                    readOnly={isSpectator}
                  />
                </section>

                <hr className={dividerClass} />

                <div className="grid gap-4">
                  <CharacterFieldsEditor
                    fields={props.characterFields}
                    fieldValues={currentCharacter.fieldValues}
                    readOnly={isSpectator}
                    onChange={(fieldId, value) => {
                      fetcher.submit(
                        characterActions.formData(
                          "updateCharacterFieldValueAction",
                          {
                            characterId: currentCharacter.id,
                            fieldId,
                            value,
                          },
                        ),
                        { action: actionRoute, method: "post" },
                      )
                    }}
                  />
                </div>

                <hr className={dividerClass} />

                <section className="flex flex-wrap gap-4">
                  {(isGameMaster || isPlayer) && (
                    <CharacterColorButton
                      onSelectColor={(color) => {
                        updateCharacter({ color })
                      }}
                    />
                  )}
                  {isGameMaster && (
                    <CharacterHideButton
                      hidden={currentCharacter.hidden}
                      onHiddenChange={(hidden) => {
                        updateCharacter({ hidden })
                      }}
                    />
                  )}
                  <div className="flex-1" />
                  {isGameMaster && (
                    <CharacterDeleteButton
                      character={currentCharacter}
                      onDelete={removeCharacter}
                    />
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
