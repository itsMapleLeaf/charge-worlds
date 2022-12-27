import { type ActionArgs } from "@remix-run/node"
import { authenticateWithDiscord } from "~/auth.server"

export async function loader({ request }: ActionArgs) {
  return authenticateWithDiscord(request)
}
