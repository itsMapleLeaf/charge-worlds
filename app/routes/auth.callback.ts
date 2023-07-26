import type { LoaderArgs } from "@remix-run/node"
import { createSession } from "~/session.server"

export function loader({ request }: LoaderArgs) {
  const sesssionId = new URL(request.url).searchParams.get("sessionId")
  if (!sesssionId) {
    throw new Response("No session ID provided", { status: 400 })
  }
  return createSession(sesssionId)
}
