import { type ActionArgs } from "@remix-run/node"
import { logout } from "~/auth.server"

export function action({ request }: ActionArgs) {
  return logout(request)
}
