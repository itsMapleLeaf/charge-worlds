import cuid from "cuid"
import { Plus } from "lucide-react"
import { useContext } from "react"
import { z } from "zod"
import { AuthContext } from "../auth/auth-context"
import { defineModule } from "../dashboard/dashboard-module"
import { clearButtonClass } from "../ui/styles"
import { Clock } from "./clock"
import type { Clock as ClockType } from "./clock-schema"
import { clockSchema } from "./clock-schema"

export const clocksModule = defineModule({
  name: "Clocks",
  description:
    "Track the progress of world forces, and other progressful things",

  stateSchema: z.object({ clocks: z.array(clockSchema) }),
  initialState: { clocks: [] },

  eventSchema: z.union([
    z.object({ type: z.literal("add"), name: z.string() }),
    z.object({ type: z.literal("remove"), id: z.string() }),
    z.object({
      type: z.literal("update"),
      id: z.string(),
      data: clockSchema.partial(),
    }),
  ]),
  onEvent: ({ event, updateState }) => {
    if (event.type === "add") {
      updateState((state) => {
        state.clocks.push({
          id: cuid(),
          name: event.name,
          progress: 0,
          maxProgress: 4,
        })
      })
    }

    if (event.type === "remove") {
      updateState((state) => {
        state.clocks = state.clocks.filter((clock) => clock.id !== event.id)
      })
    }

    if (event.type === "update") {
      updateState((state) => {
        const clock = state.clocks.find((clock) => clock.id === event.id)
        if (!clock) return
        Object.assign(clock, event.data)
      })
    }
  },

  render: ({ state: { clocks }, send }) => (
    <ClockManager
      clocks={clocks}
      onAdd={(name) => send({ type: "add", name })}
      onRemove={(id) => send({ type: "remove", id })}
      onUpdate={(id, data) => send({ type: "update", id, data })}
    />
  ),
})

function ClockManager({
  clocks,
  onAdd,
  onRemove,
  onUpdate,
}: {
  clocks: ClockType[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, data: Partial<ClockType>) => void
}) {
  const auth = useContext(AuthContext)
  const isSpectator = !auth.membership
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
                    onUpdate(clock.id, { name })
                  }}
                  onProgressChange={(progress) => {
                    onUpdate(clock.id, { progress })
                  }}
                  onMaxProgressChange={(maxProgress) => {
                    onUpdate(clock.id, { maxProgress })
                  }}
                  onRemove={() => {
                    onRemove(clock.id)
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      {isSpectator ? undefined : (
        <div className="flex justify-center">
          <button
            type="button"
            className={clearButtonClass}
            onClick={() => {
              onAdd("New Clock")
            }}
          >
            <Plus />
            Add clock
          </button>
        </div>
      )}
    </div>
  )
}
