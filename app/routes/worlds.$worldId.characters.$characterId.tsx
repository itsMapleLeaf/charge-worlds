import { useParams } from "@remix-run/react"
import { rgba } from "polished"
import { assert } from "~/helpers/assert"
import { CharacterActionLevelsEditor } from "~/modules/characters/character-action-levels-editor"
import { characterActionLibrary } from "~/modules/characters/character-actions"
import { CharacterColorButton } from "~/modules/characters/character-color-button"
import {
  characterColors,
  defaultCharacterColor,
} from "~/modules/characters/character-colors"
import { CharacterDeleteButton } from "~/modules/characters/character-delete-button"
import { CharacterFieldsEditor } from "~/modules/characters/character-fields-editor"
import { CharacterHideButton } from "~/modules/characters/character-hide-button"
import { CharacterPrimaryInfoEditor } from "~/modules/characters/character-primary-info-editor"
import {
  CharacterCollection,
  CharacterFieldCollection,
} from "~/modules/characters/collections"
import { dividerClass, labelTextClass } from "~/modules/ui/styles"
import { WorldContext } from "~/modules/world/world-context"

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
      className="grid gap-4 p-4 panel"
      style={{
        backgroundColor: rgba(colorClasses.background, 0.75),
        borderColor: rgba(colorClasses.border, 0.25),
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

      <hr className={dividerClass} />

      <CharacterPrimaryInfoEditor
        character={currentCharacter}
        onCharacterChange={(data) => {
          mutations.update(currentCharacter._id, data)
        }}
        isGameMaster={isOwner}
        isSpectator={isSpectator}
      />

      <hr className={dividerClass} />

      <section className="grid gap-2">
        <h3 className={labelTextClass}>Actions ({actionLevelTotal})</h3>
        <CharacterActionLevelsEditor
          character={currentCharacter}
          onCharacterChange={(data) => {
            mutations.update(currentCharacter._id, data)
          }}
          readOnly={isSpectator}
        />
      </section>

      <hr className={dividerClass} />

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
