import { ChevronsRight, Dices } from "lucide-react"
import {
  characterActionLibrary,
  type ActionDetails,
} from "../data/character-actions"
import type { Character } from "../data/character-collections"
import { entriesTyped } from "../helpers/entries-typed"
import { CharacterActionRollButton } from "./character-action-roll-button"
import { DotCounter } from "./counter"

export function CharacterActionLevelsEditor({
  readOnly,
  character,
  onCharacterChange,
}: {
  readOnly: boolean
  character: Character
  onCharacterChange: (character: Partial<Character>) => void
}) {
  return (
    <div className="@container">
      <div className="grid gap-2 @lg:grid-cols-3">
        {entriesTyped(characterActionLibrary).map(([category, actions]) => (
          <section key={category} className="flex flex-col p-4 panel">
            <h4 className="mb-4 text-center text-xl leading-tight tracking-wide">
              {category}
            </h4>
            <div className="grid w-full flex-1 content-between gap-4">
              {actions.map((action) => (
                <ActionEditor
                  key={action.id}
                  character={character}
                  action={action}
                  level={character.actionLevels[action.id] ?? 0}
                  diceButtonsVisible={!readOnly}
                  onLevelChange={(level) => {
                    if (readOnly) return
                    onCharacterChange({
                      actionLevels: {
                        ...character.actionLevels,
                        [action.id]: level,
                      },
                    })
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ActionEditor({
  character,
  action,
  level,
  onLevelChange,
  diceButtonsVisible,
}: {
  character: { name: string }
  action: ActionDetails
  level: number
  onLevelChange: (level: number) => void
  diceButtonsVisible: boolean
}) {
  return (
    <section>
      <h5>{action.name}</h5>
      <p className="mb-1.5 text-sm opacity-75">{action.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1">
          <DotCounter value={level} max={4} onChange={onLevelChange} />
        </div>
        {diceButtonsVisible && (
          <div className="flex gap-2">
            <CharacterActionRollButton
              title={`Roll ${action.name}`}
              intent={`${character.name}: ${action.name}`}
              poolSize={level}
            >
              <Dices />
            </CharacterActionRollButton>
            <CharacterActionRollButton
              title={`Roll ${action.name} with momentum`}
              intent={`${character.name}: ${action.name} (+1)`}
              poolSize={level + 1}
            >
              <ChevronsRight />
            </CharacterActionRollButton>
          </div>
        )}
      </div>
    </section>
  )
}
