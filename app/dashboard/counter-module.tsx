import { z } from "zod"
import { clearButtonClass } from "../ui/styles"
import { defineModule } from "./dashboard-module"

export const counterModule = defineModule({
  name: "Counter",

  stateSchema: z.number(),
  initialState: 0,

  eventSchema: z.union([z.literal("increment"), z.literal("decrement")]),
  onEvent: ({ state, event, setState }) => {
    if (event === "increment") setState(state + 1)
    if (event === "decrement") setState(state - 1)
  },

  render: ({ state, send }) => (
    <div className="p-8 flex items-center gap-4">
      <button className={clearButtonClass} onClick={() => send("decrement")}>
        -
      </button>
      <p className="text-lg font-medium">{state}</p>
      <button className={clearButtonClass} onClick={() => send("increment")}>
        +
      </button>
    </div>
  ),
})
