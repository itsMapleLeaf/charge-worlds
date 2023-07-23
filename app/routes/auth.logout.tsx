import type { LoaderArgs } from "@remix-run/node"
import { logout } from "~/data/session.server"

export async function loader({ request }: LoaderArgs) {
  return logout(request)
}
