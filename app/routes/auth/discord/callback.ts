import { type LoaderArgs } from "@remix-run/node"
import { authenticateWithDiscord } from "~/auth.server"

export function loader({ request }: LoaderArgs) {
  return authenticateWithDiscord(request, {
    failureRedirect: "/",
    successRedirect: "/",
  })
}
