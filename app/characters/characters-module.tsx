import clsx from "clsx"
import { EyeOff, Plus, Users } from "lucide-react"
import { useState } from "react"
import { useAuthContext } from "../auth/auth-context"
import { DashboardModule } from "../dashboard/dashboard-module"
import {
  clearButtonClass,
  dividerClass,
  labelTextClass,
  maxWidthContainerClass,
  navLinkClass,
} from "../ui/styles"
import { CharacterActionLevelsEditor } from "./character-action-levels-editor"
import { CharacterColorButton } from "./character-color-button"
import { characterColors, defaultCharacterColor } from "./character-colors"
import { CharacterDeleteButton } from "./character-delete-button"
import { CharacterFieldsEditor } from "./character-fields-editor"
import { CharacterHideButton } from "./character-hide-button"
import { CharacterPrimaryInfoEditor } from "./character-primary-info-editor"
import { CharacterCollection, CharacterFieldCollection } from "./collections"

export const charactersModule = new DashboardModule({
  name: "Characters",
  description: "Manage your characters",
  icon: <Users />,

  component: function CharactersModuleView() {
    const characters = CharacterCollection.useItems()
    const mutations = CharacterCollection.useMutations()
    const fields = CharacterFieldCollection.useItems()
    const { isPlayer, isOwner, isSpectator } = useAuthContext()

    const [currentCharacterId, setCurrentCharacterId] = useState(
      characters[0]?._id,
    )
    const currentCharacter =
      characters.find((character) => character._id === currentCharacterId) ??
      characters[0]

    const colorClasses =
      characterColors[currentCharacter?.color ?? "gray"] ??
      defaultCharacterColor

    return (
      <div
        className={clsx(
          "min-h-full transition-colors",
          colorClasses.background,
        )}
      >
        <div className={maxWidthContainerClass}>
          <div className="flex flex-col gap-4 p-4">
            <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
              {characters.map((character) => (
                <button
                  key={character._id}
                  className={navLinkClass({
                    isActive: character === currentCharacter,
                  })}
                  onClick={() => setCurrentCharacterId(character._id)}
                >
                  {character.name || "Unnamed"}
                  {character.hidden && <EyeOff size={16} />}
                </button>
              ))}

              {isOwner && (
                <button
                  className={clearButtonClass}
                  onClick={() => mutations.create({})}
                >
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
                    onCharacterChange={(data) => {
                      mutations.update(currentCharacter._id, data)
                    }}
                    isGameMaster={isOwner}
                    isSpectator={isSpectator}
                  />

                  <hr className={dividerClass} />

                  <section className="grid gap-2">
                    <h3 className={labelTextClass}>Actions</h3>
                    <CharacterActionLevelsEditor
                      character={currentCharacter}
                      onCharacterChange={(data) => {
                        mutations.update(currentCharacter._id, data)
                      }}
                      readOnly={isSpectator}
                    />
                  </section>

                  <hr className={dividerClass} />

                  <div className="grid gap-4">
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

                  <hr className={dividerClass} />

                  <section className="flex flex-wrap gap-4">
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
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  },
})
