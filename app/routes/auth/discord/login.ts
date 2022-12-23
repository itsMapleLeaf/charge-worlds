import { type LoaderArgs, type ActionArgs } from "@remix-run/node"
import { authenticateWithDiscord } from "~/auth.server"

export async function loader({ request }: LoaderArgs) {
  return authenticateWithDiscord(request)
}

export async function action({ request }: ActionArgs) {
  return authenticateWithDiscord(request)
}
