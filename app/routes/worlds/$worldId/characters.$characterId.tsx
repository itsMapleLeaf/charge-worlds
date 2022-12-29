import { useParams } from "@remix-run/react"
import clsx from "clsx"
import { ImagePlus, Trash } from "lucide-react"
import { useId, type ReactNode } from "react"
import { ClockInput } from "~/ui/clock-input"
import { EmptyState } from "~/ui/empty-state"
import { NotFoundMessage } from "~/ui/not-found-message"
import { buttonStyle, inputStyle, labelStyle, panelStyle } from "~/ui/styles"
import { useWorldState } from "~/world-state"
import { DeleteCharacterButton } from "./delete-character"

export default function CharacterPage() {
  const world = useWorldState()
  const params = useParams()

  if (!world.characters.length) {
    return (
      <EmptyState>
        <p>No characters found</p>
      </EmptyState>
    )
  }

  const character =
    world.characters.find((character) => character.id === params.characterId) ??
    world.characters[0]

  if (!character) {
    return <NotFoundMessage />
  }

  return (
    <div className={panelStyle()}>
      <div className="flex flex-col gap-4 p-4">
        <section
          aria-label="Overview"
          className="flex flex-wrap gap-4 [&>*]:flex-1 [&>*]:basis-52"
        >
          <div
            className={clsx(
              panelStyle(),
              "flex min-h-[16rem] flex-col items-center justify-center gap-2",
            )}
          >
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt=""
                className="block h-64 w-full rounded-lg border-white/10 bg-white/10"
              />
            ) : (
              <>
                <ImagePlus className="opacity-50 s-16" />
                <p className="text-lg font-light">Add a reference image</p>
              </>
            )}
          </div>

          <div className="flex flex-col justify-between gap-4">
            <FieldLabel labelText="Name">
              {(props) => (
                <input
                  {...props}
                  className={inputStyle()}
                  placeholder="What should we call you?"
                  defaultValue={character.name}
                />
              )}
            </FieldLabel>
            <FieldLabel labelText="Reference Image">
              {(props) => (
                <input
                  {...props}
                  className={inputStyle()}
                  type="url"
                  placeholder="https://web.site/image.png"
                  defaultValue={character.imageUrl ?? ""}
                />
              )}
            </FieldLabel>
            <Label labelText="Momentum">
              <div className={inputStyle({ interactive: false })}>
                (momentum counter)
              </div>
            </Label>
          </div>

          <div className="flex flex-col gap-4">
            <section
              className={clsx(
                panelStyle(),
                "flex flex-1 flex-col items-center justify-center gap-2 p-2 text-center",
              )}
            >
              <h3 className="text-xl font-light leading-none">Stress</h3>
              <div className="mx-auto w-full max-w-24">
                <ClockInput value={2} max={4} onChange={() => {}} />
              </div>
            </section>
            <FieldLabel labelText="Condition">
              {(props) => (
                <input
                  {...props}
                  className={inputStyle()}
                  placeholder="How are you doing?"
                  defaultValue={character.condition}
                />
              )}
            </FieldLabel>
          </div>
        </section>
        <hr className="border-white/10" />
        <section aria-label="Stats">action levels</section>
        <hr className="border-white/10" />
        <section aria-label="Details">fields</section>
        <hr className="border-white/10" />
        <section aria-label="Actions" className="flex">
          <DeleteCharacterButton
            character={character}
            className={buttonStyle()}
          >
            <Trash /> Delete
          </DeleteCharacterButton>
        </section>
      </div>
    </div>
  )
}

function Label(props: { labelText: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <div className={labelStyle()}>{props.labelText}</div>
      <div>{props.children}</div>
    </div>
  )
}

function FieldLabel(props: {
  labelText: ReactNode
  children: (props: { id: string }) => ReactNode
}) {
  const id = useId()
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className={labelStyle()}>
        {props.labelText}
      </label>
      <div>{props.children({ id })}</div>
    </div>
  )
}
