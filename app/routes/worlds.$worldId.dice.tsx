import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { Dices } from "lucide-react"
import { useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import type { DiceResultType } from "../generated/prisma"
import { Emitter, useEmitterCallback } from "../helpers/emitter"
import { FormAction, FormActionGroup } from "../helpers/form"
import { parseKeys } from "../helpers/parse-keys"
import { Store, useStore } from "../helpers/store"
import { Counter } from "../ui/counter"
import { clearButtonClass, inputClass } from "../ui/styles"
import { getWorldEmitter } from "./worlds.$worldId.events/emitter"

const addDiceLog = new FormAction({
  fields: {
    pool: z
      .string()
      .transform((value) => z.number().int().parse(Number(value))),
    intent: z.string().optional(),
  },
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    const { worldId } = parseKeys(params, ["worldId"])
    // eslint-disable-next-line unicorn/prefer-node-protocol
    const crypto = await import("crypto")

    const diceCount = values.pool <= 0 ? 2 : values.pool
    const resultType: DiceResultType = values.pool <= 0 ? "LOWEST" : "HIGHEST"

    const dice = Array.from({ length: diceCount }, () => ({
      sides: 6,
      result: crypto.randomInt(1, 7),
    }))

    await db.diceLog.create({
      data: {
        worldId,
        rolledById: user.id,
        intent: values.intent ?? "",
        dice,
        resultType,
      },
    })

    getWorldEmitter(worldId).emit("update")
  },
})

const actions = new FormActionGroup({
  addDiceLog,
})

export async function action(args: ActionArgs) {
  return actions.handleSubmit(args)
}

const intentStore = new Store("")
const poolSizeStore = new Store(1)
const focusEmitter = new Emitter<void>()

export function setRoll(intent: string, poolSize: number) {
  intentStore.set(intent)
  poolSizeStore.set(poolSize)
  focusEmitter.emit()
}

export function DiceRollForm() {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const fetcher = useFetcher()
  const intent = useStore(intentStore)
  const poolSize = useStore(poolSizeStore)
  const intentRef = useRef<HTMLInputElement>(null)

  useEmitterCallback(focusEmitter, () => {
    intentRef.current?.focus()
  })

  return (
    <fetcher.Form
      action={route("/worlds/:worldId/dice", { worldId })}
      method="post"
      className="flex flex-col gap-3"
    >
      <input {...actions.types.addDiceLog} />
      <div className="col-span-2">
        <input
          {...addDiceLog.fields.intent.input}
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
        <input {...addDiceLog.fields.pool.hidden(String(poolSize))} />
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
    </fetcher.Form>
  )
}
