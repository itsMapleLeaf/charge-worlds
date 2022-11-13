import type { LoaderArgs } from "@remix-run/node"
import { route } from "routes-gen"
import { getSessionUser } from "../../auth/session.server"
import { eventStream, useEventSource } from "../../helpers/event-stream"
import { parseKeys } from "../../helpers/parse-keys"
import type { WorldEvent } from "./emitter"
import { getWorldEmitter, worldEventSchema } from "./emitter"

export async function loader({ request, params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])
  const user = await getSessionUser(request)
  return eventStream(request, (send) => {
    return getWorldEmitter(worldId).subscribe((event) => {
      if (event.sourceUserId !== user?.id) {
        send(JSON.stringify(event))
      }
    })
  })
}

export function useWorldEvents(
  worldId: string,
  callback: (event: WorldEvent) => void,
) {
  useEventSource(route("/worlds/:worldId/events", { worldId }), (data) =>
    callback(worldEventSchema.parse(JSON.parse(data))),
  )
}
