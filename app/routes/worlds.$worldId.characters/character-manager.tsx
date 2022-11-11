import clsx from "clsx"
import { EyeOff, Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../auth/auth-context"
import type { Character } from "../../generated/prisma"
import { useDebouncedCallback } from "../../helpers/use-debounced-callback"
import {
  clearButtonClass,
  dividerClass,
  maxWidthContainerClass,
  navLinkClass,
} from "../../ui/styles"
import { characterColors } from "./character-colors"
import { CharacterSheetEditor } from "./character-sheet-editor"

export function CharacterManager({
  characters: charactersProp,
  onAdd,
  onRemove,
  onUpdate,
}: {
  characters: Character[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, data: Partial<Character>) => void
}) {
  const auth = useContext(AuthContext)

  const [characters, setCharacters] = useState(charactersProp)
  useEffect(() => {
    setCharacters(charactersProp)
  }, [charactersProp])

  const onUpdateDebounced = useDebouncedCallback(onUpdate, 800)
  const handleChange = (id: string, data: Partial<Character>) => {
    setCharacters((characters) => {
      return characters.map((character) => {
        return character.id === id ? { ...character, ...data } : character
      })
    })
    onUpdateDebounced(id, data)
  }

  const [currentCharacterId, setCurrentCharacterId] = useState(
    characters[0]?.id,
  )
  const currentCharacter =
    characters.find((character) => character.id === currentCharacterId) ??
    characters[0]

  const colorClasses =
    characterColors[currentCharacter?.color ?? "gray"] ?? characterColors.gray!

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
            {auth.membership?.role === "OWNER" && (
              <button className={clearButtonClass} onClick={onAdd}>
                <Plus />
                Add new
              </button>
            )}
          </nav>
          {currentCharacter && (
            <>
              <hr className={dividerClass} />
              <CharacterSheetEditor
                character={currentCharacter}
                onCharacterChange={(data) => {
                  handleChange(currentCharacter.id, data)
                }}
                onDelete={() => {
                  onRemove(currentCharacter.id)
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
