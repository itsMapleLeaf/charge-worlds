import { redirect } from "@remix-run/node"
import { route } from "routes-gen"
import { defaultWorldId } from "../world/world-db.server"

export function loader() {
  return redirect(
    route("/worlds/:worldId/dashboard", { worldId: defaultWorldId }),
  )
}
