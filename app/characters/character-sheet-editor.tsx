import clsx from "clsx"
import { ChevronsRight, Dices } from "lucide-react"
import { useContext } from "react"
import TextArea from "react-expanding-textarea"
import { AuthContext } from "../auth/auth-context"
import { Clock } from "../clocks/clock"
import type { Character } from "../generated/prisma"
import { entriesTyped } from "../helpers/entries-typed"
import { Counter, DotCounter } from "../ui/counter"
import { Field } from "../ui/field"
import {
  dividerClass,
  inputClass,
  labelTextClass,
  textAreaClass,
} from "../ui/styles"
import { CharacterActionRollButton } from "./character-action-roll-button"
import { characterActionLibrary } from "./character-actions"
import { CharacterColorButton } from "./character-color-button"
import { CharacterDeleteButton } from "./character-delete-button"
import { CharacterHideButton } from "./character-hide-button"
import { CharacterImage } from "./character-image"

export function CharacterSheetEditor({
  character,
  onCharacterChange,
  onDelete,
}: {
  character: Character
  onCharacterChange: (character: Partial<Character>) => void
  onDelete: () => void
}) {
  const auth = useContext(AuthContext)
  const isPlayer = auth.membership?.role === "PLAYER"
  const isGameMaster = auth.membership?.role === "OWNER"
  const isSpectator = !auth.membership

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
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap [&>*]:basis-48 [&>*]:flex-1">
        <div className="min-h-[20rem]">
          <CharacterImage src={character.imageUrl ?? undefined} />
        </div>

        <div className="grid content-between gap-4">
          <Field label="Name">
            <input
              type="text"
              placeholder="What should we call you?"
              value={character.name}
              onChange={(e) => onCharacterChange({ name: e.target.value })}
              className={inputClass}
              readOnly={isSpectator}
            />
          </Field>
          <Field label="Group">
            <input
              type="text"
              placeholder="Whom do you side with?"
              value={character.group}
              onChange={(e) => onCharacterChange({ group: e.target.value })}
              className={inputClass}
              readOnly={isSpectator}
            />
          </Field>
          <Field label="Reference image">
            <input
              className={inputClass}
              placeholder="https://the/image.png"
              value={character.imageUrl ?? ""}
              onChange={(event) =>
                onCharacterChange({ imageUrl: event.target.value })
              }
              readOnly={isSpectator}
            />
          </Field>
          <section>
            <h2 className={labelTextClass}>Momentum</h2>
            <div className={clsx(inputClass, "grid place-items-center")}>
              {isGameMaster ? (
                <Counter
                  value={character.momentum}
                  onChange={(momentum) => onCharacterChange({ momentum })}
                />
              ) : (
                <p className="font-medium">{character.momentum}</p>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-md bg-black/25 p-4 flex items-center justify-center">
            <Clock
              name="Stress"
              progress={character.stress}
              maxProgress={4}
              onProgressChange={(stress) => {
                isGameMaster && onCharacterChange({ stress })
              }}
            />
          </div>
          <Field label="Condition">
            <TextArea
              placeholder="How're you doing?"
              value={character.condition}
              onChange={(e) => onCharacterChange({ condition: e.target.value })}
              className={textAreaClass}
              readOnly={isSpectator}
            />
          </Field>
        </div>
      </div>

      <hr className={dividerClass} />

      <section>
        <h3 className={labelTextClass}>Actions</h3>
        <div className="flex flex-wrap gap-4 [&>*]:flex-1 [&>*]:basis-52">
          {entriesTyped(characterActionLibrary).map(([category, actions]) => (
            <section
              key={category}
              className="flex flex-col rounded-md bg-black/25 p-4"
            >
              <h4 className="mb-4 text-center text-xl leading-tight tracking-wide">
                {category}
              </h4>
              <div className="grid gap-4">
                {actions.map((action) => (
                  <section
                    key={action}
                    className="grid grid-flow-row grid-cols-[1fr,auto] grid-rows-[auto,auto]"
                  >
                    <h5 className={labelTextClass}>{action}</h5>

                    <div
                      className="row-span-2 flex items-end relative gap-2"
                      style={{ left: "0.25rem" }}
                    >
                      {!isSpectator && (
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
                        if (isSpectator) return
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
      </section>

      <hr className={dividerClass} />

      <div className="grid gap-4">
        <Field label="Concept">
          <TextArea
            placeholder="Describe yourself."
            value={character.concept}
            onChange={(e) => onCharacterChange({ concept: e.target.value })}
            className={textAreaClass}
            readOnly={isSpectator}
          />
        </Field>
        <Field label="Appearance">
          <TextArea
            placeholder="How do you look? What do you like to wear?"
            value={character.appearance}
            onChange={(e) => onCharacterChange({ appearance: e.target.value })}
            className={textAreaClass}
            readOnly={isSpectator}
          />
        </Field>
        <Field label="Ties">
          <TextArea
            placeholder="Who are your friends, family, and enemies?"
            value={character.ties}
            onChange={(e) => onCharacterChange({ ties: e.target.value })}
            className={textAreaClass}
            readOnly={isSpectator}
          />
        </Field>
        <Field label="Talents">
          <TextArea
            placeholder="stat buffs stat buffs stat buffs"
            value={character.talents}
            onChange={(e) => onCharacterChange({ talents: e.target.value })}
            className={textAreaClass}
            readOnly={isSpectator}
          />
        </Field>
      </div>

      <hr className={dividerClass} />

      <section className="flex flex-wrap gap-4">
        {(isGameMaster || isPlayer) && (
          <CharacterColorButton
            onSelectColor={(color) => {
              onCharacterChange({ color })
            }}
          />
        )}
        {isGameMaster && (
          <CharacterHideButton
            hidden={character.hidden}
            onHiddenChange={(hidden) => {
              onCharacterChange({ hidden })
            }}
          />
        )}
        <div className="flex-1" />
        {isGameMaster && (
          <CharacterDeleteButton character={character} onDelete={onDelete} />
        )}
      </section>
    </div>
  )
}
