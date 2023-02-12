import clsx from "clsx"
import ExpandingTextArea from "react-expanding-textarea"
import { ClockInput } from "../ui/clock-input"
import { Counter } from "../ui/counter"
import { Field } from "../ui/field"
import { inputClass, labelTextClass, textAreaClass } from "../ui/styles"
import { CharacterImage } from "./character-image"
import type { Character } from "./collections"

export function CharacterPrimaryInfoEditor({
  character,
  onCharacterChange,
  isSpectator,
  isGameMaster,
}: {
  character: Character
  onCharacterChange: (character: Partial<Character>) => void
  isSpectator: boolean
  isGameMaster: boolean
}) {
  return (
    <div className="flex flex-wrap gap-4 [&>*]:flex-1 [&>*]:basis-48">
      <div className="min-h-[16rem]">
        <CharacterImage src={character.imageUrl ?? undefined} />
      </div>

      <div className="grid content-between gap-4">
        <Field label="Name">
          <input
            type="text"
            placeholder="What should we call you?"
            value={character.name}
            onChange={(event) => {
              onCharacterChange({ name: event.target.value })
            }}
            className={inputClass}
            readOnly={isSpectator}
          />
        </Field>
        <Field label="Reference image">
          <input
            className={inputClass}
            placeholder="https://the/image.png"
            value={character.imageUrl ?? ""}
            onChange={(event) => {
              onCharacterChange({ imageUrl: event.target.value })
            }}
            readOnly={isSpectator}
          />
        </Field>
        <section className="grid gap-2">
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
        <div className="flex flex-1 items-center justify-center rounded-md bg-black/25 p-4">
          <ClockInput
            name="Stress"
            progress={character.stress}
            maxProgress={4}
            onProgressChange={(stress) => {
              isGameMaster && onCharacterChange({ stress })
            }}
          />
        </div>
        <Field label="Condition">
          <ExpandingTextArea
            placeholder="How're you doing?"
            value={character.condition}
            onChange={(event) => {
              onCharacterChange({ condition: event.target.value })
            }}
            className={textAreaClass}
            readOnly={isSpectator}
          />
        </Field>
      </div>
    </div>
  )
}
