import type { LoaderArgs } from "@remix-run/node"
import { useEffect } from "react"
import { route } from "routes-gen"
import { getSessionUser } from "../../auth/session.server"
import { eventStream } from "../../helpers/event-stream"
import { parseKeys } from "../../helpers/parse-keys"
import { useLatestRef } from "../../helpers/react"
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
  const callbackRef = useLatestRef(callback)
  useEffect(() => {
    const source = new EventSource(
      route("/worlds/:worldId/events", { worldId }),
    )
    source.addEventListener("message", (event) => {
      callbackRef.current(worldEventSchema.parse(JSON.parse(event.data)))
    })
    return () => source.close()
  }, [callbackRef, worldId])
}
