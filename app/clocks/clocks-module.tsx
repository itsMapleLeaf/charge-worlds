import { Clock, Plus } from "lucide-react"
import { z } from "zod"
import { defineLiveblocksMapCollection } from "~/liveblocks/collection"
import { useAuthContext } from "../auth/auth-context"
import { DashboardModule } from "../dashboard/dashboard-module"
import { ClockInput } from "../ui/clock-input"
import { clearButtonClass } from "../ui/styles"

const ClocksCollection = defineLiveblocksMapCollection(
  "clocks",
  z.object({
    id: z.string(),
    name: z.string(),
    progress: z.number(),
    maxProgress: z.number(),
  }),
)

export const clocksModule = new DashboardModule({
  name: "Clocks",
  description:
    "Track the progress of world forces, and other progressful things",
  icon: <Clock />,

  component: function ClocksModuleView() {
    const auth = useAuthContext()
    const clocks = ClocksCollection.useItems()
    const mutations = ClocksCollection.useMutations()

    return (
      <div className="grid gap-4 p-4">
        {clocks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 ">
            {clocks.map((clock) => (
              <div key={clock.id} className="rounded-md bg-black/25 p-4">
                {auth.isSpectator ? (
                  <ClockInput {...clock} onProgressChange={() => {}} />
                ) : (
                  <ClockInput
                    {...clock}
                    onNameChange={(name) => {
                      mutations.update({ id: clock.id, name })
                    }}
                    onProgressChange={(progress) => {
                      mutations.update({ id: clock.id, progress })
                    }}
                    onMaxProgressChange={(maxProgress) => {
                      mutations.update({ id: clock.id, maxProgress })
                    }}
                    onRemove={() => {
                      mutations.remove(clock.id)
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {auth.isSpectator ? undefined : (
          <div className="flex justify-center">
            <button
              className={clearButtonClass}
              onClick={() => {
                mutations.create({
                  name: "New clock",
                  progress: 0,
                  maxProgress: 4,
                })
              }}
            >
              <Plus />
              Add clock
            </button>
          </div>
        )}
      </div>
    )
  },
})
