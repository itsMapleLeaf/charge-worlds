import type { LoaderArgs } from "@remix-run/node"
import { eventStream } from "../../helpers/event-stream"
import { parseKeys } from "../../helpers/parse-keys"
import { getWorldEmitter } from "./emitter"

export function loader({ request, params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])
  return eventStream(request, (send) => {
    return getWorldEmitter(worldId).subscribe(send)
  })
}
