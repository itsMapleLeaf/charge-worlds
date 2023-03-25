import { Dices } from "lucide-react"
import { useRef } from "react"
import { Emitter, useEmitterCallback } from "~/helpers/emitter"
import { randomIntInclusive } from "~/helpers/random"
import { Store, useStore } from "~/helpers/store"
import { DiceRollCollection } from "~/modules/dice/collections"
import { DiceRollList } from "~/modules/dice/dice-roll-list"
import { Counter } from "~/modules/ui/counter"
import { useAuthContext } from "../app/auth"
import { clearButton } from "../ui/button"
import { input } from "../ui/input"
import { WorldContext } from "../world/world-context"

const intentStore = new Store("")
const poolSizeStore = new Store(1)
const focusEmitter = new Emitter<void>()

export function setRoll(intent: string, poolSize: number) {
  intentStore.set(intent)
  poolSizeStore.set(poolSize)
  focusEmitter.emit()
}

export function DicePanel() {
  const rolls = DiceRollCollection.useItems()
  const { isSpectator } = WorldContext.useValue()
  return (
    <div className="flex h-full flex-col divide-y divide-white/10">
      <section className="min-h-0 flex-1">
        <DiceRollList rolls={rolls} />
      </section>
      {isSpectator ? null : <DiceRollForm />}
    </div>
  )
}

function DiceRollForm() {
  const mutations = DiceRollCollection.useMutations()
  const rolls = DiceRollCollection.useItems()
  const intent = useStore(intentStore)
  const poolSize = useStore(poolSizeStore)
  const intentRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthContext()

  useEmitterCallback(focusEmitter, () => {
    intentRef.current?.focus()
  })

  const handleRoll = () => {
    if (!user) return

    const diceCount = poolSize <= 0 ? 2 : poolSize
    const resultType = poolSize <= 0 ? "lowest" : "highest"

    const dice = Array.from({ length: diceCount }, () => ({
      sides: 6,
      result: randomIntInclusive(1, 6),
    }))

    mutations.append({
      dice,
      resultType,
      intent,
      rolledBy: user.id,
      rolledAt: new Date().toISOString(),
    })

    for (let i = 0; i < rolls.length - 100; i++) {
      mutations.remove(0)
    }
  }

  return (
    <form
      className="flex flex-col divide-y divide-white/10"
      onSubmit={(event) => {
        event.preventDefault()
        handleRoll()
      }}
    >
      <input
        value={intent}
        onChange={(event) => intentStore.set(event.target.value)}
        className={input({ border: "none" })}
        placeholder="Intent (e.g. Move +1)"
        maxLength={128}
        ref={intentRef}
        onFocus={(event) => {
          setTimeout(() => event.target.select())
        }}
      />
      <div className="flex items-center justify-between gap-2 p-3">
        <button type="submit" className={clearButton()}>
          <Dices /> Roll
        </button>
        <Counter
          value={poolSize}
          onChange={poolSizeStore.set}
          min={Number.NEGATIVE_INFINITY}
          max={Number.POSITIVE_INFINITY}
        />
      </div>
    </form>
  )
}