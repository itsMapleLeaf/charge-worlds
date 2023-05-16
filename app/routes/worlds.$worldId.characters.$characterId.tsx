import { useParams } from "@remix-run/react"
import { CharacterActionLevelsEditor } from "~/components/character-action-levels-editor"
import { CharacterColorButton } from "~/components/character-color-button"
import { CharacterDeleteButton } from "~/components/character-delete-button"
import { CharacterFieldsEditor } from "~/components/character-fields-editor"
import { CharacterHideButton } from "~/components/character-hide-button"
import { CharacterPrimaryInfoEditor } from "~/components/character-primary-info-editor"
import { WorldContext } from "~/components/world-context"
import { characterActionLibrary } from "~/data/character-actions"
import {
  CharacterCollection,
  CharacterFieldCollection,
} from "~/data/character-collections"
import { characterColors, defaultCharacterColor } from "~/data/character-colors"
import { assert } from "~/helpers/assert"

export default function CharacterPage() {
  const { isPlayer, isOwner, isSpectator } = WorldContext.useValue()

  const { characterId } = useParams()
  assert(characterId, "characterId is required")

  let characters = CharacterCollection.useItems()
  if (!isOwner) {
    characters = characters.filter((character) => !character.hidden)
  }

  const mutations = CharacterCollection.useMutations()
  const fields = CharacterFieldCollection.useItems()

  const currentCharacter =
    characters.find((character) => character._id === characterId) ??
    characters[0]

  const colorClasses =
    characterColors[currentCharacter?.color ?? "gray"] ?? defaultCharacterColor

  if (currentCharacter == null) {
    return <p>No characters found</p>
  }

  const actionLevelTotal = Object.values(characterActionLibrary)
    .flat()
    .map((action) => currentCharacter.actionLevels[action.id] ?? 0)
    .reduce((total, next) => next + total)

  return (
    <div
      className="panel glass grid gap-4 p-4"
      style={{
        backgroundColor: colorClasses.background,
        borderColor: colorClasses.border,
      }}
    >
      <div className="flex flex-wrap gap-4">
        {(isOwner || isPlayer) && (
          <CharacterColorButton
            onSelectColor={(color) => {
              mutations.update(currentCharacter._id, { color })
            }}
          />
        )}
        {isOwner && (
          <CharacterHideButton
            hidden={currentCharacter.hidden}
            onHiddenChange={(hidden) => {
              mutations.update(currentCharacter._id, { hidden })
            }}
          />
        )}
        <div className="flex-1" />
        {isOwner && (
          <CharacterDeleteButton
            character={currentCharacter}
            onDelete={() => {
              mutations.remove(currentCharacter._id)
            }}
          />
        )}
      </div>

      <hr className="border-white/10" />

      <CharacterPrimaryInfoEditor
        character={currentCharacter}
        onCharacterChange={(data) => {
          mutations.update(currentCharacter._id, data)
        }}
        isGameMaster={isOwner}
        isSpectator={isSpectator}
      />

      <hr className="border-white/10" />

      <section className="grid gap-2">
        <h3 className="label">Actions ({actionLevelTotal})</h3>
        <CharacterActionLevelsEditor
          character={currentCharacter}
          onCharacterChange={(data) => {
            mutations.update(currentCharacter._id, data)
          }}
          readOnly={isSpectator}
        />
      </section>

      <hr className="border-white/10" />

      <CharacterFieldsEditor
        fields={fields}
        fieldValues={currentCharacter.fieldValues}
        readOnly={isSpectator}
        onChange={(fieldId, value) => {
          mutations.update(currentCharacter._id, {
            fieldValues: {
              ...currentCharacter.fieldValues,
              [fieldId]: value,
            },
          })
        }}
      />
    </div>
  )
}
