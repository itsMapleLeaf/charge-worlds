import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { AuthContext } from "../auth/auth-context"
import { requireMembership } from "../auth/membership"
import { requireSessionUser } from "../auth/session"
import { Clock } from "../clocks/clock"
import { db } from "../core/db.server"
import { FormAction, FormActionGroup } from "../helpers/form"
import { parseKeys } from "../helpers/parse-keys"
import { useDebouncedCallback } from "../helpers/use-debounced-callback"
import { clearButtonClass } from "../ui/styles"
import { getWorld } from "../world/world-db.server"

function parsePositiveInteger(input: unknown) {
  const value = Number(input)
  if (Number.isInteger(value) && value > 0) return value
  throw new Error("Must be a positive integer")
}

const addClockAction = new FormAction({
  fields: {},
  async action(values, { params }) {
    await db.clock.create({
      data: {
        worldId: params.worldId!,
      },
    })
  },
})

const removeClockAction = new FormAction({
  fields: {
    clockId: z.string(),
  },
  async action(values) {
    await db.clock.delete({
      where: { id: values.clockId },
    })
  },
})

const updateClockAction = new FormAction({
  fields: {
    clockId: z.string(),
    name: z.string().max(64).optional(),
    progress: z.string().transform(parsePositiveInteger).optional(),
    maxProgress: z.string().transform(parsePositiveInteger).optional(),
  },
  async action({ clockId, ...data }) {
    await db.clock.update({
      where: { id: clockId },
      data,
    })
  },
})

const actionGroup = new FormActionGroup({
  addClock: addClockAction,
  removeClock: removeClockAction,
  updateClock: updateClockAction,
})

export async function action({ request, params, ...args }: ActionArgs) {
  const { worldId } = parseKeys(params, ["worldId"])

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(worldId),
  ])
  await requireMembership(user, world)

  return actionGroup.handleSubmit({ request, params, ...args })
}

export type ClockType = {
  id: string
  name: string
  progress: number
  maxProgress: number
}

export function ClocksManager({ clocks: clocksProp }: { clocks: ClockType[] }) {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const thisRoute = route("/worlds/:worldId/clocks", { worldId })
  const fetcher = useFetcher<typeof action>()
  const submitDebounced = useDebouncedCallback(fetcher.submit, 500)

  const auth = useContext(AuthContext)
  const isSpectator = !auth.membership

  const [clocks, setClocks] = useState(clocksProp)
  useEffect(() => setClocks(clocksProp), [clocksProp])

  const updateClock = (data: {
    id: string
    name?: string
    progress?: number
    maxProgress?: number
  }) => {
    setClocks(
      clocks.map((clock) =>
        clock.id === data.id ? { ...clock, ...data } : clock,
      ),
    )

    submitDebounced(
      actionGroup.formData("updateClock", {
        clockId: data.id,
        name: data.name,
        progress:
          typeof data.progress === "number" ? String(data.progress) : undefined,
        maxProgress:
          typeof data.maxProgress === "number"
            ? String(data.maxProgress)
            : undefined,
      }),
      { action: thisRoute, method: "post" },
    )
  }

  const removeClock = (id: string) => {
    setClocks(clocks.filter((clock) => clock.id !== id))

    submitDebounced(actionGroup.formData("removeClock", { clockId: id }), {
      action: thisRoute,
      method: "post",
    })
  }

  return (
    <div className="grid gap-4 p-4">
      {clocks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 ">
          {clocks.map((clock) => (
            <div key={clock.id} className="rounded-md bg-black/25 p-4">
              {isSpectator ? (
                <Clock {...clock} onProgressChange={() => {}} />
              ) : (
                <Clock
                  {...clock}
                  onNameChange={(name) => {
                    updateClock({ id: clock.id, name })
                  }}
                  onProgressChange={(progress) => {
                    updateClock({ id: clock.id, progress })
                  }}
                  onMaxProgressChange={(maxProgress) => {
                    updateClock({ id: clock.id, maxProgress })
                  }}
                  onRemove={() => {
                    removeClock(clock.id)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {isSpectator ? undefined : (
        <fetcher.Form
          action={thisRoute}
          method="post"
          className="flex justify-center"
        >
          <input {...actionGroup.types.addClock} />
          <button className={clearButtonClass}>
            <Plus />
            Add clock
          </button>
        </fetcher.Form>
      )}
    </div>
  )
}
