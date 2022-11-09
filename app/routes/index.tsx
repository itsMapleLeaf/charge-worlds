import { redirect } from "@remix-run/node"
import { route } from "routes-gen"
import { db } from "../core/db.server"

export async function loader() {
  const world =
    (await db.world.findFirst({
      orderBy: { createdAt: "desc" },
    })) ?? (await db.world.create({ data: { name: "New World" } }))
  return redirect(route("/worlds/:worldId/dashboard", { worldId: world.id }))
}
