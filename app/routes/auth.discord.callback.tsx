import type { LoaderArgs } from "@remix-run/node"
import { handleDiscordCallback } from "~/data/session.server"

export async function loader({ request }: LoaderArgs) {
  return handleDiscordCallback(request)
}
