import { useAutoAnimate } from "@formkit/auto-animate/react"
import { cx } from "class-variance-authority"
import clsx from "clsx"
import { ChevronDown, ChevronUp, ListPlus, X } from "lucide-react"
import { useId } from "react"
import TextArea from "react-expanding-textarea"
import { CharacterFieldCollection } from "~/modules/characters/collections"
import { button, clearButton } from "~/modules/ui/button"
import { checkbox, input, textArea } from "~/modules/ui/input"
import { panel } from "~/modules/ui/panel"

export default function CharacterFieldsPage() {
  const fields = CharacterFieldCollection.useItems()
  const mutations = CharacterFieldCollection.useMutations()
  const [autoAnimateRef] = useAutoAnimate()
  return (
    <section>
      <div className={cx(panel(), "mb-4 grid gap-4 p-4")} ref={autoAnimateRef}>
        <h2 className="text-3xl font-light">Character Fields</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="border-b border-white/10">
            <CharacterFieldForm field={field} index={index} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className={button()}
        onClick={() => mutations.append({ id: crypto.randomUUID() })}
      >
        <ListPlus /> Add field
      </button>
    </section>
  )
}

function CharacterFieldForm({
  field,
  index,
}: {
  field: { id: string; description: string; name: string; isLong: boolean }
  index: number
}) {
  const fields = CharacterFieldCollection.useItems()
  const mutations = CharacterFieldCollection.useMutations()

  const nameId = useId()
  const descriptionId = useId()
  const isLongId = useId()

  const labelClass = clsx("select-none pt-3 font-medium leading-tight")

  return (
    <div className="grid auto-rows-[minmax(3rem,auto)] grid-cols-[auto,1fr] gap-x-4 gap-y-1">
      <label className={labelClass} htmlFor={nameId}>
        Label
      </label>
      <input
        id={nameId}
        placeholder="Field name"
        className={input()}
        value={field.name}
        onChange={(event) => {
          mutations.update(index, { name: event.target.value })
        }}
      />

      <label className={labelClass} htmlFor={descriptionId}>
        Description
      </label>
      <TextArea
        id={descriptionId}
        placeholder="Tell players what to put here."
        className={textArea()}
        rows={2}
        value={field.description}
        onChange={(event) => {
          mutations.update(index, { description: event.target.value })
        }}
      />

      <label className={labelClass} htmlFor={isLongId}>
        Multiline
      </label>
      <div className="flex items-start gap-2 pt-3 leading-tight">
        <input
          id={isLongId}
          type="checkbox"
          className={checkbox()}
          checked={field.isLong}
          onChange={(event) => {
            mutations.update(index, { isLong: event.target.checked })
          }}
        />

        <div className="flex-1" />

        {index > 0 && (
          <button
            type="button"
            title="Move field up"
            className={clearButton()}
            onClick={() => {
              mutations.move(index, index - 1)
            }}
          >
            <ChevronUp />
          </button>
        )}
        {index < fields.length - 1 && (
          <button
            type="button"
            title="Move field down"
            className={clearButton()}
            onClick={() => {
              mutations.move(index, index + 1)
            }}
          >
            <ChevronDown />
          </button>
        )}

        <button
          title={`Remove ${field.name}`}
          className={clearButton()}
          onClick={() => {
            mutations.remove(index)
          }}
        >
          <X />
        </button>
      </div>
    </div>
  )
}
