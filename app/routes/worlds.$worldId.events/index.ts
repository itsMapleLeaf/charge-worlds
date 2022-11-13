import type { LoaderArgs } from "@remix-run/node"
import { route } from "routes-gen"
import { parseKeys } from "../../helpers/parse-keys"
import { eventStream, useEventSource } from "../../helpers/sse"
import type { WorldEvent } from "./emitter"
import { getWorldEmitter } from "./emitter"

export async function loader({ request, params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])
  return eventStream<WorldEvent>(request, (send) => {
    return getWorldEmitter(worldId).subscribe(send)
  })
}

export function useWorldEvents(
  worldId: string,
  callback: (event: WorldEvent) => void,
) {
  useEventSource<typeof loader>(
    route("/worlds/:worldId/events", { worldId }),
    callback,
  )
}
