import ExpandingTextArea from "react-expanding-textarea"
import type { Character } from "../data/character-collections"
import { ClockInput } from "./clock-input"
import { Counter } from "./counter"
import { Field } from "./field"
import { RichImage } from "./rich-image"

// TODO: split this up in components named by what they are,
// instead of one megacomponent named for where it is
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
      <div className="panel min-h-[16rem] overflow-clip">
        <RichImage src={character.imageUrl ?? undefined} />
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
            className="input panel"
            readOnly={isSpectator}
          />
        </Field>
        <Field label="Reference image">
          <input
            className="input panel"
            placeholder="https://the/image.png"
            value={character.imageUrl ?? ""}
            onChange={(event) => {
              onCharacterChange({ imageUrl: event.target.value })
            }}
            readOnly={isSpectator}
          />
        </Field>
        <section className="grid gap-2">
          <h2 className="label">Momentum</h2>
          <div className="panel grid h-12 place-items-center">
            {isSpectator ? (
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
        <div className="panel flex flex-1 items-center justify-center p-4">
          <ClockInput
            name="Stress"
            progress={character.stress}
            maxProgress={6}
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
            className="textarea panel"
            readOnly={isSpectator}
          />
        </Field>
      </div>
    </div>
  )
}
