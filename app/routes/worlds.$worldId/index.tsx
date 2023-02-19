import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { route } from "routes-gen"
import { assert } from "../../helpers/assert"

export function loader({ params }: LoaderArgs) {
  assert(params.worldId, "worldId is required")
  return redirect(
    route(`/worlds/:worldId/dashboard`, { worldId: params.worldId }),
  )
}
