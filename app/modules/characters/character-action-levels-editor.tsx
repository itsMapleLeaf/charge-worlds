import { cx } from "class-variance-authority"
import { ChevronsRight, Dices } from "lucide-react"
import { entriesTyped } from "../../helpers/entries-typed"
import { DotCounter } from "../ui/counter"
import { panel } from "../ui/panel"
import { labelTextClass } from "../ui/styles"
import { CharacterActionRollButton } from "./character-action-roll-button"
import { characterActionLibrary } from "./character-actions"
import type { Character } from "./collections"

export function CharacterActionLevelsEditor({
  readOnly,
  character,
  onCharacterChange,
}: {
  readOnly: boolean
  character: Character
  onCharacterChange: (character: Partial<Character>) => void
}) {
  const actionLevels: Record<string, number> = {}
  if (
    typeof character.actionLevels === "object" &&
    character.actionLevels !== null
  ) {
    for (const [key, value] of Object.entries(character.actionLevels)) {
      if (typeof value === "number") {
        actionLevels[key] = value
      }
    }
  }

  return (
    <div className="flex flex-wrap gap-4 [&>*]:flex-1 [&>*]:basis-52">
      {entriesTyped(characterActionLibrary).map(([category, actions]) => (
        <section
          key={category}
          className={cx(panel({ shadow: "none" }), "flex flex-col p-4")}
        >
          <h4 className="mb-4 text-center text-xl leading-tight tracking-wide">
            {category}
          </h4>
          <div className="grid gap-4">
            {actions.map((action) => (
              <section
                key={action}
                className="grid grid-flow-row grid-cols-[1fr,auto] grid-rows-[auto,auto] gap-y-2"
              >
                <h5 className={labelTextClass}>{action}</h5>

                <div
                  className="relative row-span-2 flex items-end gap-2"
                  style={{ left: "0.25rem" }}
                >
                  {!readOnly && (
                    <>
                      <CharacterActionRollButton
                        title={`Roll ${action}`}
                        intent={`${character.name}: ${action}`}
                        poolSize={(actionLevels[action] ?? 0) + 1}
                      >
                        <Dices />
                      </CharacterActionRollButton>
                      <CharacterActionRollButton
                        title={`Roll ${action} with momentum`}
                        intent={`${character.name}: ${action} (+1)`}
                        poolSize={(actionLevels[action] ?? 0) + 2}
                      >
                        <ChevronsRight />
                      </CharacterActionRollButton>
                    </>
                  )}
                </div>

                <DotCounter
                  value={actionLevels[action] ?? 0}
                  max={4}
                  onChange={(level) => {
                    if (readOnly) return
                    onCharacterChange({
                      actionLevels: {
                        ...actionLevels,
                        [action]: level,
                      },
                    })
                  }}
                />
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
