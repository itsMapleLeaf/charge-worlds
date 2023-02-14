import { Inngest } from "inngest"
import { serve } from "inngest/remix"
import prettyBytes from "pretty-bytes"
import { db } from "~/modules/app/db.server"
import { createWorldSnapshot } from "~/modules/world/world-snapshots"

type Events = {
  "world/create-snapshot": {
    name: "world/create-snapshot"
    data: {
      world: {
        id: string
        name: string
      }
    }
  }
}

const inngest = new Inngest<Events>({
  name: "Charge Worlds",
})

const sendWorldSnapshotEvents = inngest.createFunction(
  { name: "Send world snapshot events" },
  { cron: "0 0 * * MON" },
  async () => {
    const worlds = await db.world.findMany({
      select: { id: true, name: true },
    })
    await inngest.send(
      worlds.map((world) => ({
        name: "world/create-snapshot",
        data: { world },
      })),
    )
    return { message: `Sent ${worlds.length} events` }
  },
)

const createWorldSnapshotFunction = inngest.createFunction(
  { name: "Create world snapshot" },
  { event: "world/create-snapshot" },
  async ({ event }) => {
    const result = await createWorldSnapshot(event.data.world)
    return result
      ? {
          message: `Created snapshot for ${
            event.data.world.name
          } (${prettyBytes(result.size)})`,
        }
      : {
          message: `Skipped snapshot for ${event.data.world.name}`,
        }
  },
)

const handle = serve(inngest, [
  sendWorldSnapshotEvents,
  createWorldSnapshotFunction,
])
export { handle as loader, handle as action }
