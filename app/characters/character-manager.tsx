import clsx from "clsx"
import { EyeOff, Plus } from "lucide-react"
import { useState } from "react"
import {
  clearButtonClass,
  dividerClass,
  maxWidthContainerClass,
  navLinkClass,
} from "../ui/styles"
import { CharacterColorButton } from "./character-color-button"
import { characterColors } from "./character-colors"
import { CharacterDeleteButton } from "./character-delete-button"
import { CharacterHideButton } from "./character-hide-button"
import type { Character } from "./character-schema"
import { CharacterSheetEditor } from "./character-sheet-editor"

export function CharacterManager({
  characters,
  onAdd,
  onRemove,
  onUpdate,
}: {
  characters: Character[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, data: Partial<Character>) => void
}) {
  const [currentCharacterId, setCurrentCharacterId] = useState(
    characters[0]?.id,
  )
  const currentCharacter =
    characters.find((character) => character.id === currentCharacterId) ??
    characters[0]

  const colorClasses =
    characterColors[currentCharacter?.color ?? "gray"] ?? characterColors.gray!

  let isAdmin = true

  return (
    <div
      className={clsx("transition-colors min-h-full", colorClasses.background)}
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
                {character.name || "Unnamed"}{" "}
                {character.hidden && <EyeOff size={16} />}
              </button>
            ))}
            <button
              className={clearButtonClass}
              onClick={() => onAdd("New Character")}
            >
              <Plus />
              Add new
            </button>
          </nav>
          {currentCharacter && (
            <>
              <hr className={dividerClass} />
              <CharacterSheetEditor
                character={currentCharacter}
                readonlyMomentum={!isAdmin}
                footer={
                  <>
                    <section className="flex flex-wrap gap-4">
                      <CharacterColorButton
                        onSelectColor={(color) => {
                          onUpdate(currentCharacter.id, { color })
                        }}
                      />
                      {isAdmin && (
                        <CharacterHideButton
                          hidden={currentCharacter.hidden}
                          onHiddenChange={(hidden) => {
                            onUpdate(currentCharacter.id, { hidden })
                          }}
                        />
                      )}
                      <div className="flex-1" />
                      {isAdmin && (
                        <CharacterDeleteButton
                          character={currentCharacter}
                          onDelete={() => onRemove(currentCharacter.id)}
                        />
                      )}
                    </section>
                  </>
                }
                onCharacterChange={(data) =>
                  onUpdate(currentCharacter.id, data)
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
