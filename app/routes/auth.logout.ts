import type { LoaderArgs } from "@remix-run/node"
import { env } from "~/env.server"
import { destroySession, getSession } from "~/session.server"

export async function loader({ request }: LoaderArgs) {
  const sessionId = getSession(request.headers.get("Cookie"))
  await fetch(`${env.CONVEX_HTTP_URL}/auth/logout?sessionId=${sessionId}`)
  return destroySession()
}
