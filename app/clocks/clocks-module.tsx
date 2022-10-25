import { Plus } from "lucide-react"
import { z } from "zod"
import { defineModule } from "../dashboard/dashboard-module"
import { clearButtonClass } from "../ui/styles"
import { Clock } from "./clock"
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
          id: Math.random().toString(),
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
    <div className="grid gap-4 p-4">
      {clocks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 ">
          {clocks.map((clock) => (
            <Clock
              key={clock.id}
              {...clock}
              onNameChange={(name) => {
                send({ type: "update", id: clock.id, data: { name } })
              }}
              onProgressChange={(progress) => {
                send({ type: "update", id: clock.id, data: { progress } })
              }}
              onMaxProgressChange={(maxProgress) => {
                send({
                  type: "update",
                  id: clock.id,
                  data: { maxProgress },
                })
              }}
              onRemove={() => {
                send({ type: "remove", id: clock.id })
              }}
            />
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <button
          type="button"
          className={clearButtonClass}
          onClick={() => {
            send({ type: "add", name: "New Clock" })
          }}
        >
          <Plus />
          Add clock
        </button>
      </div>
    </div>
  ),
})
