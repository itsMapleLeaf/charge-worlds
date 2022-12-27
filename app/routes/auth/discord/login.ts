import { type ActionArgs } from "@remix-run/node"
import { authenticateWithDiscord } from "~/auth.server"

export async function action({ request }: ActionArgs) {
  return authenticateWithDiscord(request)
}
