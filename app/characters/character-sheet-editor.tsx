import clsx from "clsx"
import TextArea from "react-expanding-textarea"
import { Clock } from "../clocks/clock"
import { entriesTyped } from "../helpers/entries-typed"
import { Counter, DotCounter } from "../ui/counter"
import { Field } from "../ui/field"
import {
  dividerClass,
  inputClass,
  labelTextClass,
  textAreaClass,
} from "../ui/styles"
import { characterActionLibrary } from "./character-actions"
import { CharacterImageInput } from "./character-image-input"
import type { Character } from "./character-schema"

export function CharacterSheetEditor({
  character,
  readonlyMomentum,
  footer,
  onCharacterChange,
}: {
  character: Character
  readonlyMomentum?: boolean
  footer: React.ReactNode
  onCharacterChange: (character: Partial<Character>) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 flex-wrap [&>*]:basis-48 [&>*]:flex-1">
        <div className="min-h-[20rem]">
          <CharacterImageInput
            character={character}
            onImageChange={(imageUrl) => onCharacterChange({ imageUrl })}
          />
        </div>

        <div className="grid content-between gap-4">
          <Field label="Name">
            <input
              type="text"
              placeholder="What should we call you?"
              value={character.name}
              onChange={(e) => onCharacterChange({ name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Group">
            <input
              type="text"
              placeholder="Whom do you side with?"
              value={character.group}
              onChange={(e) => onCharacterChange({ group: e.target.value })}
              className={inputClass}
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
            />
          </Field>
          <section>
            <h2 className={labelTextClass}>Momentum</h2>
            <div className={clsx(inputClass, "grid place-items-center")}>
              {readonlyMomentum ? (
                <p className="font-medium">{character.momentum}</p>
              ) : (
                <Counter
                  value={character.momentum}
                  onChange={(momentum) => onCharacterChange({ momentum })}
                />
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
              onProgressChange={(stress) => onCharacterChange({ stress })}
            />
          </div>
          <Field label="Condition">
            <TextArea
              placeholder="How're you doing?"
              value={character.condition}
              onChange={(e) => onCharacterChange({ condition: e.target.value })}
              className={textAreaClass}
            />
          </Field>
        </div>
      </div>

      <hr className={dividerClass} />

      <section>
        <h3 className={labelTextClass}>Actions</h3>
        <div className="flex flex-wrap gap-4 [&>*]:basis-48 [&>*]:flex-1">
          {entriesTyped(characterActionLibrary).map(([category, actions]) => (
            <section
              key={category}
              className="flex flex-col rounded-md bg-black/25 p-4"
            >
              <h4 className="mb-4 text-center text-xl  leading-tight tracking-wide">
                {category}
              </h4>
              <div className="grid gap-4">
                {actions.map((action) => (
                  <section
                    key={action}
                    className="grid grid-flow-row grid-cols-[1fr,auto] grid-rows-[auto,auto]"
                  >
                    <h5 className={labelTextClass}>{action}</h5>
                    <div className="row-span-2 flex items-end">
                      {/* <CharacterActionRollButton
                        name={character.name}
                        action={action}
                        level={character.actionLevels[action] ?? 0}
                      /> */}
                    </div>
                    <DotCounter
                      value={character.actionLevels[action] ?? 0}
                      max={4}
                      onChange={(level) => {
                        onCharacterChange({
                          actionLevels: {
                            ...character.actionLevels,
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
          />
        </Field>
        <Field label="Appearance">
          <TextArea
            placeholder="How do you look? What do you like to wear?"
            value={character.appearance}
            onChange={(e) => onCharacterChange({ appearance: e.target.value })}
            className={textAreaClass}
          />
        </Field>
        <Field label="Ties">
          <TextArea
            placeholder="Who are your friends and enemies?"
            value={character.ties}
            onChange={(e) => onCharacterChange({ ties: e.target.value })}
            className={textAreaClass}
          />
        </Field>
        <Field label="Talents">
          <TextArea
            placeholder="stat buffs stat buffs stat buffs"
            value={character.talents}
            onChange={(e) => onCharacterChange({ talents: e.target.value })}
            className={textAreaClass}
          />
        </Field>
      </div>

      <hr className={dividerClass} />

      {footer}
    </div>
  )
}
