import { redirect } from "@remix-run/node"
import { route } from "routes-gen"
import { db } from "../modules/app/db.server"
import { createWorld } from "../modules/world/world-db.server"

export async function loader() {
  const defaultWorld =
    (await db.world.findFirst({
      orderBy: { createdAt: "desc" },
    })) ?? (await createWorld())

  return redirect(
    route("/worlds/:worldId/dashboard", { worldId: defaultWorld.id }),
  )
}
