import { Dices } from "lucide-react"
import { useRef } from "react"
import { randomIntInclusive } from "~/helpers/random"
import { useAuthContext } from "~/modules/auth/auth-context"
import { Emitter, useEmitterCallback } from "../../helpers/emitter"
import { Store, useStore } from "../../helpers/store"
import { DashboardModule } from "../dashboard/dashboard-module"
import { Counter } from "../ui/counter"
import { clearButtonClass, inputClass } from "../ui/styles"
import { DiceRollCollection } from "./collections"
import { DiceRollList } from "./dice-roll-list"

const intentStore = new Store("")
const poolSizeStore = new Store(1)
const focusEmitter = new Emitter<void>()

export function setRoll(intent: string, poolSize: number) {
  intentStore.set(intent)
  poolSizeStore.set(poolSize)
  focusEmitter.emit()
}

export const diceModule = new DashboardModule({
  name: "Dice",
  description: "Roll some dice!",
  icon: <Dices />,
  component: function DiceModule() {
    const rolls = DiceRollCollection.useItems()
    const { isSpectator } = useAuthContext()
    return (
      <div className="flex h-full flex-col divide-y-2 divide-slate-900">
        <section className="min-h-0 flex-1">
          <DiceRollList rolls={rolls} />
        </section>
        {isSpectator ? null : (
          <div className="p-4">
            <DiceRollForm />
          </div>
        )}
      </div>
    )
  },
})

export function DiceRollForm() {
  const mutations = DiceRollCollection.useMutations()
  const rolls = DiceRollCollection.useItems()
  const intent = useStore(intentStore)
  const poolSize = useStore(poolSizeStore)
  const intentRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthContext()

  useEmitterCallback(focusEmitter, () => {
    intentRef.current?.focus()
  })

  const handleRoll = async () => {
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
    <section className="flex flex-col gap-3">
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
        <button type="button" className={clearButtonClass} onClick={handleRoll}>
          <Dices /> Roll
        </button>
      </div>
    </section>
  )
}
