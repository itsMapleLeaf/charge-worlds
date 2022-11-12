import type { ActionArgs } from "@remix-run/node"
import { useFetcher, useParams } from "@remix-run/react"
import { Plus } from "lucide-react"
import { useContext } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { AuthContext } from "../auth/auth-context"
import { requireMembership } from "../auth/membership"
import { requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { FormAction, FormActionGroup } from "../helpers/form"
import { parseKeys } from "../helpers/parse-keys"
import { parseUnsignedInteger } from "../helpers/parse-unsigned-integer"
import { ClockInput } from "../ui/clock-input"
import { clearButtonClass } from "../ui/styles"
import { getWorld } from "../world/world-db.server"
import { emitWorldUpdate } from "./worlds.$worldId.events/emitter"

const addClockAction = new FormAction({
  fields: {},
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    await db.clock.create({
      data: {
        worldId: params.worldId!,
      },
    })
    emitWorldUpdate(params.worldId!, user.id)
  },
})

const removeClockAction = new FormAction({
  fields: {
    clockId: z.string(),
  },
  async action(values, { request, params }) {
    const user = await requireSessionUser(request)
    await db.clock.delete({
      where: { id: values.clockId },
    })
    emitWorldUpdate(params.worldId!, user.id)
  },
})

const updateClockAction = new FormAction({
  fields: {
    clockId: z.string(),
    name: z.string().max(64).optional(),
    progress: z.string().transform(parseUnsignedInteger).optional(),
    maxProgress: z.string().transform(parseUnsignedInteger).optional(),
  },
  async action({ clockId, ...data }, { request, params }) {
    const user = await requireSessionUser(request)
    await db.clock.update({
      where: { id: clockId },
      data,
    })
    emitWorldUpdate(params.worldId!, user.id)
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

export function ClocksManager(props: { clocks: ClockType[] }) {
  const { worldId } = parseKeys(useParams(), ["worldId"])
  const thisRoute = route("/worlds/:worldId/clocks", { worldId })
  const fetcher = useFetcher<typeof action>()

  const auth = useContext(AuthContext)
  const isSpectator = !auth.membership

  let clocks = props.clocks

  const updateSubmission = updateClockAction.parseSubmission(
    fetcher.submission?.formData,
  )
  if (updateSubmission) {
    clocks = clocks.map((clock) => {
      if (clock.id === updateSubmission.clockId) {
        return { ...clock, ...updateSubmission }
      }
      return clock
    })
  }

  const updateClock = (data: {
    id: string
    name?: string
    progress?: number
    maxProgress?: number
  }) => {
    fetcher.submit(
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
    fetcher.submit(actionGroup.formData("removeClock", { clockId: id }), {
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
                <ClockInput {...clock} onProgressChange={() => {}} />
              ) : (
                <ClockInput
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
