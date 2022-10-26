import { Dices } from "lucide-react"
import { useRef } from "react"
import { Emitter, useEmitterCallback } from "../helpers/emitter"
import { Store, useStore } from "../helpers/store"
import { Counter } from "../ui/counter"
import { clearButtonClass, inputClass } from "../ui/styles"

const intentStore = new Store("")
const poolSizeStore = new Store(0)
const focusEmitter = new Emitter<void>()

export function setRoll(intent: string, poolSize: number) {
  intentStore.set(intent)
  poolSizeStore.set(poolSize)
  focusEmitter.emit()
}

export function DiceRollForm({
  onSubmit,
}: {
  onSubmit: (intent: string, poolSize: number) => void
}) {
  const intent = useStore(intentStore)
  const poolSize = useStore(poolSizeStore)
  const intentRef = useRef<HTMLInputElement>(null)

  useEmitterCallback(focusEmitter, () => {
    intentRef.current?.focus()
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(intent, poolSize)
      }}
      className="flex flex-col gap-3"
    >
      <div className="col-span-2">
        <input
          value={intent}
          onChange={(event) => intentStore.set(event.target.value)}
          className={inputClass}
          placeholder="Intent (e.g. Move +1)"
          maxLength={128}
          ref={intentRef}
          onFocus={(event) => {
            setTimeout(() => event.target.select())
          }}
        />
      </div>
      <div className="flex gap-2">
        <Counter
          value={poolSize}
          onChange={poolSizeStore.set}
          min={Number.NEGATIVE_INFINITY}
          max={Number.POSITIVE_INFINITY}
        />
        <div className="flex-1" />
        <button type="submit" className={clearButtonClass}>
          <Dices /> Roll
        </button>
      </div>
    </form>
  )
}
